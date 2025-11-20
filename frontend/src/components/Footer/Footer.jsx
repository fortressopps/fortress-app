import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <div className="footer__logo">Fortress</div>
            <p className="footer__description">
              Controle financeiro com autoridade. Tome decisões sólidas e alcance sua liberdade financeira.
            </p>
          </div>
          
          <div className="footer__links">
            <div className="footer__column">
              <h4>Produto</h4>
              <a href="#features">Recursos</a>
              <a href="#pricing">Planos</a>
              <a href="/simulator">Simulador</a>
            </div>
            
            <div className="footer__column">
              <h4>Suporte</h4>
              <a href="#help">Central de Ajuda</a>
              <a href="#contact">Contato</a>
              <a href="#privacy">Privacidade</a>
            </div>
            
            <div className="footer__column">
              <h4>Empresa</h4>
              <a href="#about">Sobre nós</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Carreiras</a>
            </div>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p>&copy; 2024 Fortress. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
