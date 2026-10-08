import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, Check, ExternalLink, X, RefreshCw } from 'lucide-react';
import { checkSupabaseHealth, isSupabaseConfigured } from '../lib/supabase';

export default function ConnectionStatusModal({ isOpen, onClose, onToast }) {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(true);
  const [copied, setCopied] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    const res = await checkSupabaseHealth();
    setHealth(res);
    setChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyEnvSnippet = () => {
    const text = `# In your .env file:\nVITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key\nSUPABASE_SERVICE_ROLE_KEY=your-service-key`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onToast) onToast('Environment variable snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Database size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>Supabase Infrastructure Status</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time database connectivity and schema diagnostics</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Status Card */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--bg-card-border)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {checking ? (
                <RefreshCw size={18} className="spin" color="var(--primary)" />
              ) : health?.connected ? (
                <CheckCircle2 size={18} color="var(--emerald)" />
              ) : (
                <AlertTriangle size={18} color="var(--amber)" />
              )}
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: health?.connected ? '#34d399' : '#fbbf24' }}>
                {checking ? 'Testing Supabase Connection...' : health?.connected ? 'Supabase Database Connected' : 'Supabase Connection Pending'}
              </span>
            </div>

            <button
              onClick={runCheck}
              disabled={checking}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              <RefreshCw size={12} />
              <span>Recheck</span>
            </button>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            {health?.message}
          </p>

          {/* Counts Matrix if Connected */}
          {health?.connected && health.counts && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid var(--bg-card-border)', paddingTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{health.counts.categories}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Categories</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{health.counts.products}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Products</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{health.counts.store_prices}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Store Prices</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{health.counts.price_history}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Price Logs</div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Guide */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Setup & Connection Instructions
          </h4>
          <ol style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              Execute the prepared SQL script located at <code>supabase/schema.sql</code> inside your <strong>Supabase SQL Editor</strong> to create tables, triggers, and security policies.
            </li>
            <li>
              Add your credentials to <code>.env</code> in the project root:
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <pre style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px', borderRadius: '6px', border: '1px solid var(--bg-card-border)', fontSize: '0.75rem', color: '#a5b4fc', overflowX: 'auto' }}>
{`VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>`}
                </pre>
                <button
                  onClick={copyEnvSnippet}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                  title="Copy .env template"
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                </button>
              </div>
            </li>
            <li>
              Once credentials are saved, restart or reload Vite, and your real database catalog will load live.
            </li>
          </ol>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
