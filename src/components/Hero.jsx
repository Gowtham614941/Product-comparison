import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  TrendingDown, 
  Sliders, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Tablet,
  Search
} from 'lucide-react';

const CATEGORY_ICONS = {
  smartphones: Smartphone,
  laptops: Laptop,
  headphones: Headphones,
  smartwatches: Watch,
  tablets: Tablet
};

export default function Hero({
  categories = [],
  selectedCategorySlug,
  onSelectCategory,
  onSelectPreset,
  totalProductsCount = 0,
  searchQuery,
  onSearchChange
}) {
  const presets = [
    {
      title: 'iPhone 16 Pro Max vs Galaxy S24 Ultra',
      catSlug: 'smartphones',
      ids: ['prod-iphone-16-pro-max', 'prod-galaxy-s24-ultra'],
      tag: 'Flagship Battle'
    },
    {
      title: 'MacBook Pro 16 vs Dell XPS 16',
      catSlug: 'laptops',
      ids: ['prod-macbook-pro-16', 'prod-dell-xps-16'],
      tag: 'Pro Creator Laptops'
    },
    {
      title: 'Sony XM5 vs Bose QC Ultra',
      catSlug: 'headphones',
      ids: ['prod-sony-wh1000xm5', 'prod-bose-qc-ultra'],
      tag: 'ANC Showdown'
    }
  ];

  return (
    <section className="human-hero">
      <div className="container hero-content-wrapper">
        {/* Top Announcement Pill */}
        <div className="hero-eyebrow">
          <span className="eyebrow-pulse" />
          <span className="eyebrow-text">Unbiased Hardware Intelligence & Price Tracking</span>
          <span className="eyebrow-badge">Live Index</span>
        </div>

        {/* Human, Compelling Headline */}
        <h1 className="hero-main-title">
          Compare specs side-by-side. <br className="hero-br" />
          <span className="gradient-text">Make confident buying decisions.</span>
        </h1>

        <p className="hero-description">
          We strip away marketing fluff. Evaluate smartphones, laptops, audio, and wearables with verified 
          technical specs, customizable weighted scoring, and real-time retailer pricing.
        </p>

        {/* Interactive Search Bar in Hero */}
        <div className="hero-search-wrapper">
          <div className="hero-search-box">
            <Search size={18} className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search by model, brand, processor, camera, or screen..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="hero-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="hero-search-clear"
                title="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Popular Preset Comparisons */}
        <div className="hero-presets-row">
          <span className="presets-label">Popular Matchups:</span>
          <div className="presets-chips">
            {presets.map(preset => (
              <button
                key={preset.title}
                onClick={() => onSelectPreset(preset.ids)}
                className="preset-chip"
                title={`Compare ${preset.title}`}
              >
                <span className="preset-name">{preset.title}</span>
                <span className="preset-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Cards */}
        <div className="hero-category-pills">
          <button
            onClick={() => onSelectCategory('all')}
            className={`hero-cat-btn ${selectedCategorySlug === 'all' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>All Devices</span>
            <span className="cat-count">{totalProductsCount}</span>
          </button>

          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug] || Layers;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`hero-cat-btn ${selectedCategorySlug === cat.slug ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Trust & Methodology Value Pillars */}
        <div className="hero-features-bar">
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <Layers size={18} />
            </div>
            <div className="feature-text">
              <strong>Objective Spec Sheet</strong>
              <span>Normalized side-by-side data</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <Sliders size={18} />
            </div>
            <div className="feature-text">
              <strong>Custom Weight Scoring</strong>
              <span>Prioritize battery, performance or price</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <TrendingDown size={18} />
            </div>
            <div className="feature-text">
              <strong>Multi-Retailer Prices</strong>
              <span>Amazon, Best Buy, B&H & direct</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <ShieldCheck size={18} />
            </div>
            <div className="feature-text">
              <strong>Zero Sponsored Bias</strong>
              <span>100% independent evaluation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
