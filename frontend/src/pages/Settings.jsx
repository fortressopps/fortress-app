import React from 'react';
import { User } from 'lucide-react';

export default function Settings() {
  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
      </header>
      <div className="card settings-card">
        <div className="settings-icon">
          <User size={32} />
        </div>
        <h2>Account Settings</h2>
        <p className="settings-desc">
          Manage your account and preferences. More options coming soon.
        </p>
      </div>
      <style>{`
        .settings-header { margin-bottom: 24px; }
        .settings-header h1 { font-size: 1.5rem; }
        .settings-card {
          padding: 48px;
          max-width: 480px;
          text-align: center;
        }
        .settings-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          border-radius: var(--radius-card);
          background: rgba(34, 197, 94, 0.15);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .settings-card h2 { margin-bottom: 12px; }
        .settings-desc { color: var(--text-secondary); font-size: 14px; }
      `}</style>
    </div>
  );
}
