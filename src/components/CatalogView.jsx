import React from 'react';
import { Search, RotateCcw, ArrowUpDown, Database, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import Hero from './Hero';
import { supabaseUrl, isSupabaseConfigured } from '../lib/supabase';
import './CatalogView.css';

export default function CatalogView({
  categories = [],
  products = [],
  allProducts = [],
  selectedCategorySlug,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  loading = false,
  selectedProductIds = [],
  onToggleCompare,
  onSelectPreset,
  onRefresh,
  error = null
}) {
  const currentCategory = categories.find(c => c.slug === selectedCategorySlug);
  const specDefs = currentCategory?.spec_defs || [];

  const handleResetFilters = () => {
    onSearchChange('');
    onSelectCategory('all');
    onSortChange('featured');
    onMaxPriceChange(5000);
  };

  return (
    <div className="catalog-wrapper">
      {/* 1. Hero Section */}
      <Hero
        categories={categories}
        selectedCategorySlug={selectedCategorySlug}
        onSelectCategory={onSelectCategory}
        onSelectPreset={onSelectPreset}
        totalProductsCount={allProducts.length}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      <div className="container catalog-section" id="catalog-explorer">
        {/* Secondary Filter & Sort Ribbon */}
        <div className="controls-ribbon">
          <div className="results-count-block">
            <span className="results-count-num">{products.length}</span>
            <span className="results-count-label">
              {products.length === 1 ? 'device available' : 'devices available'}
              {selectedCategorySlug !== 'all' && ` in ${currentCategory?.name || selectedCategorySlug}`}
            </span>
          </div>

          <div className="filter-controls-right">
            {/* Price Filter Slider */}
            <div className="price-slider-group">
              <span className="slider-label">Max Price: <strong>${Number(maxPrice).toLocaleString()}</strong></span>
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={e => onMaxPriceChange(Number(e.target.value))}
                className="price-range-input"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <ArrowUpDown size={14} className="sort-icon" />
              <select
                value={sortBy}
                onChange={e => onSortChange(e.target.value)}
                className="select-dropdown"
              >
                <option value="featured">Featured Benchmarks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {(searchQuery || selectedCategorySlug !== 'all' || maxPrice < 5000 || sortBy !== 'featured') && (
              <button
                onClick={handleResetFilters}
                className="btn-filter-reset"
                title="Reset all search and filter options"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-body">
                  <div className="skeleton-line w-40" />
                  <div className="skeleton-line w-80" />
                  <div className="skeleton-line w-60" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => {
              const isSelected = selectedProductIds.includes(product.id);
              const defs = product.categories?.spec_defs || specDefs;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  specDefs={defs}
                  isSelected={isSelected}
                  onToggleCompare={onToggleCompare}
                  disabled={selectedProductIds.length >= 4}
                />
              );
            })}
          </div>
        ) : allProducts.length === 0 ? (
          /* Empty Supabase Database State */
          <div className="empty-catalog-state">
            <div className="empty-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#818cf8' }}>
              <Database size={26} />
            </div>
            <h3 className="empty-title">
              {isSupabaseConfigured ? 'Awaiting Data in Supabase' : 'Supabase Credentials Pending'}
            </h3>
            <p className="empty-description">
              {isSupabaseConfigured ? (
                <>
                  Connected to Supabase (<code>{(() => { try { return new URL(supabaseUrl).host; } catch { return supabaseUrl; } })()}</code>).
                  {error ? ` Current status: ${error}. ` : ' No products found in the database yet. '}
                  Execute the provided SQL query in your Supabase SQL Editor to populate the categories and products.
                </>
              ) : (
                <>
                  Supabase environment variables are missing. Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment settings and redeploy.
                </>
              )}
            </p>
            <button
              onClick={onRefresh}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={14} />
              <span>Refresh from Supabase</span>
            </button>
          </div>
        ) : (
          /* Filter Mismatch State */
          <div className="empty-catalog-state">
            <div className="empty-icon-wrap">
              <Search size={26} />
            </div>
            <h3 className="empty-title">No matching products found</h3>
            <p className="empty-description">
              No devices match your current keyword or price ceiling.
              Try broadening your criteria or reset filters to browse all {allProducts.length} devices.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn btn-primary"
            >
              <RotateCcw size={15} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
