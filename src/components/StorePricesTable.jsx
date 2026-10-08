import React from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../lib/comparisonUtils';

export default function StorePricesTable({ storePrices = [] }) {
  if (!storePrices || storePrices.length === 0) {
    return (
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        No store pricing available
      </div>
    );
  }

  // Sort lowest price first
  const sorted = [...storePrices].sort((a, b) => Number(a.price) - Number(b.price));
  const lowestPrice = Number(sorted[0]?.price);

  return (
    <div className="store-deals-list">
      {sorted.map(sp => {
        const isLowest = Number(sp.price) === lowestPrice;
        return (
          <div key={sp.id || sp.store} className={`store-deal-row ${isLowest ? 'cheapest' : ''}`}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{sp.store}</span>
                {isLowest && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--emerald)', color: '#000', fontWeight: 800 }}>
                    BEST DEAL
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, color: isLowest ? '#34d399' : 'var(--text-primary)' }}>
                {formatCurrency(sp.price)}
              </span>
              <a
                href={sp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                title={`Visit ${sp.store}`}
              >
                <span>Store</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
