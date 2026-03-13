import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts';
import { getKernelState, getGoals } from '../api/coreApi';
import api from '../api/axiosClient';
import { formatBRL } from '../utils/format';
import './Intelligence.css';

const PERSONA_INFO = {
  OPTIMIZER: {
    label: 'Optimizer',
    color: '#22c55e',
    desc: 'You focus on efficiency and maximizing value. Your spending decisions are calculated and intentional.',
    icon: '⚡',
  },
  GUARDIAN: {
    label: 'Guardian',
    color: '#3b82f6',
    desc: 'You are financially protective and risk-averse. You prioritize security and steady saving over high returns.',
    icon: '🛡️',
  },
  EXPLORER: {
    label: 'Explorer',
    color: '#f59e0b',
    desc: 'You enjoy variety and new experiences. You may splurge on meaningful moments while keeping an eye on balance.',
    icon: '🧭',
  },
  BUILDER: {
    label: 'Builder',
    color: '#8b5cf6',
    desc: 'You invest intentionally in long-term goals. You see every purchase through the lens of future impact.',
    icon: '🏗️',
  },
};

function getPersonaFromWeights(weights) {
  if (!weights) return 'GUARDIAN';
  const { w1 = 0, w2 = 0, w3 = 0, w4 = 0 } = weights;
  const max = Math.max(w1, w2, w3, w4);
  if (max === w1) return 'OPTIMIZER';
  if (max === w2) return 'GUARDIAN';
  if (max === w3) return 'EXPLORER';
  return 'BUILDER';
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="intel-toast">
      <span>✓</span> {message}
    </div>
  );
}

function MetricBar({ label, value, max = 1, color = '#22c55e' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="intel-metric">
      <div className="intel-metric-header">
        <span className="intel-metric-label">{label}</span>
        <span className="intel-metric-pct">{pct}%</span>
      </div>
      <div className="intel-metric-bar">
        <div
          className="intel-metric-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function Intelligence() {
  const [kernelData, setKernelData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kd, gl] = await Promise.all([getKernelState(), getGoals()]);
      setKernelData(kd);
      setGoals(Array.isArray(gl) ? gl : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sendFeedback = async (action) => {
    setFeedbackLoading(true);
    try {
      const persona = getPersonaFromWeights(kernelData?.weights);
      const family = persona === 'OPTIMIZER' ? 'A' :
        persona === 'GUARDIAN' ? 'B' :
          persona === 'EXPLORER' ? 'C' : 'D';
      await api.post('/kernel/feedback', { action, family });
      setToast(action === 'opened' ? 'Feedback noted — weights updated!' : 'Got it! We\'ll adjust your insights.');
      await loadData(); // refresh weights
    } catch {
      setToast('Could not send feedback right now.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="intel-loading">
        <div className="intel-spinner" />
        <p>Loading your AI Intelligence...</p>
      </div>
    );
  }

  const weights = kernelData?.weights || { w1: 0.5, w2: 0.2, w3: 0.1, w4: 0.15, w5: 0.05, w6: 0.1 };
  const persona = getPersonaFromWeights(weights);
  const personaInfo = PERSONA_INFO[persona] || PERSONA_INFO.GUARDIAN;

  const weightData = [
    { label: 'Risk (A)', value: weights.w1 || 0 },
    { label: 'Budget (B)', value: weights.w2 || 0 },
    { label: 'Impulse (C)', value: weights.w3 || 0 },
    { label: 'Forecast (D)', value: weights.w4 || 0 },
    { label: 'Confidence', value: weights.w5 || 0 },
    { label: 'Behavior', value: weights.w6 || 0 },
  ];

  return (
    <div className="intel-page">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <header className="intel-header">
        <h1>AI Intelligence</h1>
        <p className="intel-header-sub">Your personalized financial behavioral profile</p>
      </header>

      {error && (
        <div className="intel-error-banner card">
          <span>⚠️ {error}</span>
          <button onClick={loadData} className="btn btn-outline intel-retry">Retry</button>
        </div>
      )}

      <div className="intel-grid">
        {/* --- Persona Card --- */}
        <div className="card intel-persona-card">
          <div className="intel-persona-header">
            <div
              className="intel-persona-icon"
              style={{ background: `${personaInfo.color}20`, color: personaInfo.color }}
            >
              {personaInfo.icon}
            </div>
            <div>
              <div className="intel-persona-label">Your Financial Persona</div>
              <div className="intel-persona-name" style={{ color: personaInfo.color }}>
                {personaInfo.label}
              </div>
            </div>
          </div>
          <p className="intel-persona-desc">{personaInfo.desc}</p>

          <div className="intel-metrics">
            <MetricBar label="Risk Sensitivity" value={weights.w1} max={2} color={personaInfo.color} />
            <MetricBar label="Budget Discipline" value={weights.w2} max={2} color={personaInfo.color} />
            <MetricBar label="Impulse Control" value={1 - Math.min(weights.w3, 1)} max={1} color={personaInfo.color} />
            <MetricBar label="Forecast Engagement" value={weights.w4} max={2} color={personaInfo.color} />
          </div>
        </div>

        {/* --- Weight Chart --- */}
        <div className="card intel-weights-card">
          <h2>Behavioral Weights</h2>
          <p className="intel-section-sub">How the AI weighs each insight family for you</p>
          <div className="intel-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weightData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                <XAxis type="number" domain={[0, 2]} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#6b7280"
                  fontSize={12}
                  width={90}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(v) => [v.toFixed(3), 'Weight']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {weightData.map((_, i) => (
                    <Cell key={i} fill={personaInfo.color} fillOpacity={0.7 + i * 0.05} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- Goal Commitments --- */}
      {goals.length > 0 && (
        <div className="intel-goals-section">
          <h2 className="intel-section-title">Goal Commitments</h2>
          <div className="intel-goals-grid">
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round(goal.progress || 0));
              const analysis = goal.analysis;
              return (
                <div key={goal.id} className="card intel-goal-card">
                  <div className="intel-goal-header">
                    <span className="intel-goal-name">{goal.name}</span>
                    <span className="intel-goal-badge">{goal.periodicity}</span>
                  </div>
                  <div className="intel-goal-progress">
                    <div className="intel-goal-bar">
                      <div className="intel-goal-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="intel-goal-pct">{pct}%</span>
                  </div>
                  <div className="intel-goal-meta">
                    <span>{formatBRL((goal.progress / 100) * goal.value)} / {formatBRL(goal.value)}</span>
                    {analysis?.status && (
                      <span className={`intel-goal-status intel-goal-status-${analysis.status.toLowerCase()}`}>
                        {analysis.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Feedback Panel --- */}
      <div className="card intel-feedback-card">
        <h2>Help Improve Your AI</h2>
        <p className="intel-section-sub">
          Your feedback adjusts how the Fortress AI prioritizes insights for your profile.
        </p>
        <div className="intel-feedback-actions">
          <button
            className="btn intel-feedback-yes"
            onClick={() => sendFeedback('opened')}
            disabled={feedbackLoading}
          >
            👍 Insights feel relevant
          </button>
          <button
            className="btn intel-feedback-no"
            onClick={() => sendFeedback('dismissed')}
            disabled={feedbackLoading}
          >
            👎 Not relevant for me
          </button>
        </div>
      </div>
    </div>
  );
}
