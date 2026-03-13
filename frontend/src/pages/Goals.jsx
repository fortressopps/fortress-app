import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { getGoalsWithProgress, createGoal, deleteGoal } from '../api/coreApi';
import './Goals.css';

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
    getGoalsWithProgress()
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
                autoFocus
              />
            </div>
            <div className="goals-field">
              <label>Target Value (BRL)</label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="0.00"
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
                <option value="ONCE">One-time</option>
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
        {goals.length === 0 ? (
          <div className="card goals-empty">
            <Target size={48} className="goals-empty-icon" />
            <h3>No goals set</h3>
            <p>Define your financial targets and let AI help you reach them.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Set Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const pct = Math.min(100, Math.round(goal.progress || 0));
            return (
              <div key={goal.id} className="card goals-card">
                <div className="goals-card-header">
                  <h3>{goal.name} {goal.autoCalculated && <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>AUTO</span>}</h3>
                  <span className="goals-badge">{goal.periodicity}</span>
                </div>
                <div className="goals-progress">
                  <div className="goals-progress-bar">
                    <div
                      className="goals-progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="goals-amounts">
                  <span>{formatBRL((goal.progress / 100) * goal.value)}</span>
                  <span className="goals-sep">/</span>
                  <span>{formatBRL(goal.value)}</span>
                </div>
                <div className="goals-meta">
                  <span>Created {formatDate(goal.createdAt)}</span>
                  <button
                    className="goals-delete"
                    onClick={() => handleDelete(goal.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
