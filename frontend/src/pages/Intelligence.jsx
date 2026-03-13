import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { getKernelState } from '../api/coreApi';

export default function Intelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getKernelState()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="intel-loading">
        <div className="intel-spinner" />
        <p>Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="intel-page">
      <header className="intel-header">
        <h1>AI Intelligence</h1>
      </header>

      {error && (
        <div className="card intel-error">
          <p>Error loading insights: {error}</p>
        </div>
      )}

      <div className="card intel-card">
        <div className="intel-icon">
          <BarChart3 size={48} />
        </div>
        <h2>Insights & Analytics</h2>
        <p className="intel-desc">
          AI-powered financial insights, behavioral analysis, and personalized recommendations.
        </p>
        {data && (
          <pre className="intel-raw">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>

      <style>{`
        .intel-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 16px;
          color: var(--text-secondary);
        }
        .intel-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--card-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .intel-header { margin-bottom: 24px; }
        .intel-header h1 { font-size: 1.5rem; }
        .intel-error { padding: 20px; color: #ef4444; margin-bottom: 24px; }
        .intel-card {
          padding: 48px;
          max-width: 560px;
          text-align: center;
        }
        .intel-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: var(--radius-card);
          background: rgba(34, 197, 94, 0.15);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .intel-card h2 { margin-bottom: 12px; }
        .intel-desc {
          color: var(--text-secondary);
          margin-bottom: 24px;
          font-size: 14px;
        }
        .intel-raw {
          text-align: left;
          padding: 16px;
          background: #0a0a0a;
          border-radius: var(--radius-btn);
          font-size: 12px;
          overflow-x: auto;
          margin-bottom: 24px;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
