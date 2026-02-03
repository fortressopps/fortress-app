import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="fortress-header light-border">
      <div className="header-container container mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="brand-link">
          <div className="fortress-logo-group">
            <div className="brand-circle-small"></div>
            <span className="brand-text-header text-charcoal">FORTRESS</span>
          </div>
        </Link>

        <div className="header-actions flex items-center gap-8">
          <div className="header-icon-group flex items-center gap-6 text-mute text-lg">
            <span className="cursor-pointer hover:text-charcoal transition-all">🔔</span>
            <span className="cursor-pointer hover:text-charcoal transition-all">👤</span>
            <span className="cursor-pointer hover:text-charcoal transition-all">🔍</span>
          </div>

          <Link to="/login" className="desktop-only">
            <button className="px-6 py-2 rounded-lg border border-border-light text-charcoal font-semibold text-xs hover:bg-surface transition-all">
              Aceder
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;