import React from 'react';
import { Star, Check, Plus, Layers } from 'lucide-react';
import ProductImage from './ProductImage';
import { formatCurrency, formatSpecValue } from '../lib/comparisonUtils';

export default function ProductCard({
  product,
  specDefs = [],
  isSelected = false,
  onToggleCompare,
  disabled = false
}) {
  const storePrices = product.store_prices || [];
  const prices = storePrices.map(s => Number(s.price)).filter(p => !isNaN(p) && p > 0);
  const bestPrice = prices.length > 0 ? Math.min(...prices) : null;

  // Pick 2-3 interesting specs to highlight as preview chips
  const previewSpecs = specDefs
    .filter(d => d.dir !== 0 && product.specs?.[d.key] !== undefined)
    .slice(0, 3);

  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-image-wrap">
        <ProductImage src={product.image_url} alt={product.name} />
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="brand-pill">{product.brand}</span>
          {storePrices.length > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {storePrices.length} {storePrices.length === 1 ? 'store' : 'stores'}
            </span>
          )}
        </div>

        <h3 className="product-name">{product.name}</h3>

        {product.rating > 0 && (
          <div className="rating-badge">
            <Star size={13} fill="currentColor" />
            <span>{Number(product.rating).toFixed(1)}</span>
          </div>
        )}

        {previewSpecs.length > 0 && (
          <div className="card-spec-tags">
            {previewSpecs.map(def => (
              <span key={def.key} className="spec-pill" title={def.label}>
                {formatSpecValue(product.specs?.[def.key], def)}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <div className="price-block">
            <span className="price-label">Best Price</span>
            <span className="price-val">
              {bestPrice ? formatCurrency(bestPrice) : 'N/A'}
            </span>
          </div>

          <button
            onClick={() => onToggleCompare(product)}
            className={`compare-toggle-btn ${isSelected ? 'selected' : ''}`}
            disabled={disabled && !isSelected}
            title={isSelected ? 'Remove from comparison' : 'Add to side-by-side comparison'}
          >
            {isSelected ? (
              <>
                <Check size={14} />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
