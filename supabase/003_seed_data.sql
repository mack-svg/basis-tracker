-- Basis Tracker - Seed Data
-- Run this after 001_schema.sql and 002_rls_policies.sql

-- ============================================
-- Seed facilities (Cedar Rapids, IA area)
-- Cedar Rapids downtown centroid: 41.9779, -91.6656
-- ============================================
INSERT INTO facilities (name, company, city, state, address, lat, lng, is_verified) VALUES
    ('Cargill Grain', 'Cargill', 'Cedar Rapids', 'IA', '2500 J St SW', 41.9620, -91.6850, true),
    ('ADM Corn Processing', 'ADM', 'Cedar Rapids', 'IA', '1350 Waconia Ave SW', 41.9580, -91.6750, true),
    ('Ingredion Cedar Rapids', 'Ingredion', 'Cedar Rapids', 'IA', '1515 2nd St SW', 41.9650, -91.6700, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed ZIP centroids (Iowa area for testing)
-- Full nationwide data should be imported separately
-- ============================================
INSERT INTO zip_centroids (zip, lat, lng) VALUES
    ('52401', 41.9779, -91.6656),  -- Cedar Rapids
    ('52402', 41.9900, -91.6500),  -- Cedar Rapids
    ('52403', 41.9700, -91.6300),  -- Cedar Rapids
    ('52404', 41.9500, -91.6800),  -- Cedar Rapids
    ('52405', 41.9600, -91.7100),  -- Cedar Rapids
    ('52240', 41.6611, -91.5302),  -- Iowa City
    ('52241', 41.6800, -91.5100),  -- Coralville
    ('50309', 41.5868, -93.6250),  -- Des Moines
    ('50310', 41.6100, -93.6700),  -- Des Moines
    ('50311', 41.5900, -93.7000),  -- Des Moines
    ('52001', 42.5006, -90.6646),  -- Dubuque
    ('52601', 40.8073, -91.1127),  -- Burlington
    ('51501', 41.2619, -95.8608),  -- Council Bluffs
    ('50701', 42.4928, -92.3426),  -- Waterloo
    ('52101', 43.3017, -91.7857),  -- Decorah
    ('51101', 42.4963, -96.4003),  -- Sioux City
    ('50401', 43.1536, -93.2010),  -- Mason City
    ('52501', 41.0178, -92.4083),  -- Ottumwa
    ('52801', 41.5236, -90.5776),  -- Davenport
    ('50010', 42.0308, -93.6319)   -- Ames
ON CONFLICT (zip) DO NOTHING;

-- ============================================
-- Sample basis reports for testing trends
-- These create some historical data
-- ============================================
DO $$
DECLARE
    v_facility_id UUID;
    v_user_id UUID := gen_random_uuid();
BEGIN
    -- Get Cargill facility ID
    SELECT id INTO v_facility_id FROM facilities WHERE name = 'Cargill Grain' LIMIT 1;

    IF v_facility_id IS NOT NULL THEN
        -- Insert sample corn basis reports over last 30 days
        INSERT INTO basis_reports (facility_id, commodity, futures_month, basis_cents, observed_at, user_id)
        VALUES
            (v_facility_id, 'corn', 'H', -25, now() - INTERVAL '30 days', v_user_id),
            (v_facility_id, 'corn', 'H', -24, now() - INTERVAL '28 days', v_user_id),
            (v_facility_id, 'corn', 'H', -26, now() - INTERVAL '25 days', v_user_id),
            (v_facility_id, 'corn', 'H', -23, now() - INTERVAL '21 days', v_user_id),
            (v_facility_id, 'corn', 'H', -22, now() - INTERVAL '18 days', v_user_id),
            (v_facility_id, 'corn', 'H', -24, now() - INTERVAL '14 days', v_user_id),
            (v_facility_id, 'corn', 'H', -21, now() - INTERVAL '10 days', v_user_id),
            (v_facility_id, 'corn', 'H', -20, now() - INTERVAL '7 days', v_user_id),
            (v_facility_id, 'corn', 'H', -22, now() - INTERVAL '5 days', v_user_id),
            (v_facility_id, 'corn', 'H', -19, now() - INTERVAL '3 days', v_user_id),
            (v_facility_id, 'corn', 'H', -18, now() - INTERVAL '1 day', v_user_id),
            (v_facility_id, 'corn', 'H', -20, now() - INTERVAL '12 hours', v_user_id);

        -- Insert sample soybean basis reports
        INSERT INTO basis_reports (facility_id, commodity, futures_month, basis_cents, observed_at, user_id)
        VALUES
            (v_facility_id, 'soybeans', 'H', -35, now() - INTERVAL '25 days', v_user_id),
            (v_facility_id, 'soybeans', 'H', -33, now() - INTERVAL '20 days', v_user_id),
            (v_facility_id, 'soybeans', 'H', -30, now() - INTERVAL '14 days', v_user_id),
            (v_facility_id, 'soybeans', 'H', -28, now() - INTERVAL '7 days', v_user_id),
            (v_facility_id, 'soybeans', 'H', -32, now() - INTERVAL '3 days', v_user_id),
            (v_facility_id, 'soybeans', 'H', -29, now() - INTERVAL '6 hours', v_user_id);
    END IF;
END $$;
