import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useCatalog() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalog = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      setError('Database credentials not configured in .env');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch categories directly from Supabase
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (catErr) throw catErr;

      // 2. Fetch products directly from Supabase with relational store prices & history
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select(`
          *,
          categories (id, slug, name, spec_defs),
          store_prices (*),
          price_history (*)
        `)
        .order('created_at', { ascending: false });

      if (prodErr) throw prodErr;

      setCategories(catData || []);
      setProducts(prodData || []);
    } catch (err) {
      setError(err.message || 'Failed to query Supabase tables');
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    // Category filter
    if (selectedCategorySlug !== 'all') {
      const catSlug = p.categories?.slug;
      if (catSlug !== selectedCategorySlug) return false;
    }

    // Search query (brand, name, or spec keywords)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchSpecs = p.specs && Object.values(p.specs).some(v => 
        String(v).toLowerCase().includes(q)
      );
      if (!matchName && !matchBrand && !matchSpecs) return false;
    }

    // Price filter
    const prices = p.store_prices?.map(s => Number(s.price)) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    if (minPrice > maxPrice) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const getBest = prod => {
      const prices = prod.store_prices?.map(s => Number(s.price)) || [];
      return prices.length > 0 ? Math.min(...prices) : Infinity;
    };

    if (sortBy === 'price-asc') {
      return getBest(a) - getBest(b);
    }
    if (sortBy === 'price-desc') {
      const pa = getBest(a) === Infinity ? 0 : getBest(a);
      const pb = getBest(b) === Infinity ? 0 : getBest(b);
      return pb - pa;
    }
    if (sortBy === 'rating-desc') {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    }
    if (sortBy === 'name-asc') {
      return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`);
    }
    return 0; // default featured
  });

  return {
    categories,
    products: sortedProducts,
    allProducts: products,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    maxPrice,
    setMaxPrice,
    loading,
    error,
    refreshCatalog: fetchCatalog,
    isConfigured: isSupabaseConfigured
  };
}
