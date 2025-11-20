import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  const startSimulator = () => {
    navigate('/simulator');
  };

  return (
    <section className="hero" id="hero">
      <div className="hero__background">
        <div className="hero__gradient"></div>
      </div>
      
      <div className="container">
        <div className="hero__content">
          <h1 className="hero__title">
            Controle Financeiro 
            <span className="hero__title--emerald"> com Autoridade</span>
          </h1>

          <p className="hero__description">
            Do controle básico no <strong>Sentinel</strong> à gestão completa no <strong>Legacy</strong>. 
            Solidez em cada decisão financeira.
          </p>

          <div className="hero__metrics">
            <div className="metric">
              <div className="metric__value">+95%</div>
              <div className="metric__label">Eficiência</div>
            </div>
            <div className="metric">
              <div className="metric__value">100%</div>
              <div className="metric__label">Controle</div>
            </div>
            <div className="metric">
              <div className="metric__value">∞</div>
              <div className="metric__label">Escalável</div>
            </div>
          </div>

          <div className="hero__actions">
            <button 
              className="btn btn--primary btn--large"
              onClick={startSimulator}
            >
              Experimentar o Simulador Grátis
            </button>
          </div>

          <div className="hero__guarantees">
            <div className="guarantee">
              <span className="guarantee__icon">🔒</span>
              <span>Teste grátis - Sem cadastro</span>
            </div>
            <div className="guarantee">
              <span className="guarantee__icon">⚡</span>
              <span>Resultados em 2 minutos</span>
            </div>
            <div className="guarantee">
              <span className="guarantee__icon">💳</span>
              <span>Sem cartão necessário</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
