import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No verification token found in the URL.');
            return;
        }

        api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
            .then((res) => {
                setStatus('success');
                setMessage(res.data?.message || 'Email verified successfully!');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(
                    err.response?.data?.error ||
                    'The verification link is invalid or has expired.'
                );
            });
    }, [searchParams]);

    return (
        <div className="verify-page">
            <div className="verify-card card">
                <div className="verify-logo">FORTRESS</div>

                {status === 'loading' && (
                    <>
                        <div className="verify-spinner" />
                        <h1 className="verify-title">Verifying your email...</h1>
                        <p className="verify-desc">Please wait a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="verify-icon verify-icon-success">✓</div>
                        <h1 className="verify-title">Email Verified!</h1>
                        <p className="verify-desc">{message}</p>
                        <Link to="/dashboard" className="btn btn-primary verify-btn">
                            Go to Dashboard
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="verify-icon verify-icon-error">✕</div>
                        <h1 className="verify-title">Verification Failed</h1>
                        <p className="verify-desc">{message}</p>
                        <div className="verify-actions">
                            <Link to="/login" className="btn btn-primary">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-outline">
                                Register
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        .verify-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .verify-card {
          width: 100%;
          max-width: 400px;
          padding: 48px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .verify-logo {
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .verify-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid var(--card-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 8px 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .verify-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 8px 0;
        }
        .verify-icon-success {
          background: rgba(34, 197, 94, 0.2);
          color: var(--primary);
        }
        .verify-icon-error {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .verify-title {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .verify-desc {
          color: var(--text-secondary);
          font-size: 14px;
          max-width: 300px;
        }
        .verify-btn { width: 100%; }
        .verify-actions { display: flex; gap: 12px; width: 100%; }
        .verify-actions .btn { flex: 1; }
      `}</style>
        </div>
    );
}
