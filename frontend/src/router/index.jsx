import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Goals from '../pages/Goals';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import OAuthCallback from '../pages/OAuthCallback';
import App from '../App';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/app" element={<Protected><Dashboard /></Protected>} />
          <Route path="/goals" element={<Protected><Goals /></Protected>} />
          <Route path="/try" element={<App />} />
          <Route path="/" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
