import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HeroSection from './components/HeroSection/HeroSection';
import Benefits from './components/Benefits/Benefits';
import Pricing from './components/Pricing/Pricing';
import Footer from './components/Footer/Footer';
import TryFortress from './components/TryFortress/TryFortress';
import './App.css';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <Benefits />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Receipts from './pages/Receipts';
import OAuthCallback from './pages/OAuthCallback';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App bg-gray-900 min-h-screen text-white">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/try" element={<TryFortress />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
