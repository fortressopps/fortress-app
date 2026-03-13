import React from 'react';
import { Link } from 'react-router-dom';

export default function TryDemo() {
  return (
    <div className="try-page">
      <header className="try-header">
        <Link to="/" className="try-logo">FORTRESS</Link>
        <Link to="/login" className="btn btn-outline">Sign In</Link>
      </header>
      <main className="try-main card">
        <h1>Demo Mode</h1>
        <p className="try-desc">
          Explore Fortress in demo mode. Create an account to save your data.
        </p>
        <div className="try-actions">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </main>
      <style>{`
        .try-page { min-height: 100vh; padding: 24px; }
        .try-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
        .try-logo { font-weight: 700; font-size: 18px; letter-spacing: 0.05em; color: var(--text); }
        .try-main { max-width: 480px; margin: 0 auto; padding: 48px; text-align: center; }
        .try-main h1 { margin-bottom: 16px; }
        .try-desc { color: var(--text-secondary); margin-bottom: 32px; }
        .try-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
