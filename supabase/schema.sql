-- ==============================================================================
-- OmniSpec Database Architecture
-- PostgreSQL Schema for Enterprise Multi-Category Product Comparison Engine
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Categories Table (Dynamic Schema Definition)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Layers',
  spec_defs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- spec_defs JSONB Structure Example:
-- [
--   { "key": "screen_size_in", "label": "Screen Size", "unit": "inches", "dir": 1, "type": "number", "group": "Display" },
--   { "key": "battery_mah", "label": "Battery Capacity", "unit": "mAh", "dir": 1, "type": "number", "group": "Battery & Power" },
--   { "key": "weight_g", "label": "Weight", "unit": "g", "dir": -1, "type": "number", "group": "Chassis & Build" },
--   { "key": "water_resistant", "label": "Water Resistance", "unit": "", "dir": 1, "type": "bool", "group": "Durability" },
--   { "key": "os", "label": "Operating System", "unit": "", "dir": 0, "type": "text", "group": "Software" }
-- ]

-- ------------------------------------------------------------------------------
-- 2. Products Table (Spec Payload in JSONB)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Store Prices Table (Multi-Retailer Live Pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_product_store UNIQUE (product_id, store)
);

-- ------------------------------------------------------------------------------
-- 4. Price History Table (Time-Series Delta Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Index for rapid sparkline / historical querying
CREATE INDEX IF NOT EXISTS idx_price_history_prod_date ON price_history(product_id, recorded_at ASC);

-- ------------------------------------------------------------------------------
-- 5. Automated Price History Trigger
-- Logs the lowest available store price whenever store prices are inserted or updated
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_price_history_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_lowest_price NUMERIC;
BEGIN
  -- Compute current lowest store price for the product
  SELECT MIN(price) INTO v_lowest_price
  FROM store_prices
  WHERE product_id = NEW.product_id;

  IF v_lowest_price IS NOT NULL THEN
    INSERT INTO price_history (product_id, price, recorded_at)
    VALUES (NEW.product_id, v_lowest_price, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_store_price_history ON store_prices;
CREATE TRIGGER trg_store_price_history
AFTER INSERT OR UPDATE ON store_prices
FOR EACH ROW EXECUTE FUNCTION log_price_history_trigger();

-- ------------------------------------------------------------------------------
-- 6. Price Drop Watchdog Alerts Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  target_price NUMERIC(10, 2) NOT NULL CHECK (target_price > 0),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_target ON price_alerts(product_id, notified) WHERE notified = FALSE;

-- ------------------------------------------------------------------------------
-- 7. Row Level Security (RLS) & Access Policies
-- ------------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Catalog Data: Public read-only
CREATE POLICY "Public categories are viewable by everyone" 
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public products are viewable by everyone" 
  ON products FOR SELECT USING (true);

CREATE POLICY "Public store prices are viewable by everyone" 
  ON store_prices FOR SELECT USING (true);

CREATE POLICY "Public price history is viewable by everyone" 
  ON price_history FOR SELECT USING (true);

-- Price Alerts: Strict owner isolation
CREATE POLICY "Users can view their own price alerts" 
  ON price_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts" 
  ON price_alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" 
  ON price_alerts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" 
  ON price_alerts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
