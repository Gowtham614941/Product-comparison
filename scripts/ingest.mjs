// ==============================================================================
// OmniSpec Live Price Ingestion Script
// Batch synchronizes retailer prices into Supabase store_prices table.
// Automatically fires the PostgreSQL price_history trigger.
// Usage: node scripts/ingest.mjs [path-to-prices.json]
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually if not in environment
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\x1b[31m[Error] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\x1b[0m');
  console.error('Please configure your credentials in .env before running the ingestion script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runIngestion() {
  const filePath = process.argv[2] || path.resolve(__dirname, 'prices.json');

  if (!fs.existsSync(filePath)) {
    console.error(`\x1b[31m[Error] Prices feed file not found at: ${filePath}\x1b[0m`);
    console.log('Provide a path to a JSON file or create scripts/prices.json.');
    process.exit(1);
  }

  let feed;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    feed = JSON.parse(raw);
  } catch (err) {
    console.error(`\x1b[31m[Error] Failed to parse JSON from ${filePath}:\x1b[0m`, err.message);
    process.exit(1);
  }

  if (!Array.isArray(feed)) {
    console.error('\x1b[31m[Error] Ingestion payload must be an array of store price objects.\x1b[0m');
    process.exit(1);
  }

  console.log(`\x1b[36m[OmniSpec Ingestion]\x1b[0m Starting batch update for ${feed.length} price records...`);

  // Cache existing products for fast name/brand lookup
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, brand, name');

  if (prodErr) {
    console.error('\x1b[31m[Error] Could not fetch products from database:\x1b[0m', prodErr.message);
    process.exit(1);
  }

  const productLookup = new Map();
  for (const p of products || []) {
    productLookup.set(p.id, p.id);
    const key = `${p.brand.toLowerCase()}|${p.name.toLowerCase()}`;
    productLookup.set(key, p.id);
  }

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const item of feed) {
    try {
      let productId = item.product_id;

      if (!productId && item.brand && item.product_name) {
        const key = `${item.brand.toLowerCase()}|${item.product_name.toLowerCase()}`;
        productId = productLookup.get(key);
      }

      if (!productId) {
        console.warn(`\x1b[33m[Skip]\x1b[0m Product not found for entry: ${item.brand || ''} ${item.product_name || item.product_id}`);
        skippedCount++;
        continue;
      }

      if (!item.store || typeof item.price !== 'number') {
        console.warn(`\x1b[33m[Skip]\x1b[0m Invalid store or price data for product ID: ${productId}`);
        skippedCount++;
        continue;
      }

      // Upsert into store_prices table
      const { error: upsertErr } = await supabase
        .from('store_prices')
        .upsert(
          {
            product_id: productId,
            store: item.store,
            price: item.price,
            url: item.url || '#',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'product_id,store' }
        );

      if (upsertErr) {
        console.error(`\x1b[31m[Error]\x1b[0m Failed to upsert ${item.store} price for ${productId}:`, upsertErr.message);
        failedCount++;
      } else {
        successCount++;
      }
    } catch (e) {
      console.error(`\x1b[31m[Error]\x1b[0m Unexpected error processing row:`, e.message);
      failedCount++;
    }
  }

  console.log('\n\x1b[32m--- Ingestion Summary ---\x1b[0m');
  console.log(`Success:  ${successCount}`);
  console.log(`Skipped:  ${skippedCount}`);
  console.log(`Failed:   ${failedCount}`);
  console.log(`Database triggers automatically recorded new best prices to price_history.\n`);
}

runIngestion();
