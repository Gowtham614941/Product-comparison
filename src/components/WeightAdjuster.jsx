import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { WEIGHT_LEVELS } from '../lib/scoring';

const STEPS = [
  { val: 0.0, label: 'Ignore', color: '#64748b' },
  { val: 1.0, label: 'Normal', color: '#94a3b8' },
  { val: 1.75, label: 'High', color: '#818cf8' },
  { val: 2.5, label: 'Top Priority', color: '#38bdf8' }
];

export default function WeightAdjuster({ specDefs = [], weights = {}, onWeightChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  // Scorable specs only (dir !== 0 and type is number or bool)
  const scorableDefs = specDefs.filter(d => d.dir !== 0 && (d.type === 'number' || d.type === 'bool'));

  if (scorableDefs.length === 0) return null;

  const modifiedCount = Object.entries(weights).filter(([_, w]) => Math.abs(w - 1.0) > 0.05).length;

  return (
    <div className="weights-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}
        >
          <SlidersHorizontal size={18} color="var(--primary)" />
          <span>Custom Importance Weights</span>
          {modifiedCount > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '9999px', background: 'var(--primary-light)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
              {modifiedCount} customized
            </span>
          )}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && modifiedCount > 0 && (
          <button
            onClick={onReset}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={12} />
            <span>Reset All to Normal (1.0x)</span>
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '16px' }}>
            Adjust how much each specification influences the verdict. Setting an attribute to <strong>Ignore</strong> excludes it completely from scoring.
          </p>

          <div className="weights-grid">
            {scorableDefs.map(def => {
              const currentWeight = weights[def.key] !== undefined ? weights[def.key] : 1.0;
              // Find closest step
              let activeStep = STEPS[1];
              if (currentWeight <= 0.2) activeStep = STEPS[0];
              else if (currentWeight >= 2.1) activeStep = STEPS[3];
              else if (currentWeight >= 1.4) activeStep = STEPS[2];

              return (
                <div key={def.key} className="weight-item">
                  <div className="weight-label-row">
                    <span style={{ color: 'var(--text-primary)' }}>{def.label}</span>
                    <span style={{ color: activeStep.color, fontSize: '0.75rem', fontWeight: 700 }}>
                      {activeStep.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {STEPS.map(step => (
                      <button
                        key={step.label}
                        onClick={() => onWeightChange(def.key, step.val)}
                        style={{
                          flex: 1,
                          padding: '5px 2px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: activeStep.val === step.val ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                          background: activeStep.val === step.val ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.02)',
                          color: activeStep.val === step.val ? '#a5b4fc' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {step.label === 'Top Priority' ? 'Top' : step.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
