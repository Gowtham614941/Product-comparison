import React, { useState } from 'react';
import { Award, Zap, DollarSign, Info, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../lib/comparisonUtils';

export default function VerdictBanner({ verdicts, scores }) {
  const [showMethodology, setShowMethodology] = useState(false);

  if (!verdicts || (!verdicts.bestSpecs && !verdicts.bestValue && !verdicts.lowestPrice)) {
    return null;
  }

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Comparative Verdicts
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Algorithmic evaluation across weighted specs and real-time pricing
          </span>
        </div>
        <button
          onClick={() => setShowMethodology(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#a5b4fc',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          <Info size={14} />
          <span>How Verdicts Work</span>
        </button>
      </div>

      <div className="verdict-banner">
        {/* 1. Best Overall Specs */}
        {verdicts.bestSpecs && (
          <div className="verdict-card best-specs" onClick={triggerCelebration} style={{ cursor: 'pointer' }}>
            <div className="verdict-icon-box">
              <Award size={22} />
            </div>
            <div>
              <div className="verdict-title" style={{ color: '#818cf8' }}>Best Overall Specs</div>
              <div className="verdict-product-name">
                {verdicts.bestSpecs.product.brand} {verdicts.bestSpecs.product.name}
              </div>
              <div className="verdict-detail">
                Normalized Spec Score: <strong style={{ color: '#fff' }}>{verdicts.bestSpecs.score}/100</strong>
              </div>
            </div>
          </div>
        )}

        {/* 2. Best Value for Money */}
        {verdicts.bestValue && (
          <div className="verdict-card best-value" onClick={triggerCelebration} style={{ cursor: 'pointer' }}>
            <div className="verdict-icon-box">
              <Zap size={22} />
            </div>
            <div>
              <div className="verdict-title" style={{ color: '#34d399' }}>Best Value for Money</div>
              <div className="verdict-product-name">
                {verdicts.bestValue.product.brand} {verdicts.bestValue.product.name}
              </div>
              <div className="verdict-detail">
                Value Efficiency Index: <strong style={{ color: '#fff' }}>{verdicts.bestValue.score} pts</strong>
              </div>
            </div>
          </div>
        )}

        {/* 3. Lowest Price */}
        {verdicts.lowestPrice && (
          <div className="verdict-card lowest-price">
            <div className="verdict-icon-box">
              <DollarSign size={22} />
            </div>
            <div>
              <div className="verdict-title" style={{ color: '#fbbf24' }}>Lowest Available Price</div>
              <div className="verdict-product-name">
                {verdicts.lowestPrice.product.brand} {verdicts.lowestPrice.product.name}
              </div>
              <div className="verdict-detail">
                Best Retailer Price: <strong style={{ color: '#fff' }}>{formatCurrency(verdicts.lowestPrice.price)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="modal-overlay" onClick={() => setShowMethodology(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Algorithmic Scoring Engine</h3>
              <button className="modal-close" onClick={() => setShowMethodology(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '14px' }}>
                OmniSpec utilizes <strong>Multi-Attribute Utility Theory (MAUT)</strong> to convert heterogeneous product specifications into normalized 0&ndash;100 utility scores:
              </p>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '8px', border: '1px solid var(--bg-card-border)', marginBottom: '16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#a5b4fc' }}>
                Overall Score = 100 &times; [&Sigma; (Weight<sub>k</sub> &times; NormalizedSpec<sub>k</sub>)] / [&Sigma; Weight<sub>k</sub>]
                <br /><br />
                Value Score = Overall Score / (Lowest Retailer Price / $10,000)
              </div>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Directional Normalization:</strong> Numeric specs automatically adjust based on whether higher or lower values are optimal (e.g., lower latency or lighter weight vs higher battery capacity).</li>
                <li><strong>Dynamic Weights:</strong> When you adjust priority sliders (Ignore, Normal, High, Top), the scoring engine recalculates all utility vectors in real time.</li>
                <li><strong>Value Index:</strong> Balances pure specification performance against current real-world pricing across all indexed stores.</li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowMethodology(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
