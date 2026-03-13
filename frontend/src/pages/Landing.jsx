import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">FORTRESS</div>
        <div className="landing-header-actions">
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <h1 className="landing-hero-title">
          Your Financial Intelligence,
          <br />
          <span className="landing-hero-accent">Fortified</span>
        </h1>
        <p className="landing-hero-sub">
          Smart insights, AI-powered forecasting, and complete control over your
          financial fortress.
        </p>
        <div className="landing-hero-ctas">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/try" className="btn btn-outline btn-lg">
            See Demo
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="landing-section-title">Why Fortress</h2>
        <div className="landing-features-grid">
          <div className="card landing-feature-card">
            <div className="landing-feature-icon">
              <Shield size={28} />
            </div>
            <h3>Protected Goals</h3>
            <p>Set and track financial goals with smart progress monitoring.</p>
          </div>
          <div className="card landing-feature-card">
            <div className="landing-feature-icon">
              <BarChart3 size={28} />
            </div>
            <h3>AI Insights</h3>
            <p>Get intelligent forecasts and behavioral insights.</p>
          </div>
          <div className="card landing-feature-card">
            <div className="landing-feature-icon">
              <Zap size={28} />
            </div>
            <h3>Receipt Processing</h3>
            <p>Scan receipts and auto-categorize spending.</p>
          </div>
        </div>
      </section>

      <section className="landing-pricing">
        <h2 className="landing-section-title">Pricing</h2>
        <div className="landing-pricing-grid">
          <div className="card landing-pricing-card">
            <h3>Free</h3>
            <div className="landing-pricing-price">$0</div>
            <p className="landing-pricing-desc">Core features, up to 3 goals</p>
            <Link to="/register" className="btn btn-outline" style={{ width: '100%' }}>
              Start Free
            </Link>
          </div>
          <div className="card landing-pricing-card landing-pricing-featured">
            <h3>Pro</h3>
            <div className="landing-pricing-price">$9<span>/mo</span></div>
            <p className="landing-pricing-desc">Unlimited goals, AI insights</p>
            <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
              Get Pro
            </Link>
          </div>
          <div className="card landing-pricing-card">
            <h3>Enterprise</h3>
            <div className="landing-pricing-price">Custom</div>
            <p className="landing-pricing-desc">Teams, API, support</p>
            <Link to="/register" className="btn btn-outline" style={{ width: '100%' }}>
              Contact
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-logo">FORTRESS</div>
        <p className="landing-footer-copy">© {new Date().getFullYear()} Fortress. Your financial fortress.</p>
      </footer>

      <style>{`
        .landing { min-height: 100vh; }
        .landing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--card-border);
        }
        .landing-logo { font-weight: 700; font-size: 18px; letter-spacing: 0.05em; }
        .landing-header-actions { display: flex; gap: 12px; }
        .landing-hero {
          padding: 80px 24px 100px;
          text-align: center;
          max-width: 720px;
          margin: 0 auto;
        }
        .landing-hero-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 20px;
        }
        .landing-hero-accent { color: var(--primary); }
        .landing-hero-sub {
          color: var(--text-secondary);
          font-size: 18px;
          margin-bottom: 32px;
        }
        .landing-hero-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-lg { padding: 14px 28px; font-size: 16px; }
        .landing-section-title {
          text-align: center;
          font-size: 1.75rem;
          margin-bottom: 40px;
        }
        .landing-features { padding: 60px 24px; }
        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          max-width: 960px;
          margin: 0 auto;
        }
        .landing-feature-card {
          padding: 28px;
        }
        .landing-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-btn);
          background: rgba(34, 197, 94, 0.15);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .landing-feature-card h3 { margin-bottom: 8px; font-size: 1.1rem; }
        .landing-feature-card p { color: var(--text-secondary); font-size: 14px; }
        .landing-pricing { padding: 60px 24px; }
        .landing-pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .landing-pricing-card {
          padding: 28px;
          text-align: center;
        }
        .landing-pricing-card h3 { margin-bottom: 12px; }
        .landing-pricing-price { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
        .landing-pricing-price span { font-size: 1rem; color: var(--text-secondary); font-weight: 500; }
        .landing-pricing-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; }
        .landing-pricing-featured { border-color: var(--primary); }
        .landing-footer {
          padding: 40px 24px;
          text-align: center;
          border-top: 1px solid var(--card-border);
        }
        .landing-footer-logo { font-weight: 700; margin-bottom: 8px; }
        .landing-footer-copy { color: var(--text-secondary); font-size: 14px; }
      `}</style>
    </div>
  );
}
