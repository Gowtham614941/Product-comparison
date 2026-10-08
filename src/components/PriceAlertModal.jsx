import React, { useState } from 'react';
import { Bell, X, Check, Mail, Sparkles, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../lib/comparisonUtils';

export default function PriceAlertModal({
  product,
  onClose,
  onCreateAlert,
  onToast
}) {
  const bestPrice = product?.store_prices && product.store_prices.length > 0
    ? Math.min(...product.store_prices.map(s => Number(s.price)))
    : 500;

  const [targetPrice, setTargetPrice] = useState(Math.round(bestPrice * 0.92));
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  if (!product) return null;

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      onToast('Please provide a valid email address for notifications');
      return;
    }

    if (targetPrice >= bestPrice) {
      onToast('Target price should be lower than current best price');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateAlert(product, targetPrice, email);
      setAlertSuccess(true);
      onToast(`Price alert activated! We'll track ${product.name}`);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      onToast(`Failed to create alert: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const savings = Math.max(0, bestPrice - targetPrice);
  const percentDrop = Math.round((savings / bestPrice) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="modal-title">Set Price Drop Alert</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get notified immediately when prices hit your target</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="alert-product-summary">
          <div className="alert-product-brand">{product.brand}</div>
          <div className="alert-product-name">{product.name}</div>
          <div className="alert-current-price">
            Current Best Retail Price: <strong>{formatCurrency(bestPrice)}</strong>
          </div>
        </div>

        {alertSuccess ? (
          <div className="alert-success-box">
            <Check size={28} className="text-emerald" />
            <h4>Price Watchdog Activated</h4>
            <p>
              We'll monitor retailers and notify <strong>{email}</strong> the instant {product.name} reaches <strong>{formatCurrency(targetPrice)}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateAlert} className="alert-form">
            <div className="form-group">
              <label className="form-label">
                Target Price Threshold ($)
              </label>
              <div className="price-input-row">
                <input
                  type="number"
                  min="50"
                  max={bestPrice - 1}
                  value={targetPrice}
                  onChange={e => setTargetPrice(Number(e.target.value))}
                  className="form-input"
                  required
                />
                <span className="price-discount-pill">
                  <TrendingDown size={13} />
                  <span>{percentDrop}% below current</span>
                </span>
              </div>
              <span className="form-hint">
                You'll save {formatCurrency(savings)} compared to today's best price.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Notification Email Address
              </label>
              <div className="email-input-wrap">
                <Mail size={16} className="email-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input email-field"
                  required
                />
              </div>
              <span className="form-hint">
                Zero spam. Used exclusively for this product price alert.
              </span>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                <Bell size={15} />
                <span>{isSubmitting ? 'Activating...' : 'Activate Price Alert'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
