-- Add more commodities and time range support

-- Update the commodity check constraint to allow wheat and sorghum
ALTER TABLE basis_reports DROP CONSTRAINT IF EXISTS basis_reports_commodity_check;
ALTER TABLE basis_reports ADD CONSTRAINT basis_reports_commodity_check
  CHECK (commodity IN ('corn', 'soybeans', 'wheat', 'sorghum'));

-- Update get_basis_trend function to accept days parameter
CREATE OR REPLACE FUNCTION get_basis_trend(
    p_facility_id UUID,
    p_commodity TEXT,
    p_futures_month TEXT,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    day DATE,
    median_basis NUMERIC,
    report_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(br.observed_at) as day,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY br.basis_cents)::NUMERIC as median_basis,
        COUNT(*)::BIGINT as report_count
    FROM basis_reports br
    WHERE br.facility_id = p_facility_id
      AND br.commodity = p_commodity
      AND br.futures_month = p_futures_month
      AND br.observed_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE(br.observed_at)
    ORDER BY DATE(br.observed_at);
END;
$$;
