import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <a href="/" className="header__logo">
            Fortress
          </a>
          
          <nav className="header__nav">
            <a href="#features" className="header__nav-link">Recursos</a>
            <a href="#pricing" className="header__nav-link">Planos</a>
            <a href="#simulator" className="header__nav-link">Simulador</a>
          </nav>
          
          <div className="header__actions">
            <button className="btn btn--secondary">Entrar</button>
            <button className="btn btn--primary">Criar Conta</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
