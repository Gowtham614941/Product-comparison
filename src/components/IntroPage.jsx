import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  TrendingDown, 
  Sliders, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Tablet,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  BarChart3,
  Scale,
  DollarSign,
  Clock
} from 'lucide-react';
import './IntroPage.css';

export default function IntroPage({
  onLogin,
  onSignUp,
  onGuestAccess,
  onBypassAsUser,
  authLoading = false
}) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Countdown timer for rate-limit cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate spam submissions while already processing or in cooldown
    if (submitting || authLoading || cooldownSeconds > 0) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsRateLimited(false);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      if (authMode === 'signin') {
        const res = await onLogin(email, password);
        if (res?.error) {
          const msg = res.error.message?.toLowerCase() || '';
          if (res.error.isRateLimit || res.error.status === 429 || msg.includes('rate limit')) {
            setIsRateLimited(true);
            setCooldownSeconds(15);
            setErrorMsg(res.error.message || 'Authentication rate limit reached. Please wait a few moments before trying again.');
          } else {
            setErrorMsg(res.error.message || 'Invalid email or password.');
          }
        }
      } else {
        const res = await onSignUp(email, password, fullName);
        if (res?.error) {
          const msg = res.error.message?.toLowerCase() || '';
          if (res.error.isRateLimit || res.error.status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
            setIsRateLimited(true);
            setErrorMsg(
              res.error.message || 
              'Email rate limit exceeded: Supabase limits outgoing confirmation emails. You can bypass this instantly and enter the workspace below.'
            );
          } else {
            setErrorMsg(res.error.message || 'Failed to create account.');
          }
        } else {
          setSuccessMsg('Account created successfully! Entering workspace...');
        }
      }
    } catch (err) {
      const msg = err.message?.toLowerCase() || '';
      if (err.status === 429 || msg.includes('rate limit')) {
        setIsRateLimited(true);
        setErrorMsg('Email rate limit exceeded. You can bypass this and continue directly into the workspace below.');
      } else {
        setErrorMsg(err.message || 'Authentication error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    if (onGuestAccess) {
      onGuestAccess();
    }
  };

  const handleBypassAsUser = () => {
    if (onBypassAsUser) {
      onBypassAsUser(email || 'kritika@gmail.com', fullName || 'kritika');
    } else if (onGuestAccess) {
      onGuestAccess();
    }
  };

  const scrollToAuth = (mode = null) => {
    if (mode) {
      setAuthMode(mode);
      setErrorMsg('');
      setSuccessMsg('');
    }
    const el = document.getElementById('auth-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const fillDemoCredentials = () => {
    setEmail('gowtham@gmail.com');
    setPassword('1234@g');
    setErrorMsg('');
  };

  return (
    <div className="intro-container">
      {/* Ambient background glows */}
      <div className="ambient-glow glow-top-center" />
      <div className="ambient-glow glow-top-right" />

      {/* Top Navigation */}
      <header className="intro-header">
        <div className="container intro-header-inner">
          <div className="brand-logo">
            <div className="brand-icon">
              <Layers size={18} />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">OmniSpec</span>
              <span className="brand-subtitle">Hardware & Price Intelligence</span>
            </div>
          </div>

          <div className="intro-header-actions">
            <div className="header-status-badge">
              <span className="status-live-dot" />
              <span>Catalog Sync Operational</span>
            </div>
            <button 
              onClick={() => scrollToAuth('signin')} 
              className="btn btn-secondary btn-sm nav-signin-btn"
            >
              Sign In
            </button>
            <button 
              onClick={handleGuest} 
              className="btn btn-primary btn-sm nav-demo-btn"
            >
              <Sparkles size={13} />
              <span>Explore Demo</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="intro-hero">
        <div className="container">
          <div className="intro-hero-grid">
            {/* Left Column: Narrative */}
            <div className="intro-hero-text">
              <div className="intro-eyebrow">
                <span className="eyebrow-spark" />
                <span className="eyebrow-text">Next-Generation Comparison Intelligence</span>
              </div>

              <h1 className="intro-title">
                Hardware intelligence. <br />
                <span className="intro-title-gradient">Zero marketing hype.</span>
              </h1>

              <p className="intro-description">
                Evaluate flagship devices side-by-side with mathematical utility scoring,
                multi-retailer price tracking, and historical volatility trends. Built for engineers, analysts, and discerning buyers.
              </p>

              {/* Stat Metric Cards */}
              <div className="intro-metrics-row">
                <div className="intro-metric-card">
                  <div className="metric-header">
                    <span className="metric-number">17+</span>
                    <Smartphone size={14} className="metric-icon" />
                  </div>
                  <span className="metric-label">Flagship Devices</span>
                </div>
                <div className="intro-metric-card">
                  <div className="metric-header">
                    <span className="metric-number">60+</span>
                    <BarChart3 size={14} className="metric-icon" />
                  </div>
                  <span className="metric-label">Normalized Specs</span>
                </div>
                <div className="intro-metric-card">
                  <div className="metric-header">
                    <span className="metric-number">5</span>
                    <DollarSign size={14} className="metric-icon" />
                  </div>
                  <span className="metric-label">Major Retailers</span>
                </div>
                <div className="intro-metric-card">
                  <div className="metric-header">
                    <span className="metric-number">100%</span>
                    <Scale size={14} className="metric-icon text-emerald" />
                  </div>
                  <span className="metric-label">Objective Utility</span>
                </div>
              </div>

              {/* Value Highlights */}
              <div className="intro-highlights">
                <div className="highlight-row">
                  <div className="highlight-icon-box">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="highlight-text">
                    <strong>Multi-Attribute Utility Algorithm</strong>
                    <span>Weight battery, GPU performance, display or price by personal priorities</span>
                  </div>
                </div>
                <div className="highlight-row">
                  <div className="highlight-icon-box">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="highlight-text">
                    <strong>Live Retailer Price Arbitrage</strong>
                    <span>Instant pricing feeds across Amazon, Best Buy, B&H, and Apple</span>
                  </div>
                </div>
                <div className="highlight-row">
                  <div className="highlight-icon-box">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="highlight-text">
                    <strong>Historical Volatility Trends</strong>
                    <span>Identify genuine price drops vs artificial MSRP markups</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Auth Card */}
            <div className="intro-auth-col" id="auth-section">
              <div className="intro-auth-card">
                {/* Segmented Control Tabs */}
                <div className="auth-tabs">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`auth-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                  >
                    Create Account
                  </button>
                </div>

                <div className="auth-card-body">
                  <div className="auth-header-text">
                    <h3 className="auth-form-title">
                      {authMode === 'signin' ? 'Welcome Back' : 'Create Free Account'}
                    </h3>
                    <p className="auth-form-subtitle">
                      {authMode === 'signin'
                        ? 'Sign in to access your comparison matrix & saved alerts'
                        : 'Start evaluating hardware with personalized utility weights'}
                    </p>
                  </div>

                  {/* Demo Credential Quick-Fill Badges */}
                  {authMode === 'signin' && (
                    <div className="demo-fill-container">
                      <div className="demo-fill-banner" onClick={() => { setEmail('gowtham@gmail.com'); setPassword('1234@g'); setErrorMsg(''); }}>
                        <div className="demo-fill-left">
                          <Sparkles size={12} className="text-primary" />
                          <span>Demo: <strong>gowtham@gmail.com</strong></span>
                        </div>
                        <span className="demo-fill-action">Fill</span>
                      </div>
                      <div className="demo-fill-banner" onClick={() => { setEmail('kritika@gmail.com'); setPassword('1234@g'); setErrorMsg(''); }}>
                        <div className="demo-fill-left">
                          <Sparkles size={12} className="text-primary" />
                          <span>Demo: <strong>kritika@gmail.com</strong></span>
                        </div>
                        <span className="demo-fill-action">Fill</span>
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className={`auth-alert error ${isRateLimited ? 'rate-limit-alert' : ''}`}>
                      <div className="alert-header-row">
                        <AlertCircle size={16} className="alert-icon" />
                        <strong>{isRateLimited ? 'Email Rate Limit Reached' : 'Authentication Error'}</strong>
                      </div>
                      <p className="alert-text">{errorMsg}</p>
                      {isRateLimited && (
                        <div className="alert-rate-actions">
                          <span className="rate-hint">
                            Supabase limits outgoing confirmation emails on free tier. Bypass the email requirement and jump into the workspace:
                          </span>
                          <div className="rate-actions-row">
                            <button
                              type="button"
                              onClick={handleBypassAsUser}
                              className="rate-demo-btn rate-user-btn"
                            >
                              <Sparkles size={13} />
                              <span>Continue as {fullName || email?.split('@')[0] || 'kritika'} &rarr;</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleGuest}
                              className="rate-demo-btn rate-ghost-btn"
                            >
                              <span>Guest Preview</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {successMsg && (
                    <div className="auth-alert success">
                      <CheckCircle2 size={15} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="auth-form">
                    {authMode === 'signup' && (
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="auth-input-wrap">
                          <User size={15} className="auth-input-icon" />
                          <input
                            type="text"
                            placeholder="Gowtham"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="auth-input"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="auth-input-wrap">
                        <Mail size={15} className="auth-input-icon" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="auth-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="form-label-row">
                        <label className="form-label">Password</label>
                        {authMode === 'signin' && (
                          <span className="form-label-aux">Min. 6 chars</span>
                        )}
                      </div>
                      <div className="auth-input-wrap">
                        <Lock size={15} className="auth-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="auth-input"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="auth-pw-toggle"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || authLoading}
                      className={`btn btn-primary auth-submit-btn ${submitting ? 'btn-loading' : ''}`}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-dot" />
                          <span>{authMode === 'signin' ? 'Authenticating...' : 'Registering Account...'}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {authMode === 'signin'
                              ? 'Sign In to Workspace'
                              : 'Create Account & Continue'}
                          </span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="auth-divider">
                    <span className="auth-divider-line" />
                    <span className="auth-divider-text">OR INSTANT ACCESS</span>
                    <span className="auth-divider-line" />
                  </div>

                  {/* Instant Demo Access Button */}
                  <button
                    type="button"
                    onClick={handleGuest}
                    className="btn btn-secondary guest-access-btn"
                  >
                    <Sparkles size={14} className="guest-sparkle-icon" />
                    <span>Explore Demo as Guest (No Sign In)</span>
                  </button>

                  <p className="auth-footer-note">
                    By accessing OmniSpec, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Ticker Bar */}
      <section className="intro-ticker-bar">
        <div className="container intro-ticker-inner">
          <span className="ticker-label">SUPPORTED HARDWARE CLASSES:</span>
          <div className="ticker-pills">
            <span className="ticker-pill"><Smartphone size={13} /> Flagship Smartphones</span>
            <span className="ticker-pill"><Laptop size={13} /> Workstation Laptops</span>
            <span className="ticker-pill"><Headphones size={13} /> Wireless ANC Audio</span>
            <span className="ticker-pill"><Watch size={13} /> GPS Smartwatches</span>
            <span className="ticker-pill"><Tablet size={13} /> Pro Tablets</span>
          </div>
        </div>
      </section>

      {/* Feature Architecture Section */}
      <section className="intro-features-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-pill">Core Intelligence Platform</span>
            <h2 className="section-title">Built for serious hardware analysis</h2>
            <p className="section-desc">
              Every specification is mathematically normalized into standard units. Every score is derived from reproducible benchmarks.
            </p>
          </div>

          <div className="features-grid-3">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Layers size={22} />
              </div>
              <h3 className="feature-card-title">Side-by-Side Spec Matrix</h3>
              <p className="feature-card-text">
                Compare up to 4 flagship devices across 60+ parameters with instant diff highlighting and best-in-class badges.
              </p>
              <div className="feature-mini-preview">
                <div className="mini-spec-row">
                  <span className="mini-spec-label">Peak Brightness</span>
                  <span className="mini-badge-win">2,600 nits (Best)</span>
                </div>
                <div className="mini-spec-row">
                  <span className="mini-spec-label">Multi-Core Benchmark</span>
                  <span className="mini-badge-neutral">7,480 pts</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Sliders size={22} />
              </div>
              <h3 className="feature-card-title">Weighted Utility Engine</h3>
              <p className="feature-card-text">
                Personalize the importance of battery life, display quality, GPU horsepower, or price to calculate an individualized utility score.
              </p>
              <div className="feature-mini-preview">
                <div className="mini-slider-mock">
                  <div className="mini-slider-label"><span>Battery Life Priority</span><span className="text-emerald">40%</span></div>
                  <div className="mini-slider-track"><div className="mini-slider-fill emerald" style={{ width: '40%' }} /></div>
                </div>
                <div className="mini-slider-mock">
                  <div className="mini-slider-label"><span>GPU Horsepower</span><span className="text-primary">35%</span></div>
                  <div className="mini-slider-track"><div className="mini-slider-fill primary" style={{ width: '35%' }} /></div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <TrendingDown size={22} />
              </div>
              <h3 className="feature-card-title">Retailer Price Intelligence</h3>
              <p className="feature-card-text">
                Real-time pricing from authorized retailers with time-series historical price sparklines and price drop alerts.
              </p>
              <div className="feature-mini-preview">
                <div className="mini-price-row">
                  <span className="mini-store-name"><span className="store-status-dot" />Amazon</span>
                  <span className="mini-price-val">$999 <span className="mini-discount-tag">-12%</span></span>
                </div>
                <div className="mini-price-row">
                  <span className="mini-store-name"><span className="store-status-dot" />Best Buy</span>
                  <span className="mini-price-val muted">$1,099</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="intro-footer">
        <div className="container intro-footer-inner">
          <div className="footer-left">
            <span className="footer-brand-name">OmniSpec Intelligence</span>
            <span className="footer-dot">•</span>
            <span className="footer-copyright">&copy; {new Date().getFullYear()} All rights reserved</span>
          </div>

          <div className="footer-right">
            <span className="footer-status-pill">
              <span className="system-dot" />
              <span>Multi-Source API Connected</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
