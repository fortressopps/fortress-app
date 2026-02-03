import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="fortress-footer" id="manifesto">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-text">FORTRESS</span>
            <span className="footer-version ml-2 text-[10px] font-bold text-forest-green">V8.1</span>
          </div>
          <p className="footer-tagline text-mute">Institutional-Grade Financial Custody.</p>
          <div className="footer-status">
            <span className="status-dot bg-forest-green"></span>
            <span className="status-text text-forest-green">CORE SYSTEMS NOMINAL</span>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-section">
            <h4 className="text-[10px] font-bold text-charcoal tracking-[0.2em] mb-6">SISTEMA</h4>
            <div className="footer-links">
              <a href="#hero" className="footer-link text-mute hover:text-forest-green transition-colors">Dashboard</a>
              <a href="#benefits" className="footer-link text-mute hover:text-forest-green transition-colors">Inteligência</a>
              <a href="#pricing" className="footer-link text-mute hover:text-forest-green transition-colors">Tiers</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="text-[10px] font-bold text-charcoal tracking-[0.2em] mb-6">NEWSLETTER</h4>
            <form className="newsletter-form" onSubmit={(e) => {
              e.preventDefault();
              alert('🛡️ Acesso confirmado. Verifique suas diretrizes semanais no e-mail.');
              e.target.reset();
            }}>
              <input type="email" placeholder="strategic@email.com" className="newsletter-input bg-surface border border-border-light rounded-xl px-4 py-2 outline-none focus:border-forest-green" required />
              <button type="submit" className="newsletter-button bg-charcoal text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-forest-green transition-colors">ASSINAR</button>
            </form>
          </div>
        </div>
      </div>
      <div className="footer-bottom border-t border-border-light pt-8 text-center">
        <span className="text-mute text-[10px] tracking-widest font-bold">© 2024 FORTRESS INSTITUTIONAL. ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  );
};

export default Footer;