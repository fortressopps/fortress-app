import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/register', form);
      if (res.data.ok) {
        setSuccess(res.data.message || 'Check your email to activate your account.');
      } else {
        setError(res.data.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">FORTRESS</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start building your financial fortress</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-oauth">
          <a
            href={`${API_BASE}/auth/google`}
            className="btn btn-outline auth-oauth-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Google
          </a>
          <a
            href={`${API_BASE}/auth/microsoft`}
            className="btn btn-outline auth-oauth-btn"
          >
            <svg width="18" height="18" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Microsoft
          </a>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
        }
        .auth-logo {
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.05em;
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-title { font-size: 1.5rem; margin-bottom: 4px; text-align: center; }
        .auth-subtitle { color: var(--text-secondary); font-size: 14px; text-align: center; margin-bottom: 28px; }
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .auth-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .auth-field input {
          width: 100%;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-btn);
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
        }
        .auth-field input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .auth-submit { width: 100%; padding: 12px; }
        .auth-divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          color: var(--text-secondary);
          font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--card-border);
        }
        .auth-divider span { padding: 0 12px; }
        .auth-oauth { display: flex; gap: 12px; }
        .auth-oauth-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--text-secondary); }
        .auth-switch a { color: var(--primary); }
        .auth-error {
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-btn);
          color: #ef4444;
          font-size: 14px;
          max-width: 400px;
        }
        .auth-success {
          margin-top: 16px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: var(--radius-btn);
          color: var(--primary);
          font-size: 14px;
          max-width: 400px;
        }
      `}</style>
    </div>
  );
}
