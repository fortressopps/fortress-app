import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="fortress-hero">
      <div className="hero-content">
        {/* 🎯 BADGE BETA */}
        <div className="hero-badge">Fortress Beta 1.5</div>
        
        {/* 🏆 TÍTULO PRINCIPAL */}
        <h1 className="hero-title">
          Sua <span className="text-evolution">fortaleza financeira</span><br />
          pessoal e empresarial
        </h1>
        
        {/* 📝 SUBTÍTULO - MANIFESTO */}
        <p className="hero-subtitle">
          "Do primeiro controle ao legado eterno - sua evolução financeira em uma única fortaleza"
        </p>
        
        {/* 🎮 BOTÕES DE AÇÃO */}
        <div className="hero-actions">
          <button className="btn btn-primary">
            🛡️ Iniciar Jornada Sentinel
          </button>
          <button className="btn btn-secondary">
            ⚔️ Explorar Estratégias
          </button>
        </div>
        
        {/* 🛡️ SISTEMA DE PLANOS FORTRESS */}
        <div className="plans-preview">
          <div className="plan-card sentinel">
            <div className="plan-icon">🛡️</div>
            <h4>SENTINEL</h4>
            <p>Seus alicerces financeiros solidificados</p>
            <small>Para estrategistas iniciantes</small>
          </div>
          
          <div className="plan-card vanguard">
            <div className="plan-icon">⚔️</div>
            <h4>VANGUARD</h4>
            <p>Multiplicação estratégica do patrimônio</p>
            <small>Para construtores em expansão</small>
          </div>
          
          <div className="plan-card legacy">
            <div className="plan-icon">👑</div>
            <h4>LEGACY</h4>
            <p>Legado financeiro garantido</p>
            <small>Para arquitetos de legado</small>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;