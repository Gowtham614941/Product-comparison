import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatCurrency } from '../lib/comparisonUtils';

export default function Sparkline({ priceHistory = [], width = 180, height = 50 }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Minus size={14} />
        <span>No price history yet</span>
      </div>
    );
  }

  // Sort chronological
  const sorted = [...priceHistory].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  const prices = sorted.map(item => Number(item.price)).filter(p => !isNaN(p) && p > 0);

  if (prices.length < 2) {
    return (
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Current: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(prices[0] || 0)}</strong>
      </div>
    );
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;

  const paddingX = 8;
  const paddingY = 8;
  const drawWidth = width - paddingX * 2;
  const drawHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = prices.map((price, idx) => {
    const x = paddingX + (idx / (prices.length - 1)) * drawWidth;
    const y = height - paddingY - ((price - minPrice) / range) * drawHeight;
    return { x, y, price, date: sorted[idx]?.recorded_at };
  });

  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Price trend direction
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isDown = lastPrice < firstPrice;
  const strokeColor = isDown ? '#10b981' : lastPrice > firstPrice ? '#f43f5e' : '#6366f1';
  const fillColor = isDown ? 'rgba(16, 185, 129, 0.1)' : lastPrice > firstPrice ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)';

  // Area path
  const areaPath = `M ${points[0].x},${height} L ${polylinePoints} L ${points[points.length - 1].x},${height} Z`;

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`sparkGrad-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Filled Area */}
        <polygon points={`${points[0].x},${height} ${polylinePoints} ${points[points.length - 1].x},${height}`} fill={fillColor} />

        {/* Stroke Line */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {/* Interactive Hover Hit Circles */}
        {points.map((pt, i) => (
          <g key={i} onMouseEnter={() => setHoverIndex(i)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 4 : 2}
              fill={hoverIndex === i ? '#ffffff' : strokeColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Invisible larger hover target */}
            <circle cx={pt.x} cy={pt.y} r={10} fill="transparent" />
          </g>
        ))}
      </svg>

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            bottom: `${height + 4}px`,
            left: `${hoveredPoint.x}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(8, 12, 21, 0.95)',
            border: '1px solid var(--bg-card-border)',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ fontWeight: 700, color: '#fff' }}>{formatCurrency(hoveredPoint.price)}</div>
          {hoveredPoint.date && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              {new Date(hoveredPoint.date).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Mini Trend Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
        <span>Low: {formatCurrency(minPrice)}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: strokeColor }}>
          {isDown ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
          {isDown ? 'Down' : lastPrice > firstPrice ? 'Up' : 'Stable'}
        </span>
      </div>
    </div>
  );
}
