-- Basis Tracker - Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================
-- TABLE: zip_centroids
-- Stores ZIP code centroid coordinates
-- ============================================
CREATE TABLE IF NOT EXISTS zip_centroids (
    zip TEXT PRIMARY KEY,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_zip_centroids_coords ON zip_centroids (lat, lng);

-- ============================================
-- TABLE: facilities
-- Grain elevators, buyers, etc.
-- ============================================
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_facilities_coords ON facilities (lat, lng);
CREATE INDEX idx_facilities_state ON facilities (state);
CREATE INDEX idx_facilities_name ON facilities USING gin (to_tsvector('english', name));

-- ============================================
-- TABLE: basis_reports
-- User-submitted basis observations
-- ============================================
CREATE TABLE IF NOT EXISTS basis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    commodity TEXT NOT NULL CHECK (commodity IN ('corn', 'soybeans')),
    futures_month TEXT NOT NULL CHECK (futures_month IN ('H', 'K', 'N', 'U', 'Z')),
    basis_cents INTEGER NOT NULL,
    observed_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_basis_reports_facility ON basis_reports (facility_id);
CREATE INDEX idx_basis_reports_commodity ON basis_reports (commodity);
CREATE INDEX idx_basis_reports_observed ON basis_reports (observed_at DESC);
CREATE INDEX idx_basis_reports_user ON basis_reports (user_id);

-- ============================================
-- TABLE: saved_facilities
-- User's saved/favorite facilities
-- ============================================
CREATE TABLE IF NOT EXISTS saved_facilities (
    user_id UUID NOT NULL,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, facility_id)
);

CREATE INDEX idx_saved_facilities_user ON saved_facilities (user_id);

-- ============================================
-- FUNCTION: haversine_distance
-- Calculate distance in miles between two points
-- ============================================
CREATE OR REPLACE FUNCTION haversine_distance(
    lat1 DOUBLE PRECISION,
    lng1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 3958.8; -- Earth radius in miles
    dlat DOUBLE PRECISION;
    dlng DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ^ 2;
    c := 2 * asin(sqrt(a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNCTION: get_nearby_facilities
-- Returns facilities within radius_miles of a point
-- ============================================
CREATE OR REPLACE FUNCTION get_nearby_facilities(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_miles DOUBLE PRECISION DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    company TEXT,
    city TEXT,
    state TEXT,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distance_miles DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.name,
        f.company,
        f.city,
        f.state,
        f.address,
        f.lat,
        f.lng,
        haversine_distance(p_lat, p_lng, f.lat, f.lng) AS distance_miles
    FROM facilities f
    WHERE haversine_distance(p_lat, p_lng, f.lat, f.lng) <= p_radius_miles
    ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNCTION: get_current_basis
-- Returns median basis for facility/commodity/month in last 24h (or 72h if stale)
-- ============================================
CREATE OR REPLACE FUNCTION get_current_basis(
    p_facility_id UUID,
    p_commodity TEXT,
    p_futures_month TEXT
)
RETURNS TABLE (
    median_basis INTEGER,
    report_count BIGINT,
    is_stale BOOLEAN,
    last_updated TIMESTAMPTZ
) AS $$
DECLARE
    v_median INTEGER;
    v_count BIGINT;
    v_last_updated TIMESTAMPTZ;
BEGIN
    -- Try last 24 hours first
    SELECT
        percentile_cont(0.5) WITHIN GROUP (ORDER BY basis_cents)::INTEGER,
        COUNT(*),
        MAX(observed_at)
    INTO v_median, v_count, v_last_updated
    FROM basis_reports
    WHERE facility_id = p_facility_id
      AND commodity = p_commodity
      AND futures_month = p_futures_month
      AND observed_at >= now() - INTERVAL '24 hours';

    IF v_count > 0 THEN
        RETURN QUERY SELECT v_median, v_count, false, v_last_updated;
        RETURN;
    END IF;

    -- Fallback to 72 hours (stale)
    SELECT
        percentile_cont(0.5) WITHIN GROUP (ORDER BY basis_cents)::INTEGER,
        COUNT(*),
        MAX(observed_at)
    INTO v_median, v_count, v_last_updated
    FROM basis_reports
    WHERE facility_id = p_facility_id
      AND commodity = p_commodity
      AND futures_month = p_futures_month
      AND observed_at >= now() - INTERVAL '72 hours';

    IF v_count > 0 THEN
        RETURN QUERY SELECT v_median, v_count, true, v_last_updated;
        RETURN;
    END IF;

    -- No data
    RETURN QUERY SELECT NULL::INTEGER, 0::BIGINT, true, NULL::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNCTION: get_basis_trend
-- Returns daily median basis for last 30 days
-- ============================================
CREATE OR REPLACE FUNCTION get_basis_trend(
    p_facility_id UUID,
    p_commodity TEXT,
    p_futures_month TEXT
)
RETURNS TABLE (
    day DATE,
    median_basis INTEGER,
    report_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(observed_at) AS day,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY basis_cents)::INTEGER AS median_basis,
        COUNT(*) AS report_count
    FROM basis_reports
    WHERE facility_id = p_facility_id
      AND commodity = p_commodity
      AND futures_month = p_futures_month
      AND observed_at >= now() - INTERVAL '30 days'
    GROUP BY DATE(observed_at)
    ORDER BY day ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- FUNCTION: get_facility_stats
-- Returns report count for last 7 days
-- ============================================
CREATE OR REPLACE FUNCTION get_facility_stats(
    p_facility_id UUID,
    p_commodity TEXT,
    p_futures_month TEXT
)
RETURNS TABLE (
    reports_7d BIGINT,
    last_report_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE observed_at >= now() - INTERVAL '7 days') AS reports_7d,
        MAX(observed_at) AS last_report_at
    FROM basis_reports
    WHERE facility_id = p_facility_id
      AND commodity = p_commodity
      AND futures_month = p_futures_month;
END;
$$ LANGUAGE plpgsql STABLE;
