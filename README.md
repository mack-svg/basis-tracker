# Basis Tracker

A mobile-first web app for tracking grain basis at local elevators. Crowdsourced basis data with simple entry and trend visualization.

## Features

- **ZIP Code Search**: Find nearby grain facilities by ZIP code
- **Simple Data Entry**: Quick submission of basis observations
- **Trend Charts**: View 30-day basis trends for any facility
- **Saved Locations**: Quick access to frequently-used facilities
- **Add Missing Locations**: Crowdsource new facility data

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Postgres + Row Level Security)
- **Charts**: Recharts

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Run Database Migrations

In the Supabase SQL Editor, run these files in order:

```sql
-- 1. Run supabase/001_schema.sql
-- 2. Run supabase/002_rls_policies.sql
-- 3. Run supabase/003_seed_data.sql
```

### 3. Configure Environment

Copy the environment example file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials from Project Settings > API:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **zip_centroids**: ZIP code to lat/lng mapping
- **facilities**: Grain elevators and buyers
- **basis_reports**: User-submitted basis observations
- **saved_facilities**: User's saved locations

### Key Functions

- `get_nearby_facilities(lat, lng, radius)`: Find facilities within radius
- `get_current_basis(facility_id, commodity, month)`: Get latest basis (24h median)
- `get_basis_trend(facility_id, commodity, month)`: Get 30-day daily medians
- `get_facility_stats(facility_id, commodity, month)`: Get report counts

## Expanding Nationwide

To scale this app:

### 1. Import Full ZIP Centroid Data

Download ZCTA data from the US Census Bureau and import:

```sql
COPY zip_centroids (zip, lat, lng)
FROM '/path/to/zcta_centroids.csv'
WITH (FORMAT csv, HEADER true);
```

### 2. Seed More Facilities

Options for facility data:
- USDA GIPSA licensed facilities
- State grain inspection databases
- Manual crowdsourcing with verification

### 3. Facility Deduplication

Add a merge/dedupe system:

```sql
-- Add fields for deduplication
ALTER TABLE facilities ADD COLUMN canonical_id UUID REFERENCES facilities(id);
ALTER TABLE facilities ADD COLUMN merge_status TEXT DEFAULT 'active';

-- Query to find potential duplicates
SELECT f1.id, f1.name, f2.id, f2.name,
       haversine_distance(f1.lat, f1.lng, f2.lat, f2.lng) as distance
FROM facilities f1
JOIN facilities f2 ON f1.id < f2.id
WHERE haversine_distance(f1.lat, f1.lng, f2.lat, f2.lng) < 0.5
  AND similarity(f1.name, f2.name) > 0.3;
```

### 4. Add Verification System

- Allow users to flag incorrect facilities
- Admin approval for new facilities
- Verified badge for confirmed locations

### 5. Add User Accounts (Optional)

If needed, enable Supabase Auth:

```typescript
// Switch from localStorage UUID to Supabase Auth
const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id
```

## API Reference

### Get Nearby Facilities

```typescript
const { data } = await supabase.rpc('get_nearby_facilities', {
  p_lat: 41.9779,
  p_lng: -91.6656,
  p_radius_miles: 30
})
```

### Submit Basis Report

```typescript
const { error } = await supabase.from('basis_reports').insert({
  facility_id: 'uuid',
  commodity: 'corn',
  futures_month: 'H',
  basis_cents: -22,
  user_id: 'uuid'
})
```

### Get Current Basis

```typescript
const { data } = await supabase.rpc('get_current_basis', {
  p_facility_id: 'uuid',
  p_commodity: 'corn',
  p_futures_month: 'H'
})
// Returns: { median_basis, report_count, is_stale, last_updated }
```

## License

MIT
