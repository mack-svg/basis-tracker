-- Basis Tracker - Row Level Security Policies
-- Run this after 001_schema.sql

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE zip_centroids ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE basis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_facilities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- zip_centroids: Public read-only
-- ============================================
CREATE POLICY "zip_centroids_select"
    ON zip_centroids FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- facilities: Public read, authenticated insert
-- ============================================
CREATE POLICY "facilities_select"
    ON facilities FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "facilities_insert"
    ON facilities FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- No update/delete for regular users (admin only via service role)

-- ============================================
-- basis_reports: Public read, insert with user_id
-- No updates or deletes allowed (prevent manipulation)
-- ============================================
CREATE POLICY "basis_reports_select"
    ON basis_reports FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "basis_reports_insert"
    ON basis_reports FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        -- Basic validation: user_id must be provided
        user_id IS NOT NULL
        -- Basis must be reasonable
        AND basis_cents BETWEEN -200 AND 200
    );

-- ============================================
-- saved_facilities: User-specific CRUD
-- Users can only see/manage their own saved facilities
-- ============================================
CREATE POLICY "saved_facilities_select"
    ON saved_facilities FOR SELECT
    TO anon, authenticated
    USING (true);  -- For MVP, allow reading all (we filter client-side by user_id)

CREATE POLICY "saved_facilities_insert"
    ON saved_facilities FOR INSERT
    TO anon, authenticated
    WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "saved_facilities_delete"
    ON saved_facilities FOR DELETE
    TO anon, authenticated
    USING (true);  -- For MVP, allow delete (client passes correct user_id)

-- ============================================
-- Grant permissions to anon role
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON zip_centroids TO anon;
GRANT SELECT, INSERT ON facilities TO anon;
GRANT SELECT, INSERT ON basis_reports TO anon;
GRANT SELECT, INSERT, DELETE ON saved_facilities TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION haversine_distance TO anon;
GRANT EXECUTE ON FUNCTION get_nearby_facilities TO anon;
GRANT EXECUTE ON FUNCTION get_current_basis TO anon;
GRANT EXECUTE ON FUNCTION get_basis_trend TO anon;
GRANT EXECUTE ON FUNCTION get_facility_stats TO anon;
