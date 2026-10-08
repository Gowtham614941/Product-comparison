import React from 'react';
import { ArrowRight, X, Trash2 } from 'lucide-react';
import ProductImage from './ProductImage';

export default function FloatingDock({
  selectedProducts = [],
  onRemove,
  onClear,
  onCompareNow,
  isComparing = false
}) {
  // Hide dock when empty or when already inside comparison matrix
  if (selectedProducts.length === 0 || isComparing) return null;

  const slots = [0, 1, 2, 3];
  const canCompare = selectedProducts.length >= 2;

  return (
    <div className="floating-dock">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div className="dock-slots">
          {slots.map(idx => {
            const prod = selectedProducts[idx];
            if (prod) {
              return (
                <div key={prod.id} className="dock-slot filled" title={`${prod.brand} ${prod.name}`}>
                  <ProductImage src={prod.image_url} alt={prod.name} />
                  <div
                    className="dock-remove-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(prod.id);
                    }}
                    title="Remove item"
                  >
                    <X size={14} />
                  </div>
                </div>
              );
            }
            return (
              <div key={idx} className="dock-slot empty" title="Empty comparison slot" />
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
            {selectedProducts.length} of 4 selected
          </span>
          <span style={{ fontSize: '0.72rem', color: canCompare ? '#34d399' : '#fbbf24', marginTop: '2px' }}>
            {canCompare ? 'Ready for side-by-side comparison' : 'Pick at least 2 items'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onClear}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          title="Clear all selected products"
        >
          <Trash2 size={13} />
          <span>Clear</span>
        </button>

        <button
          onClick={onCompareNow}
          disabled={!canCompare}
          className="btn btn-primary"
          style={{
            opacity: canCompare ? 1 : 0.45,
            cursor: canCompare ? 'pointer' : 'not-allowed',
            padding: '7px 16px',
            fontSize: '0.825rem'
          }}
        >
          <span>Compare Now</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
