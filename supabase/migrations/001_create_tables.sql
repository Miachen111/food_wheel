-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  status TEXT NOT NULL CHECK (status IN ('WISH_LIST', 'VISITED')),
  rating REAL CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 5.0)),
  avg_cost INTEGER CHECK (avg_cost IS NULL OR (avg_cost > 0 AND avg_cost <= 99999)),
  budget_level TEXT CHECK (budget_level IS NULL OR budget_level IN ('$', '$$', '$$$')),
  recommended_dishes TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  tag_ids UUID[] NOT NULL DEFAULT '{}',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  district TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (allow all for now since no auth)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (read/write) for now
CREATE POLICY "Allow all access to tags" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to restaurants" ON restaurants FOR ALL USING (true) WITH CHECK (true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_district ON restaurants(district);
