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
import Supermarket from './pages/Supermarket';
import Intelligence from './pages/Intelligence';
import OAuthCallback from './pages/OAuthCallback';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App light-substrate">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/try" element={<TryFortress />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Protected Routes - Wrapped in MainLayout via ProtectedRoute */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/supermarket" element={<ProtectedRoute><Supermarket /></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
