import { createClient } from '@supabase/supabase-js';

// Fallback to project defaults so production deployments (e.g. Vercel)
// connect seamlessly even if environment variables have not yet been manually entered in the Vercel dashboard.
const DEFAULT_SUPABASE_URL = 'https://xmjdngjnwwxvjniquhhj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_HQkxXMvgoeh-nHwd2Uo74A_ugfnjMlW';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project')
);

// Connected Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Validates connection health and returns active table counts
 */
export async function checkDatabaseHealth() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Cloud database credentials not configured',
      counts: { categories: 0, products: 0, store_prices: 0, price_history: 0 }
    };
  }

  try {
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
    ]);

    if (catRes.error) throw catRes.error;

    return {
      connected: true,
      message: 'Cloud database connected',
      counts: {
        categories: catRes.count ?? 0,
        products: prodRes.count ?? 0,
      }
    };
  } catch (err) {
    return {
      connected: false,
      message: err.message || 'Connecting to database...',
      error: err
    };
  }
}

export const checkSupabaseHealth = checkDatabaseHealth;
