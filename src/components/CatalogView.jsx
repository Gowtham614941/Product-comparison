import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';
import ProductCard from './ProductCard';
import Hero from './Hero';

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
  onSelectPreset
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
      {/* 1. Human-Crafted Hero Section */}
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
        ) : (
          /* Human Filter Empty State */
          <div className="empty-catalog-state">
            <div className="empty-icon-wrap">
              <Search size={28} />
            </div>
            <h3 className="empty-title">No matching products found</h3>
            <p className="empty-description">
              We couldn't find any devices matching your current search query or price ceiling.
              Try broadening your criteria or reset filters to browse the full catalog.
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
