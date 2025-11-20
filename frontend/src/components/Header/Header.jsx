import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="container">
        <div className="header__content">
          {/* Logo Sóbrio */}
          <div className="header__logo">
            <div className="logo__mark">🏰</div>
            <span className="logo__text">Fortress</span>
          </div>

          {/* Navegação Minimalista */}
          <nav className="header__nav">
            <button 
              className="nav__link" 
              onClick={() => scrollToSection('hero')}
            >
              Início
            </button>
            <button 
              className="nav__link" 
              onClick={() => scrollToSection('benefits')}
            >
              Vantagens
            </button>
            <button 
              className="nav__link" 
              onClick={() => scrollToSection('pricing')}
            >
              Planos
            </button>
          </nav>

          {/* CTA Discreto */}
          <div className="header__actions">
            <button 
              className="btn btn--primary"
              onClick={() => scrollToSection('pricing')}
            >
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
