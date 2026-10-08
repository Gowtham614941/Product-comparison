import React, { useState } from 'react';
import { Layers, ArrowUp, Mail, CheckCircle2, Shield, Heart } from 'lucide-react';
import './Footer.css';

export default function Footer({ onSelectCategory }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="human-footer">
      <div className="container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              <div className="brand-icon">
                <Layers size={18} />
              </div>
              <span className="footer-brand-title">OmniSpec</span>
            </div>
            <p className="footer-tagline">
              Independent hardware comparison and price intelligence engine. 
              Objective specs, weighted scoring, and verified multi-store deals with zero sponsored bias.
            </p>
            <div className="footer-system-pill">
              <span className="system-dot" />
              <span>Catalog Sync: Operational</span>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Browse Categories</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => { onSelectCategory?.('smartphones'); scrollToTop(); }} className="footer-link-btn">
                  Smartphones
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('laptops'); scrollToTop(); }} className="footer-link-btn">
                  Laptops & Ultrabooks
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('headphones'); scrollToTop(); }} className="footer-link-btn">
                  Wireless Headphones
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('smartwatches'); scrollToTop(); }} className="footer-link-btn">
                  Smartwatches & Wearables
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('tablets'); scrollToTop(); }} className="footer-link-btn">
                  Tablets & Slates
                </button>
              </li>
            </ul>
          </div>

          {/* Tools & Engine */}
          <div className="footer-col">
            <h4 className="footer-col-title">Comparison Tools</h4>
            <ul className="footer-links">
              <li><span className="footer-link-text">Side-by-Side Matrix</span></li>
              <li><span className="footer-link-text">Weighted Utility Scoring</span></li>
              <li><span className="footer-link-text">Multi-Retailer Price Tracking</span></li>
              <li><span className="footer-link-text">Historical Volatility Sparklines</span></li>
              <li><span className="footer-link-text">Price Drop Watchdog</span></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="footer-col footer-newsletter-col">
            <h4 className="footer-col-title">Price Drop Newsletter</h4>
            <p className="footer-newsletter-desc">
              Subscribe for weekly hardware teardowns, benchmark updates, and verified retailer price drops.
            </p>

            {subscribed ? (
              <div className="newsletter-success">
                <CheckCircle2 size={16} />
                <span>You're on the list! We'll keep you updated.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <div className="newsletter-input-wrap">
                  <Mail size={16} className="newsletter-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="newsletter-input"
                  />
                </div>
                <button type="submit" className="newsletter-btn">
                  Join
                </button>
              </form>
            )}
            <span className="newsletter-privacy-note">
              No sponsored promotions or spam. Unsubscribe at any time.
            </span>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} OmniSpec Intelligence. Built for informed consumers and tech professionals.
          </div>

          <div className="footer-bottom-actions">
            <span className="footer-meta-tag">Currency: USD ($)</span>
            <span className="footer-meta-tag">Coverage: Global Retailers</span>
            <button onClick={scrollToTop} className="back-to-top-btn" title="Back to top">
              <span>Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
