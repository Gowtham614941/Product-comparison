import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, enrichProductsWithCategories } from '../lib/catalogData';

export function useCatalog() {
  const initialEnriched = enrichProductsWithCategories(DEFAULT_PRODUCTS, DEFAULT_CATEGORIES);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(initialEnriched);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('benchmark'); // 'cloud' | 'benchmark'

  const fetchCatalog = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(initialEnriched);
      setCategories(DEFAULT_CATEGORIES);
      return;
    }

    try {
      setLoading(true);

      // Attempt to load categories from Supabase
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Attempt to load products from Supabase
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select(`
          *,
          categories (id, slug, name, spec_defs),
          store_prices (*),
          price_history (*)
        `)
        .order('created_at', { ascending: false });

      if (!catErr && !prodErr && prodData && prodData.length > 0) {
        setCategories(catData && catData.length > 0 ? catData : DEFAULT_CATEGORIES);
        setProducts(prodData);
        setDataSource('cloud');
      } else {
        // Fallback to rich benchmark catalog if database is not seeded yet
        setCategories(DEFAULT_CATEGORIES);
        setProducts(initialEnriched);
        setDataSource('benchmark');
      }
    } catch {
      // Graceful fallback to verified benchmark data
      setCategories(DEFAULT_CATEGORIES);
      setProducts(initialEnriched);
      setDataSource('benchmark');
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
    refreshCatalog: fetchCatalog,
    isConfigured: isSupabaseConfigured,
    dataSource
  };
}
