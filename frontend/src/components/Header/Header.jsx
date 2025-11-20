import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="fortress-header">
      <div className="fortress-brand">
        <div className="fortress-logo">
          <div className="logo-tower"></div>
          <span className="logo-text">FORTRESS</span>
        </div>
        
        <nav className="fortress-nav">
          <a href="#torre" className="nav-link">Torre de Controle</a>
          <a href="#estrategias" className="nav-link">Estratégias</a>
          <a href="#mapa" className="nav-link">Mapa Patrimonial</a>
          <a href="#manifesto" className="nav-link">Manifesto</a>
        </nav>
        
        <div className="fortress-actions">
          <button className="btn-sentinel">🛡️ Acessar Sentinel</button>
        </div>
      </div>
    </header>
  );
};

export default Header;