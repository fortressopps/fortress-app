import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <div className="footer__logo">🏰 Fortress</div>
            <p className="footer__tagline">
              Controle Financeiro com Autoridade
            </p>
          </div>
          <div className="footer__copyright">
            © {currentYear} Fortress. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
