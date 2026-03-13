import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient';
import './VerifyEmail.css';

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
              Acessar Fortress
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
    </div>
  );
}
