import React, { useMemo } from 'react';
import { X, Bell, Star } from 'lucide-react';
import ProductImage from './ProductImage';
import Sparkline from './Sparkline';
import MarketOracleBadge from './MarketOracleBadge';
import StorePricesTable from './StorePricesTable';
import { formatCurrency, formatSpecValue, isSpecIdentical } from '../lib/comparisonUtils';

export default function CompareTable({
  products = [],
  specDefs = [],
  scores = {},
  rowWinners = {},
  differencesOnly = false,
  onRemoveProduct,
  onOpenAlertModal
}) {
  if (!products || products.length === 0) return null;

  // Group specs by category definition group or 'Specifications'
  const groupedSpecs = useMemo(() => {
    const groups = {};
    specDefs.forEach(def => {
      const g = def.group || 'General Specifications';
      if (!groups[g]) groups[g] = [];
      groups[g].push(def);
    });
    return groups;
  }, [specDefs]);

  // Filter specs if differencesOnly is enabled
  const filteredGroupedSpecs = useMemo(() => {
    if (!differencesOnly) return groupedSpecs;

    const filtered = {};
    Object.entries(groupedSpecs).forEach(([groupName, defs]) => {
      const diffDefs = defs.filter(def => !isSpecIdentical(products, def.key));
      if (diffDefs.length > 0) {
        filtered[groupName] = diffDefs;
      }
    });
    return filtered;
  }, [groupedSpecs, differencesOnly, products]);

  const totalHiddenSpecs = useMemo(() => {
    if (!differencesOnly) return 0;
    let count = 0;
    specDefs.forEach(def => {
      if (isSpecIdentical(products, def.key)) count++;
    });
    return count;
  }, [differencesOnly, specDefs, products]);

  return (
    <div className="matrix-wrapper">
      {differencesOnly && totalHiddenSpecs > 0 && (
        <div style={{ padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.75rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Hiding {totalHiddenSpecs} identical specification rows across compared items</span>
        </div>
      )}

      <table className="matrix-table">
        {/* Sticky Headers with Products */}
        <thead>
          <tr>
            <th className="col-spec-title">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Comparison Matrix
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {products.length} Products
              </div>
            </th>

            {products.map(p => {
              const bestPrice = scores[p.id]?.bestPrice;
              const overall = scores[p.id]?.overallScore;

              return (
                <th key={p.id} style={{ minWidth: '240px', width: `${100 / products.length}%` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="brand-pill">{p.brand}</span>
                    <button
                      onClick={() => onRemoveProduct(p.id)}
                      title="Remove from comparison"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ width: '100%', height: '140px', marginBottom: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                    <ProductImage src={p.image_url} alt={p.name} />
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {p.name}
                  </div>

                  {p.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--amber)', marginBottom: '8px' }}>
                      <Star size={12} fill="currentColor" />
                      <span>{Number(p.rating).toFixed(1)} / 5.0</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                      {bestPrice ? formatCurrency(bestPrice) : 'N/A'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>best price</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onOpenAlertModal(p)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.72rem' }}
                    >
                      <Bell size={12} />
                      <span>Price Alert</span>
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {/* Executive Scores Section */}
          <tr className="spec-group-row">
            <td colSpan={products.length + 1}>Performance & Value Metrics</td>
          </tr>

          {/* Overall Normalized Score Row */}
          <tr>
            <td className="col-spec-title">Overall Utility Score</td>
            {products.map(p => {
              const score = scores[p.id]?.overallScore ?? 0;
              return (
                <td key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{score}</strong>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(0, score))}%`,
                          background: 'var(--primary-gradient)',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Value Quotient Row */}
          <tr>
            <td className="col-spec-title">Value for Money Index</td>
            {products.map(p => {
              const valScore = scores[p.id]?.valueScore ?? 0;
              return (
                <td key={p.id}>
                  <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>
                    {valScore} pts
                  </span>
                </td>
              );
            })}
          </tr>

          {/* Pricing & Timing Section */}
          <tr className="spec-group-row">
            <td colSpan={products.length + 1}>Market Timing & Retailer Pricing</td>
          </tr>

          {/* Market Oracle Timing Row */}
          <tr>
            <td className="col-spec-title">Purchase Timing Oracle</td>
            {products.map(p => {
              const bestPrice = scores[p.id]?.bestPrice;
              return (
                <td key={p.id}>
                  <MarketOracleBadge currentPrice={bestPrice} priceHistory={p.price_history} />
                </td>
              );
            })}
          </tr>

          {/* Price History Sparkline Row */}
          <tr>
            <td className="col-spec-title">Price Trend Line</td>
            {products.map(p => (
              <td key={p.id}>
                <Sparkline priceHistory={p.price_history} width={200} height={46} />
              </td>
            ))}
          </tr>

          {/* Store Deals Row */}
          <tr>
            <td className="col-spec-title">Store Prices & Availability</td>
            {products.map(p => (
              <td key={p.id}>
                <StorePricesTable storePrices={p.store_prices} />
              </td>
            ))}
          </tr>

          {/* Dynamic Category Specifications Groups */}
          {Object.entries(filteredGroupedSpecs).map(([groupName, defs]) => (
            <React.Fragment key={groupName}>
              <tr className="spec-group-row">
                <td colSpan={products.length + 1}>{groupName}</td>
              </tr>

              {defs.map(def => {
                const winners = rowWinners[def.key] || [];

                return (
                  <tr key={def.key}>
                    <td className="col-spec-title">
                      <div>{def.label}</div>
                      {def.unit && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ({def.unit})
                        </span>
                      )}
                    </td>

                    {products.map(p => {
                      const val = p.specs?.[def.key];
                      const isWinner = winners.includes(p.id);
                      const formatted = formatSpecValue(val, def);

                      return (
                        <td key={p.id} className={isWinner ? 'cell-winner' : ''}>
                          {def.type === 'bool' ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: val ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: val ? '#34d399' : 'var(--text-muted)'
                              }}
                            >
                              {formatted}
                            </span>
                          ) : (
                            <span>{formatted}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
