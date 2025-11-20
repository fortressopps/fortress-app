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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/try" element={<TryFortress />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
