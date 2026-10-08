-- ==============================================================================
-- OmniSpec: Full Database Schema, Auth Profile Trigger & Sample Data Seeder
-- Run this script in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Schema: Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Layers',
  spec_defs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Schema: Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Schema: Store Prices Table
CREATE TABLE IF NOT EXISTS public.store_prices (
  id TEXT PRIMARY KEY DEFAULT ('sp-' || substr(md5(random()::text), 1, 10)),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  store TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  url TEXT NOT NULL DEFAULT '#',
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_product_store UNIQUE (product_id, store)
);

-- 5. Schema: Price History Table
CREATE TABLE IF NOT EXISTS public.price_history (
  id TEXT PRIMARY KEY DEFAULT ('ph-' || substr(md5(random()::text), 1, 10)),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_prod_date ON public.price_history(product_id, recorded_at ASC);

-- 6. Schema: Price Alerts Table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  target_price NUMERIC(10, 2) NOT NULL CHECK (target_price > 0),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Schema: User Profiles (Synced automatically with Supabase Auth credentials)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: Automatically create public profile on Supabase auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
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

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow Public Reads on Catalog Data
DROP POLICY IF EXISTS "Public categories are readable by all" ON public.categories;
CREATE POLICY "Public categories are readable by all" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products are readable by all" ON public.products;
CREATE POLICY "Public products are readable by all" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public store prices are readable by all" ON public.store_prices;
CREATE POLICY "Public store prices are readable by all" ON public.store_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public price history is readable by all" ON public.price_history;
CREATE POLICY "Public price history is readable by all" ON public.price_history FOR SELECT USING (true);

-- User Profiles: Users can view all profiles, edit own
DROP POLICY IF EXISTS "Profiles are viewable by all users" ON public.user_profiles;
CREATE POLICY "Profiles are viewable by all users" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Price Alerts: Authenticated users manage their alerts; public can insert with email
DROP POLICY IF EXISTS "Alerts are readable by creator" ON public.price_alerts;
CREATE POLICY "Alerts are readable by creator" ON public.price_alerts FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Anyone can insert price alerts" ON public.price_alerts;
CREATE POLICY "Anyone can insert price alerts" ON public.price_alerts FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 9. Seed Sample Categories
-- ==============================================================================
INSERT INTO public.categories (id, slug, name, icon, spec_defs)
VALUES ('cat-phones', 'smartphones', 'Smartphones', 'Smartphone', '[{"key":"display_size","label":"Display Size","unit":"in","dir":1,"type":"number","group":"Display"},{"key":"refresh_rate","label":"Refresh Rate","unit":"Hz","dir":1,"type":"number","group":"Display"},{"key":"peak_brightness","label":"Peak Brightness","unit":"nits","dir":1,"type":"number","group":"Display"},{"key":"processor","label":"Processor","unit":"","dir":0,"type":"text","group":"Performance"},{"key":"ram_gb","label":"RAM","unit":"GB","dir":1,"type":"number","group":"Performance"},{"key":"base_storage_gb","label":"Base Storage","unit":"GB","dir":1,"type":"number","group":"Storage"},{"key":"main_camera_mp","label":"Main Camera","unit":"MP","dir":1,"type":"number","group":"Camera"},{"key":"optical_zoom","label":"Optical Zoom","unit":"x","dir":1,"type":"number","group":"Camera"},{"key":"battery_mah","label":"Battery Capacity","unit":"mAh","dir":1,"type":"number","group":"Battery & Charging"},{"key":"charging_speed_w","label":"Wired Fast Charging","unit":"W","dir":1,"type":"number","group":"Battery & Charging"},{"key":"weight_g","label":"Weight","unit":"g","dir":-1,"type":"number","group":"Chassis & Build"},{"key":"water_resistance","label":"Water Resistance","unit":"","dir":0,"type":"text","group":"Chassis & Build"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  spec_defs = EXCLUDED.spec_defs;

INSERT INTO public.categories (id, slug, name, icon, spec_defs)
VALUES ('cat-laptops', 'laptops', 'Laptops', 'Laptop', '[{"key":"screen_size_in","label":"Screen Size","unit":"in","dir":1,"type":"number","group":"Display"},{"key":"resolution","label":"Resolution","unit":"","dir":0,"type":"text","group":"Display"},{"key":"refresh_rate_hz","label":"Refresh Rate","unit":"Hz","dir":1,"type":"number","group":"Display"},{"key":"processor","label":"Processor / Chip","unit":"","dir":0,"type":"text","group":"Performance"},{"key":"ram_gb","label":"Unified Memory / RAM","unit":"GB","dir":1,"type":"number","group":"Performance"},{"key":"storage_gb","label":"SSD Storage","unit":"GB","dir":1,"type":"number","group":"Storage"},{"key":"battery_life_hours","label":"Battery Life","unit":"hrs","dir":1,"type":"number","group":"Battery & Power"},{"key":"weight_kg","label":"Weight","unit":"kg","dir":-1,"type":"number","group":"Chassis & Build"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  spec_defs = EXCLUDED.spec_defs;

INSERT INTO public.categories (id, slug, name, icon, spec_defs)
VALUES ('cat-audio', 'headphones', 'Headphones & Audio', 'Headphones', '[{"key":"driver_size_mm","label":"Driver Size","unit":"mm","dir":1,"type":"number","group":"Acoustics"},{"key":"anc_rating","label":"Active Noise Cancellation","unit":"/10","dir":1,"type":"number","group":"Noise Cancelling"},{"key":"battery_anc_hours","label":"Battery Life (ANC On)","unit":"hrs","dir":1,"type":"number","group":"Battery"},{"key":"quick_charge_mins","label":"Quick Charge for 3h","unit":"mins","dir":-1,"type":"number","group":"Battery"},{"key":"bluetooth_version","label":"Bluetooth Codec Support","unit":"","dir":0,"type":"text","group":"Connectivity"},{"key":"weight_g","label":"Weight","unit":"g","dir":-1,"type":"number","group":"Comfort"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  spec_defs = EXCLUDED.spec_defs;

INSERT INTO public.categories (id, slug, name, icon, spec_defs)
VALUES ('cat-wearables', 'smartwatches', 'Smartwatches', 'Watch', '[{"key":"display_brightness_nits","label":"Peak Brightness","unit":"nits","dir":1,"type":"number","group":"Display"},{"key":"battery_days","label":"Standard Battery Life","unit":"days","dir":1,"type":"number","group":"Battery"},{"key":"water_rating_m","label":"Water Resistance","unit":"m","dir":1,"type":"number","group":"Durability"},{"key":"ecg_sensor","label":"ECG & Blood Oxygen","unit":"","dir":1,"type":"bool","group":"Health & Sensors"},{"key":"case_material","label":"Chassis Material","unit":"","dir":0,"type":"text","group":"Build"},{"key":"weight_g","label":"Weight (case)","unit":"g","dir":-1,"type":"number","group":"Build"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  spec_defs = EXCLUDED.spec_defs;

INSERT INTO public.categories (id, slug, name, icon, spec_defs)
VALUES ('cat-tablets', 'tablets', 'Tablets', 'Tablet', '[{"key":"screen_size_in","label":"Display Size","unit":"in","dir":1,"type":"number","group":"Display"},{"key":"panel_type","label":"Panel Technology","unit":"","dir":0,"type":"text","group":"Display"},{"key":"refresh_rate_hz","label":"Refresh Rate","unit":"Hz","dir":1,"type":"number","group":"Display"},{"key":"processor","label":"Chipset","unit":"","dir":0,"type":"text","group":"Performance"},{"key":"storage_gb","label":"Base Storage","unit":"GB","dir":1,"type":"number","group":"Storage"},{"key":"battery_wh","label":"Battery Size","unit":"Wh","dir":1,"type":"number","group":"Power"},{"key":"weight_g","label":"Weight","unit":"g","dir":-1,"type":"number","group":"Portability"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  spec_defs = EXCLUDED.spec_defs;


-- ==============================================================================
-- 10. Seed Sample Flagship Products
-- ==============================================================================
INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-iphone-16-pro-max', 'cat-phones', 'Apple', 'iPhone 16 Pro Max', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=80', 4.9, '{"display_size":6.9,"refresh_rate":120,"peak_brightness":2000,"processor":"A18 Pro (3nm)","ram_gb":8,"base_storage_gb":256,"main_camera_mp":48,"optical_zoom":5,"battery_mah":4685,"charging_speed_w":27,"weight_g":227,"water_resistance":"IP68 (6m, 30 min)"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-1-1', 'prod-iphone-16-pro-max', 'Amazon', 1199, 'https://www.amazon.com/dp/B0D1XD1476')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-1-2', 'prod-iphone-16-pro-max', 'Best Buy', 1199.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-1-3', 'prod-iphone-16-pro-max', 'B&H Photo', 1199, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-1-4', 'prod-iphone-16-pro-max', 'Apple Store', 1199, 'https://www.apple.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-1-1', 'prod-iphone-16-pro-max', 1249, '2024-09-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-1-2', 'prod-iphone-16-pro-max', 1229, '2024-10-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-1-3', 'prod-iphone-16-pro-max', 1199, '2024-11-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-1-4', 'prod-iphone-16-pro-max', 1189, '2024-12-05')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-1-5', 'prod-iphone-16-pro-max', 1199, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-galaxy-s24-ultra', 'cat-phones', 'Samsung', 'Galaxy S24 Ultra', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=700&q=80', 4.8, '{"display_size":6.8,"refresh_rate":120,"peak_brightness":2600,"processor":"Snapdragon 8 Gen 3","ram_gb":12,"base_storage_gb":256,"main_camera_mp":200,"optical_zoom":5,"battery_mah":5000,"charging_speed_w":45,"weight_g":232,"water_resistance":"IP68 (1.5m, 30 min)"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-2-1', 'prod-galaxy-s24-ultra', 'Amazon', 1049.99, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-2-2', 'prod-galaxy-s24-ultra', 'Best Buy', 1099.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-2-3', 'prod-galaxy-s24-ultra', 'B&H Photo', 1079, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-2-4', 'prod-galaxy-s24-ultra', 'Walmart', 1099, 'https://www.walmart.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-2-1', 'prod-galaxy-s24-ultra', 1299.99, '2024-02-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-2-2', 'prod-galaxy-s24-ultra', 1199.99, '2024-05-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-2-3', 'prod-galaxy-s24-ultra', 1149, '2024-08-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-2-4', 'prod-galaxy-s24-ultra', 1049.99, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-2-5', 'prod-galaxy-s24-ultra', 1049.99, '2025-01-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-pixel-9-pro-xl', 'cat-phones', 'Google', 'Pixel 9 Pro XL', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80', 4.7, '{"display_size":6.8,"refresh_rate":120,"peak_brightness":3000,"processor":"Google Tensor G4","ram_gb":16,"base_storage_gb":128,"main_camera_mp":50,"optical_zoom":5,"battery_mah":5060,"charging_speed_w":37,"weight_g":221,"water_resistance":"IP68"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-3-1', 'prod-pixel-9-pro-xl', 'Amazon', 949, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-3-2', 'prod-pixel-9-pro-xl', 'Best Buy', 999.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-3-3', 'prod-pixel-9-pro-xl', 'Google Store', 1099, 'https://store.google.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-3-1', 'prod-pixel-9-pro-xl', 1099, '2024-09-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-3-2', 'prod-pixel-9-pro-xl', 1049, '2024-10-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-3-3', 'prod-pixel-9-pro-xl', 949, '2024-11-29')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-3-4', 'prod-pixel-9-pro-xl', 949, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-oneplus-12', 'cat-phones', 'OnePlus', 'OnePlus 12', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80', 4.8, '{"display_size":6.82,"refresh_rate":120,"peak_brightness":4500,"processor":"Snapdragon 8 Gen 3","ram_gb":16,"base_storage_gb":256,"main_camera_mp":50,"optical_zoom":3,"battery_mah":5400,"charging_speed_w":80,"weight_g":220,"water_resistance":"IP65"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-4-1', 'prod-oneplus-12', 'Amazon', 699.99, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-4-2', 'prod-oneplus-12', 'Best Buy', 749.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-4-3', 'prod-oneplus-12', 'OnePlus Direct', 699.99, 'https://www.oneplus.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-4-1', 'prod-oneplus-12', 799.99, '2024-03-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-4-2', 'prod-oneplus-12', 749.99, '2024-07-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-4-3', 'prod-oneplus-12', 699.99, '2024-11-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-4-4', 'prod-oneplus-12', 699.99, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-macbook-pro-16', 'cat-laptops', 'Apple', 'MacBook Pro 16" (M3 Max)', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80', 4.9, '{"screen_size_in":16.2,"resolution":"3456 x 2234 Liquid Retina XDR","refresh_rate_hz":120,"processor":"Apple M3 Max (16-Core CPU, 40-Core GPU)","ram_gb":36,"storage_gb":1000,"battery_life_hours":22,"weight_kg":2.16}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-5-1', 'prod-macbook-pro-16', 'Amazon', 3199, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-5-2', 'prod-macbook-pro-16', 'B&H Photo', 3149, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-5-3', 'prod-macbook-pro-16', 'Best Buy', 3249.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-5-4', 'prod-macbook-pro-16', 'Apple Store', 3499, 'https://www.apple.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-5-1', 'prod-macbook-pro-16', 3499, '2024-01-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-5-2', 'prod-macbook-pro-16', 3299, '2024-06-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-5-3', 'prod-macbook-pro-16', 3149, '2024-11-25')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-5-4', 'prod-macbook-pro-16', 3149, '2025-01-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-dell-xps-16', 'cat-laptops', 'Dell', 'XPS 16 (9640)', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=700&q=80', 4.6, '{"screen_size_in":16.3,"resolution":"3840 x 2400 4K OLED Touch","refresh_rate_hz":90,"processor":"Intel Core Ultra 9 185H + RTX 4070","ram_gb":32,"storage_gb":1000,"battery_life_hours":13,"weight_kg":2.2}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-6-1', 'prod-dell-xps-16', 'Dell Direct', 2499.99, 'https://www.dell.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-6-2', 'prod-dell-xps-16', 'Best Buy', 2399.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-6-3', 'prod-dell-xps-16', 'Amazon', 2449, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-6-1', 'prod-dell-xps-16', 2799, '2024-04-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-6-2', 'prod-dell-xps-16', 2599, '2024-08-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-6-3', 'prod-dell-xps-16', 2399.99, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-6-4', 'prod-dell-xps-16', 2399.99, '2025-01-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-thinkpad-x1-carbon', 'cat-laptops', 'Lenovo', 'ThinkPad X1 Carbon Gen 12', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=700&q=80', 4.7, '{"screen_size_in":14,"resolution":"2880 x 1800 2.8K OLED","refresh_rate_hz":120,"processor":"Intel Core Ultra 7 155H","ram_gb":32,"storage_gb":1000,"battery_life_hours":14,"weight_kg":1.09}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-7-1', 'prod-thinkpad-x1-carbon', 'Lenovo Store', 1749, 'https://www.lenovo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-7-2', 'prod-thinkpad-x1-carbon', 'B&H Photo', 1699, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-7-3', 'prod-thinkpad-x1-carbon', 'Amazon', 1729, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-7-1', 'prod-thinkpad-x1-carbon', 2199, '2024-05-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-7-2', 'prod-thinkpad-x1-carbon', 1899, '2024-09-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-7-3', 'prod-thinkpad-x1-carbon', 1699, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-7-4', 'prod-thinkpad-x1-carbon', 1699, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-zephyrus-g16', 'cat-laptops', 'ASUS', 'ROG Zephyrus G16 (OLED)', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=80', 4.8, '{"screen_size_in":16,"resolution":"2560 x 1600 2.5K ROG Nebula OLED","refresh_rate_hz":240,"processor":"Intel Core Ultra 9 185H + RTX 4080","ram_gb":32,"storage_gb":1000,"battery_life_hours":10,"weight_kg":1.95}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-8-1', 'prod-zephyrus-g16', 'Best Buy', 2299.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-8-2', 'prod-zephyrus-g16', 'Amazon', 2349.99, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-8-3', 'prod-zephyrus-g16', 'B&H Photo', 2299, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-8-1', 'prod-zephyrus-g16', 2699.99, '2024-04-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-8-2', 'prod-zephyrus-g16', 2499, '2024-08-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-8-3', 'prod-zephyrus-g16', 2299, '2024-11-25')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-8-4', 'prod-zephyrus-g16', 2299, '2025-01-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-sony-wh1000xm5', 'cat-audio', 'Sony', 'WH-1000XM5 Wireless ANC', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80', 4.8, '{"driver_size_mm":30,"anc_rating":9.6,"battery_anc_hours":30,"quick_charge_mins":3,"bluetooth_version":"LDAC, AAC, SBC, BT 5.2","weight_g":250}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-9-1', 'prod-sony-wh1000xm5', 'Amazon', 328, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-9-2', 'prod-sony-wh1000xm5', 'Best Buy', 329.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-9-3', 'prod-sony-wh1000xm5', 'B&H Photo', 328, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-9-4', 'prod-sony-wh1000xm5', 'Target', 349.99, 'https://www.target.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-9-1', 'prod-sony-wh1000xm5', 399.99, '2024-02-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-9-2', 'prod-sony-wh1000xm5', 348, '2024-07-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-9-3', 'prod-sony-wh1000xm5', 298, '2024-11-29')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-9-4', 'prod-sony-wh1000xm5', 328, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-bose-qc-ultra', 'cat-audio', 'Bose', 'QuietComfort Ultra Headphones', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80', 4.7, '{"driver_size_mm":35,"anc_rating":9.8,"battery_anc_hours":24,"quick_charge_mins":15,"bluetooth_version":"Snapdragon Sound, aptX Adaptive, BT 5.3","weight_g":252}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-10-1', 'prod-bose-qc-ultra', 'Amazon', 379, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-10-2', 'prod-bose-qc-ultra', 'Best Buy', 379.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-10-3', 'prod-bose-qc-ultra', 'Bose Direct', 429, 'https://www.bose.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-10-1', 'prod-bose-qc-ultra', 429, '2024-03-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-10-2', 'prod-bose-qc-ultra', 399, '2024-08-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-10-3', 'prod-bose-qc-ultra', 349, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-10-4', 'prod-bose-qc-ultra', 379, '2025-01-14')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-airpods-max', 'cat-audio', 'Apple', 'AirPods Max (USB-C)', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=80', 4.6, '{"driver_size_mm":40,"anc_rating":9.5,"battery_anc_hours":20,"quick_charge_mins":5,"bluetooth_version":"Apple H1 Chip, AAC, BT 5.0","weight_g":386}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-11-1', 'prod-airpods-max', 'Amazon', 499, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-11-2', 'prod-airpods-max', 'Best Buy', 499.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-11-3', 'prod-airpods-max', 'Apple Store', 549, 'https://www.apple.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-11-1', 'prod-airpods-max', 549, '2024-09-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-11-2', 'prod-airpods-max', 529, '2024-11-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-11-3', 'prod-airpods-max', 499, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-sennheiser-momentum-4', 'cat-audio', 'Sennheiser', 'Momentum 4 Wireless', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=700&q=80', 4.7, '{"driver_size_mm":42,"anc_rating":9,"battery_anc_hours":60,"quick_charge_mins":10,"bluetooth_version":"aptX Adaptive, aptX HD, AAC, BT 5.2","weight_g":293}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-12-1', 'prod-sennheiser-momentum-4', 'Amazon', 279.95, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-12-2', 'prod-sennheiser-momentum-4', 'B&H Photo', 279.95, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-12-3', 'prod-sennheiser-momentum-4', 'Best Buy', 299.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-12-1', 'prod-sennheiser-momentum-4', 379.95, '2024-03-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-12-2', 'prod-sennheiser-momentum-4', 319, '2024-08-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-12-3', 'prod-sennheiser-momentum-4', 249.95, '2024-11-29')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-12-4', 'prod-sennheiser-momentum-4', 279.95, '2025-01-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-apple-watch-ultra-2', 'cat-wearables', 'Apple', 'Watch Ultra 2', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80', 4.9, '{"display_brightness_nits":3000,"battery_days":3,"water_rating_m":100,"ecg_sensor":true,"case_material":"Titanium (Grade 5)","weight_g":61.4}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-13-1', 'prod-apple-watch-ultra-2', 'Amazon', 749, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-13-2', 'prod-apple-watch-ultra-2', 'Best Buy', 749, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-13-3', 'prod-apple-watch-ultra-2', 'Apple Store', 799, 'https://www.apple.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-13-1', 'prod-apple-watch-ultra-2', 799, '2024-05-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-13-2', 'prod-apple-watch-ultra-2', 779, '2024-09-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-13-3', 'prod-apple-watch-ultra-2', 729, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-13-4', 'prod-apple-watch-ultra-2', 749, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-galaxy-watch-ultra', 'cat-wearables', 'Samsung', 'Galaxy Watch Ultra', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=80', 4.7, '{"display_brightness_nits":3000,"battery_days":4,"water_rating_m":100,"ecg_sensor":true,"case_material":"Titanium Cushion","weight_g":60.5}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-14-1', 'prod-galaxy-watch-ultra', 'Amazon', 549.99, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-14-2', 'prod-galaxy-watch-ultra', 'Best Buy', 579.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-14-3', 'prod-galaxy-watch-ultra', 'Samsung Direct', 649.99, 'https://www.samsung.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-14-1', 'prod-galaxy-watch-ultra', 649.99, '2024-07-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-14-2', 'prod-galaxy-watch-ultra', 599.99, '2024-10-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-14-3', 'prod-galaxy-watch-ultra', 499.99, '2024-11-29')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-14-4', 'prod-galaxy-watch-ultra', 549.99, '2025-01-14')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-garmin-fenix-7-pro', 'cat-wearables', 'Garmin', 'Fenix 7 Pro Sapphire Solar', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=700&q=80', 4.8, '{"display_brightness_nits":1000,"battery_days":22,"water_rating_m":100,"ecg_sensor":true,"case_material":"Fiber-reinforced Polymer & Titanium","weight_g":73}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-15-1', 'prod-garmin-fenix-7-pro', 'Amazon', 699.99, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-15-2', 'prod-garmin-fenix-7-pro', 'B&H Photo', 699.99, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-15-3', 'prod-garmin-fenix-7-pro', 'Garmin Direct', 799.99, 'https://www.garmin.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-15-1', 'prod-garmin-fenix-7-pro', 899.99, '2024-02-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-15-2', 'prod-garmin-fenix-7-pro', 799.99, '2024-07-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-15-3', 'prod-garmin-fenix-7-pro', 699.99, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-15-4', 'prod-garmin-fenix-7-pro', 699.99, '2025-01-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-ipad-pro-13-m4', 'cat-tablets', 'Apple', 'iPad Pro 13" (M4 OLED)', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80', 4.9, '{"screen_size_in":13,"panel_type":"Tandem Ultra Retina OLED","refresh_rate_hz":120,"processor":"Apple M4 (9-Core CPU, 10-Core GPU)","storage_gb":256,"battery_wh":38.99,"weight_g":579}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-16-1', 'prod-ipad-pro-13-m4', 'Amazon', 1199, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-16-2', 'prod-ipad-pro-13-m4', 'Best Buy', 1199, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-16-3', 'prod-ipad-pro-13-m4', 'B&H Photo', 1199, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-16-4', 'prod-ipad-pro-13-m4', 'Apple Store', 1299, 'https://www.apple.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-16-1', 'prod-ipad-pro-13-m4', 1299, '2024-05-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-16-2', 'prod-ipad-pro-13-m4', 1249, '2024-09-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-16-3', 'prod-ipad-pro-13-m4', 1199, '2024-11-29')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-16-4', 'prod-ipad-pro-13-m4', 1199, '2025-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, brand, name, image_url, rating, specs)
VALUES ('prod-galaxy-tab-s9-ultra', 'cat-tablets', 'Samsung', 'Galaxy Tab S9 Ultra', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=700&q=80', 4.8, '{"screen_size_in":14.6,"panel_type":"Dynamic AMOLED 2X","refresh_rate_hz":120,"processor":"Snapdragon 8 Gen 2 for Galaxy","storage_gb":256,"battery_wh":43.1,"weight_g":732}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  specs = EXCLUDED.specs;

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-17-1', 'prod-galaxy-tab-s9-ultra', 'Amazon', 949.99, 'https://www.amazon.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-17-2', 'prod-galaxy-tab-s9-ultra', 'Best Buy', 999.99, 'https://www.bestbuy.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.store_prices (id, product_id, store, price, url)
VALUES ('sp-17-3', 'prod-galaxy-tab-s9-ultra', 'B&H Photo', 979, 'https://www.bhphotovideo.com')
ON CONFLICT (product_id, store) DO UPDATE SET
  price = EXCLUDED.price,
  url = EXCLUDED.url,
  updated_at = now();

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-17-1', 'prod-galaxy-tab-s9-ultra', 1199.99, '2024-03-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-17-2', 'prod-galaxy-tab-s9-ultra', 1049.99, '2024-08-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-17-3', 'prod-galaxy-tab-s9-ultra', 899.99, '2024-11-28')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.price_history (id, product_id, price, recorded_at)
VALUES ('ph-17-4', 'prod-galaxy-tab-s9-ultra', 949.99, '2025-01-14')
ON CONFLICT (id) DO NOTHING;

