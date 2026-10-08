import React from 'react';
import { Layers, Bell, ArrowLeftRight, LogOut, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar({
  viewMode,
  setViewMode,
  selectedCount = 0,
  alertsCount = 0,
  onOpenAlerts,
  user,
  onSignOut
}) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand-group">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setViewMode('catalog'); }}
            className="brand-logo"
          >
            <div className="brand-icon">
              <Layers size={18} />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">OmniSpec</span>
              <span className="brand-subtitle">Spec & Price Intelligence</span>
            </div>
          </a>
        </div>

        {/* View Navigation Switcher */}
        <nav className="nav-center-links">
          <button
            onClick={() => setViewMode('catalog')}
            className={`nav-link-btn ${viewMode === 'catalog' ? 'active' : ''}`}
          >
            <span>Explore Catalog</span>
          </button>

          <button
            onClick={() => setViewMode('compare')}
            className={`nav-link-btn ${viewMode === 'compare' ? 'active' : ''}`}
            disabled={selectedCount < 2 && viewMode !== 'compare'}
            title={selectedCount < 2 ? 'Select at least 2 items to view Comparison Matrix' : 'Open Comparison Matrix'}
          >
            <ArrowLeftRight size={14} />
            <span>Comparison Matrix</span>
            {selectedCount > 0 && (
              <span className="nav-count-badge">
                {selectedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Price Drop Alerts Drawer Trigger */}
          <button
            onClick={onOpenAlerts}
            className="nav-alerts-btn"
            title="View saved price drop alerts"
          >
            <Bell size={14} />
            <span className="alerts-btn-label">Alerts</span>
            {alertsCount > 0 && (
              <span className="alerts-active-dot">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Quick CTA to Compare if items selected */}
          {selectedCount >= 2 && viewMode === 'catalog' && (
            <button
              onClick={() => setViewMode('compare')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Compare ({selectedCount})</span>
              <ArrowLeftRight size={13} />
            </button>
          )}

          {/* User Profile & Sign Out */}
          {user && (
            <div className="nav-user-cluster">
              <div className="nav-user-pill" title={`Signed in as ${user.email}`}>
                <div className="user-avatar-dot">
                  <User size={12} />
                </div>
                <span className="user-email-text">{displayName}</span>
              </div>
              <button
                onClick={onSignOut}
                className="btn-signout"
                title="Sign out and return to Introduction page"
              >
                <LogOut size={14} />
                <span className="signout-label">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
