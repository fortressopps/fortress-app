import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="notfound-page">
            <div className="notfound-code">404</div>
            <h1 className="notfound-title">Page not found</h1>
            <p className="notfound-desc">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="notfound-actions">
                <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                </Link>
                <Link to="/" className="btn btn-outline">
                    Home
                </Link>
            </div>
            <style>{`
        .notfound-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
          padding: 24px;
        }
        .notfound-code {
          font-size: clamp(5rem, 15vw, 10rem);
          font-weight: 700;
          line-height: 1;
          color: var(--primary);
          opacity: 0.3;
        }
        .notfound-title {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .notfound-desc {
          color: var(--text-secondary);
          font-size: 16px;
          max-width: 360px;
          margin-bottom: 8px;
        }
        .notfound-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }
      `}</style>
        </div>
    );
}
