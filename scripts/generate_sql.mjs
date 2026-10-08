import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../src/lib/catalogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escapeJson(obj) {
  if (!obj) return "'{}'::jsonb";
  return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
}

let sql = `-- ==============================================================================
-- OmniSpec Supabase Production Schema & Complete Seed Data
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase project dashboard:
--    https://supabase.com/dashboard/project/xmjdngjnwwxvjniquhhj/sql/new
-- 2. Paste this entire script into the SQL Editor.
-- 3. Click "Run" (or press Ctrl+Enter).
-- This will create all tables, configure user auth triggers, set RLS policies,
-- and seed 5 categories, 17 flagship products, store prices, and price history.
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean up existing tables (idempotent run)
DROP TABLE IF EXISTS price_alerts CASCADE;
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS store_prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ------------------------------------------------------------------------------
-- 3. User Profiles Table (Linked with Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: Automatically create public profile row when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Layers',
  spec_defs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. Products Table
-- ------------------------------------------------------------------------------
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. Store Prices Table (Multi-Retailer Pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE store_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_product_store UNIQUE (product_id, store)
);

-- ------------------------------------------------------------------------------
-- 7. Price History Table (Sparklines & Volatility Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE price_history (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_prod_date ON price_history(product_id, recorded_at ASC);

-- ------------------------------------------------------------------------------
-- 8. Price Alerts Table
-- ------------------------------------------------------------------------------
CREATE TABLE price_alerts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  target_price NUMERIC(10, 2) NOT NULL CHECK (target_price > 0),
  email TEXT,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 9. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Catalog Data: Public read-only
CREATE POLICY "Public categories are readable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Public products are readable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Public store prices are readable by everyone" ON store_prices FOR SELECT USING (true);
CREATE POLICY "Public price history is readable by everyone" ON price_history FOR SELECT USING (true);

-- User Profiles: Authenticated users manage their profile
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Price Alerts: Anyone can set alert, owners view their own
CREATE POLICY "Anyone can insert price alerts" ON price_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their price alerts" ON price_alerts FOR SELECT USING (
  auth.uid() = user_id OR auth.role() = 'anon'
);
CREATE POLICY "Users can delete their price alerts" ON price_alerts FOR DELETE USING (
  auth.uid() = user_id OR auth.role() = 'anon'
);

-- ------------------------------------------------------------------------------
-- 10. Sample Benchmark Seed Data
-- ------------------------------------------------------------------------------

-- Categories
INSERT INTO categories (id, slug, name, icon, spec_defs) VALUES
`;

const catRows = DEFAULT_CATEGORIES.map(c => {
  return `(${escapeSql(c.id)}, ${escapeSql(c.slug)}, ${escapeSql(c.name)}, ${escapeSql(c.icon)}, ${escapeJson(c.spec_defs)})`;
}).join(',\n');

sql += catRows + ';\n\n-- Products\nINSERT INTO products (id, category_id, brand, name, image_url, rating, specs) VALUES\n';

const prodRows = DEFAULT_PRODUCTS.map(p => {
  return `(${escapeSql(p.id)}, ${escapeSql(p.category_id)}, ${escapeSql(p.brand)}, ${escapeSql(p.name)}, ${escapeSql(p.image_url)}, ${p.rating}, ${escapeJson(p.specs)})`;
}).join(',\n');

sql += prodRows + ';\n\n-- Store Prices\nINSERT INTO store_prices (id, product_id, store, price, url) VALUES\n';

const storeRows = [];
const histRows = [];

DEFAULT_PRODUCTS.forEach(p => {
  (p.store_prices || []).forEach(sp => {
    storeRows.push(`(${escapeSql(sp.id)}, ${escapeSql(p.id)}, ${escapeSql(sp.store)}, ${sp.price}, ${escapeSql(sp.url)})`);
  });
  (p.price_history || []).forEach(ph => {
    histRows.push(`(${escapeSql(ph.id)}, ${escapeSql(p.id)}, ${ph.price}, ${escapeSql(ph.recorded_at)})`);
  });
});

sql += storeRows.join(',\n') + ';\n\n-- Price History\nINSERT INTO price_history (id, product_id, price, recorded_at) VALUES\n';
sql += histRows.join(',\n') + ';\n\n';

sql += `-- ------------------------------------------------------------------------------
-- 11. Automated Price History Trigger (Activated after seeding)
-- Automatically records new best prices to price_history when store prices change
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_price_history_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_lowest NUMERIC;
BEGIN
  SELECT MIN(price) INTO v_lowest FROM store_prices WHERE product_id = NEW.product_id;
  IF v_lowest IS NOT NULL THEN
    INSERT INTO price_history (id, product_id, price, recorded_at)
    VALUES ('ph-' || gen_random_uuid(), NEW.product_id, v_lowest, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_store_price_history ON store_prices;
CREATE TRIGGER trg_store_price_history
AFTER INSERT OR UPDATE ON store_prices
FOR EACH ROW EXECUTE FUNCTION log_price_history_trigger();

-- ==============================================================================
-- End of Script
-- ==============================================================================
`;

const outPath = path.resolve(__dirname, '../supabase/seed_complete.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Generated complete SQL script at ${outPath} (${sql.length} bytes)`);
