import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, resendVerification, deleteAccount } from '../api/coreApi';
import { formatDate } from '../utils/format';
import './Settings.css';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password Form
  const [passForm, setPassForm] = useState({ old: '', new: '' });

  const clearMessages = () => { setError(null); setSuccess(null); };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await updateProfile({ name, email });
      setSuccess('Profile updated successfully.');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await changePassword(passForm.old, passForm.new);
      setSuccess('Password changed successfully.');
      setPassForm({ old: '', new: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerify = async () => {
    clearMessages();
    try {
      await resendVerification();
      setSuccess('Verification email sent.');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('CRITICAL: All your data will be permanently deleted. Continue?')) return;
    try {
      await deleteAccount();
      logout();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Account Settings</h1>
      </header>

      {error && <div className="settings-error">{error}</div>}
      {success && <div className="settings-success">{success}</div>}

      <div className="settings-grid">
        <div className="settings-main">
          {/* --- Profile Card --- */}
          <div className="card settings-card">
            <h2>Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="settings-form">
              <div className="settings-field">
                <label>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="settings-field">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Save Changes
              </button>
            </form>
          </div>

          {/* --- Password Card --- */}
          <div className="card settings-card">
            <h2>Security</h2>
            <form onSubmit={handleChangePassword} className="settings-form">
              <div className="settings-field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passForm.old}
                  onChange={(e) => setPassForm({ ...passForm, old: e.target.value })}
                  required
                />
              </div>
              <div className="settings-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={passForm.new}
                  onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline" disabled={loading}>
                Change Password
              </button>
            </form>
          </div>
        </div>

        <div className="settings-side">
          {/* --- Status Card --- */}
          <div className="card settings-card">
            <h2>Account Status</h2>
            <div className="settings-status-item">
              <span>Member Since</span>
              <strong>{formatDate(user?.createdAt)}</strong>
            </div>
            <div className="settings-status-item">
              <span>Email Verified</span>
              <strong className={user?.verified ? 'text-primary' : 'text-warning'}>
                {user?.verified ? 'YES' : 'PENDING'}
              </strong>
            </div>
            {!user?.verified && (
              <button onClick={handleResendVerify} className="btn btn-link">
                Resend verification email
              </button>
            )}
          </div>

          {/* --- Danger Zone --- */}
          <div className="card settings-card danger-zone">
            <h2>Danger Zone</h2>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
