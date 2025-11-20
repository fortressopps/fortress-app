import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="fortress-footer">
      <div className="footer-container">
        
        {/* 🏰 SEÇÃO DA MARCA FORTRESS */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon"></div>
            <span className="footer-logo-text">FORTRESS</span>
          </div>
          
          <p className="footer-tagline">
            Sua fortaleza financeira pessoal e empresarial. 
            Controle absoluto, crescimento inteligente.
          </p>
          
          <blockquote className="footer-manifesto">
            "Do primeiro controle ao legado eterno - sua evolução financeira em uma única fortaleza"
          </blockquote>
        </div>

        {/* 🧭 LINKS RÁPIDOS */}
        <div className="footer-section">
          <h4>Navegação</h4>
          <div className="footer-links">
            <a href="#torre" className="footer-link">Torre de Controle</a>
            <a href="#mapa" className="footer-link">Mapa Patrimonial</a>
            <a href="#estrategias" className="footer-link">Estratégias</a>
            <a href="#manifesto" className="footer-link">Manifesto</a>
            <a href="#suporte" className="footer-link">Suporte</a>
          </div>
        </div>

        {/* 🛡️ SISTEMA DE PLANOS */}
        <div className="footer-section">
          <h4>Planos</h4>
          <div className="footer-links plan-links">
            <a href="#sentinel" className="footer-link">
              🛡️ Sentinel
            </a>
            <a href="#vanguard" className="footer-link">
              ⚔️ Vanguard
            </a>
            <a href="#legacy" className="footer-link">
              👑 Legacy
            </a>
            <a href="#comparar" className="footer-link">
              📊 Comparar Planos
            </a>
          </div>
        </div>

        {/* 📧 NEWSLETTER */}
        <div className="footer-section">
          <h4>Fique Atualizado</h4>
          <div className="newsletter">
            <p>
              Receba estratégias financeiras e atualizações da Fortress
            </p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                Assinar
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* © RODAPÉ INFERIOR */}
      <div className="footer-bottom">
        <div className="footer-copyright">
          © 2024 Fortress Beta 1.5. Todos os direitos reservados.
        </div>
        
        <div className="footer-legal">
          <a href="#privacidade" className="footer-legal-link">
            Política de Privacidade
          </a>
          <a href="#termos" className="footer-legal-link">
            Termos de Serviço
          </a>
          <a href="#cookies" className="footer-legal-link">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;