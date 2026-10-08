import React, { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, HelpCircle } from 'lucide-react';
import { evaluateMarketTiming } from '../lib/scoring';
import { formatCurrency } from '../lib/comparisonUtils';

export default function MarketOracleBadge({ currentPrice, priceHistory = [] }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timing = evaluateMarketTiming(currentPrice, priceHistory);

  const config = {
    STRONG_BUY: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#34d399',
      icon: Sparkles
    },
    WAIT: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: '#fbbf24',
      icon: Clock
    },
    FAIR: {
      bg: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.4)',
      text: '#a5b4fc',
      icon: CheckCircle2
    },
    INSUFFICIENT_DATA: {
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      text: '#94a3b8',
      icon: HelpCircle
    }
  }[timing.status] || {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#94a3b8',
    icon: HelpCircle
  };

  const Icon = config.icon;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.text,
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'help',
          transition: 'all 0.2s ease'
        }}
      >
        <Icon size={12} />
        <span>{timing.label}</span>
      </div>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 14, 23, 0.98)',
            border: '1px solid var(--bg-card-border)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
            padding: '10px 14px',
            borderRadius: '8px',
            width: '220px',
            fontSize: '0.75rem',
            color: 'var(--text-primary)',
            zIndex: 50,
            pointerEvents: 'none',
            lineHeight: 1.4
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '4px', color: config.text }}>
            Market Timing Intelligence
          </div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {timing.reason}
          </div>
          {timing.avgPrice && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px', color: 'var(--text-muted)' }}>
              <span>Historical Avg:</span>
              <span style={{ color: '#fff' }}>{formatCurrency(timing.avgPrice)}</span>
            </div>
          )}
          {timing.lowPrice && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Historical Low:</span>
              <span style={{ color: '#34d399' }}>{formatCurrency(timing.lowPrice)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
