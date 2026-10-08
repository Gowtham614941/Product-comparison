import React from 'react';
import { X, Trash2, Bell, ExternalLink, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../lib/comparisonUtils';

export default function UserAlertsDrawer({
  isOpen,
  onClose,
  alerts = [],
  loading = false,
  onDeleteAlert,
  onToast
}) {
  if (!isOpen) return null;

  const handleDelete = async (alertId) => {
    try {
      await onDeleteAlert(alertId);
      onToast('Price alert removed');
    } catch (err) {
      onToast(`Failed to remove alert: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content drawer-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="modal-title">Tracked Price Drop Alerts</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {alerts.length} active {alerts.length === 1 ? 'watchdog target' : 'watchdog targets'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="drawer-loading-box">
            Loading your active alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="drawer-empty-box">
            <div className="empty-icon-wrap" style={{ margin: '0 auto 12px' }}>
              <Bell size={24} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No Active Price Alerts
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Browse the catalog or comparison matrix and click the bell icon on any product to track price drops.
            </p>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Explore Products
            </button>
          </div>
        ) : (
          <div className="drawer-alerts-list">
            {alerts.map(alert => {
              const prod = alert.product || alert.products;
              const prices = prod?.store_prices?.map(s => Number(s.price)) || [];
              const currentBest = prices.length > 0 ? Math.min(...prices) : null;

              return (
                <div key={alert.id} className="drawer-alert-item">
                  <div className="drawer-alert-details">
                    <span className="drawer-alert-brand">{prod?.brand}</span>
                    <h5 className="drawer-alert-title">{prod?.name}</h5>
                    <div className="drawer-alert-meta">
                      <span>Target: <strong className="text-emerald">{formatCurrency(alert.target_price)}</strong></span>
                      {currentBest && (
                        <span>Current Best: <strong className="text-primary">{formatCurrency(currentBest)}</strong></span>
                      )}
                    </div>
                    {alert.email && (
                      <span className="drawer-alert-email">Notifying: {alert.email}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(alert.id)}
                    title="Delete alert"
                    className="drawer-delete-btn"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
