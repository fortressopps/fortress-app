import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { getGoals, createGoal, deleteGoal } from '../api/coreApi';

function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', value: '', periodicity: 'MONTHLY' });
  const [submitting, setSubmitting] = useState(false);

  const loadGoals = () => {
    getGoals()
      .then((data) => setGoals(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadGoals, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createGoal({
        name: form.name,
        value: Number(form.value),
        periodicity: form.periodicity,
      });
      setForm({ name: '', value: '', periodicity: 'MONTHLY' });
      setShowForm(false);
      loadGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await deleteGoal(id);
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="goals-loading">
        <div className="goals-spinner" />
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="goals-page">
      <header className="goals-header">
        <h1>Goals</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          New Goal
        </button>
      </header>

      {error && <div className="goals-error">{error}</div>}

      {showForm && (
        <div className="card goals-form-card">
          <h2>New Goal</h2>
          <form onSubmit={handleCreate} className="goals-form">
            <div className="goals-field">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Monthly Groceries"
                required
              />
            </div>
            <div className="goals-field">
              <label>Target Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div className="goals-field">
              <label>Periodicity</label>
              <select
                value={form.periodicity}
                onChange={(e) => setForm({ ...form, periodicity: e.target.value })}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <div className="goals-form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Goal'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="goals-grid">
        {goals.length === 0 && !showForm ? (
          <div className="card goals-empty">
            <Target size={48} className="goals-empty-icon" />
            <h3>No goals yet</h3>
            <p>Create your first financial goal to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              New Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="card goals-card">
              <div className="goals-card-header">
                <h3>{goal.name}</h3>
                <span className={`goals-badge goals-badge-${(goal.periodicity || '').toLowerCase()}`}>
                  {goal.periodicity || 'MONTHLY'}
                </span>
              </div>
              <div className="goals-progress">
                <div className="goals-progress-bar">
                  <div
                    className="goals-progress-fill"
                    style={{ width: `${Math.min(goal.progress || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="goals-amounts">
                <span>{formatBRL(goal.progress ? (goal.value * (goal.progress / 100)) : 0)}</span>
                <span className="goals-sep">/</span>
                <span>{formatBRL(goal.value)}</span>
              </div>
              <div className="goals-meta">
                <span>Created {formatDate(goal.createdAt)}</span>
                <button
                  className="goals-delete"
                  onClick={() => handleDelete(goal.id)}
                  title="Delete goal"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .goals-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 16px;
          color: var(--text-secondary);
        }
        .goals-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--card-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .goals-page { }
        .goals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .goals-header h1 { font-size: 1.5rem; }
        .goals-error {
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-btn);
          color: #ef4444;
          margin-bottom: 24px;
        }
        .goals-form-card {
          padding: 24px;
          margin-bottom: 24px;
        }
        .goals-form-card h2 { margin-bottom: 20px; font-size: 1.1rem; }
        .goals-form { display: flex; flex-direction: column; gap: 16px; max-width: 400px; }
        .goals-field label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .goals-field input, .goals-field select {
          width: 100%;
          padding: 10px 14px;
          background: #1a1a1a;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-btn);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
        }
        .goals-field input:focus, .goals-field select:focus {
          outline: none;
          border-color: var(--primary);
        }
        .goals-form-actions { display: flex; gap: 12px; margin-top: 8px; }
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .goals-empty {
          grid-column: 1 / -1;
          padding: 48px;
          text-align: center;
        }
        .goals-empty-icon { color: var(--text-secondary); margin-bottom: 16px; opacity: 0.5; }
        .goals-empty h3 { margin-bottom: 8px; }
        .goals-empty p { color: var(--text-secondary); margin-bottom: 20px; }
        .goals-card {
          padding: 24px;
        }
        .goals-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .goals-card-header h3 { font-size: 1.1rem; }
        .goals-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(34, 197, 94, 0.2);
          color: var(--primary);
        }
        .goals-progress { margin-bottom: 12px; }
        .goals-progress-bar {
          height: 8px;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
        }
        .goals-progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s;
        }
        .goals-amounts { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
        .goals-sep { color: var(--text-secondary); font-weight: 400; margin: 0 4px; }
        .goals-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .goals-delete {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 12px;
        }
        .goals-delete:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
