import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './HeroSection.css';

// Componente de Partícula Otimizado
const Particle = React.memo(({ id }) => {
  const size = useMemo(() => 2 + Math.random() * 3, []);
  const duration = useMemo(() => 22 + Math.random() * 10, []);
  const delay = useMemo(() => Math.random() * 25, []);
  const opacity = useMemo(() => 0.4 + Math.random() * 0.5, []);
  const left = useMemo(() => Math.random() * 100, []);

  return (
    <div
      className="particle"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity: opacity
      }}
    />
  );
});

// Componente de Card de Plano Otimizado
const PlanCard = React.memo(({ 
  plan, 
  icon, 
  title, 
  description, 
  audience, 
  onHover, 
  onClick 
}) => {
  const handleMouseEnter = useCallback(() => {
    onHover?.(title);
  }, [onHover, title]);

  const handleClick = useCallback(() => {
    onClick?.(title);
  }, [onClick, title]);

  return (
    <div 
      className={`plan-card ${plan}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <div className="plan-icon-wrapper">
        <div className="plan-icon">{icon}</div>
        <div className="icon-glow"></div>
      </div>
      <h4 className="plan-title">{title}</h4>
      <p className="plan-description">{description}</p>
      <small className="plan-audience">{audience}</small>
      <div className="plan-hover-effect"></div>
    </div>
  );
});

// Componente de Botão Otimizado
const ActionButton = React.memo(({ 
  type, 
  icon, 
  text, 
  onClick, 
  onMouseEnter 
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter?.();
  }, [onMouseEnter]);

  return (
    <button 
      className={`btn btn-${type}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <span className="btn-icon">{icon}</span>
      <span className="btn-text">{text}</span>
      {type === 'primary' && <span className="btn-glow"></span>}
      {type === 'secondary' && <span className="btn-sparkle"></span>}
    </button>
  );
});

// Componente Principal
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [particleCount, setParticleCount] = useState(18);

  // Efeito de entrada suave - Otimizado
  useEffect(() => {
    setIsVisible(true);
    
    const handleResize = () => {
      setParticleCount(window.innerWidth < 768 ? 12 : 18);
    };
    
    handleResize();
    
    // Throttle no resize para performance
    let resizeTimeout;
    const throttledResize = () => {
      if (!resizeTimeout) {
        resizeTimeout = setTimeout(() => {
          handleResize();
          resizeTimeout = null;
        }, 100);
      }
    };
    
    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // Sistema de partículas otimizado com useMemo
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, index) => (
      <Particle key={`particle-${index}`} id={index} />
    ));
  }, [particleCount]);

  // Handlers otimizados com useCallback
  const handlePrimaryClick = useCallback(() => {
    console.log('🚀 Iniciando jornada Sentinel...');
    // Lógica de navegação futura
  }, []);

  const handleSecondaryClick = useCallback(() => {
    console.log('🎯 Explorando estratégias...');
    // Lógica de navegação futura
  }, []);

  const handlePlanHover = useCallback((planName) => {
    console.log(`💎 Foco no plano: ${planName}`);
  }, []);

  const handlePlanClick = useCallback((planName) => {
    console.log(`🎯 Selecionado: ${planName}`);
  }, []);

  const handleBadgeHover = useCallback(() => {
    console.log('🌟 Beta ativo!');
  }, []);

  const handleStrategiesHover = useCallback(() => {
    console.log('📊 Estratégias em foco');
  }, []);

  // Dados dos planos - Centralizado para fácil manutenção
  const plansData = useMemo(() => [
    {
      plan: 'sentinel',
      icon: '🛡️',
      title: 'SENTINEL',
      description: 'Seus alicerces financeiros solidificados',
      audience: 'Para estrategistas iniciantes'
    },
    {
      plan: 'vanguard',
      icon: '⚔️',
      title: 'VANGUARD',
      description: 'Multiplicação estratégica do patrimônio',
      audience: 'Para construtores em expansão'
    },
    {
      plan: 'legacy',
      icon: '👑',
      title: 'LEGACY',
      description: 'Legado financeiro garantido',
      audience: 'Para arquitetos de legado'
    }
  ], []);

  // Dados dos botões - Centralizado para fácil manutenção
  const buttonsData = useMemo(() => [
    {
      type: 'primary',
      icon: '🛡️',
      text: 'Iniciar Jornada Sentinel',
      onClick: handlePrimaryClick,
      onMouseEnter: () => handlePlanHover('Sentinel')
    },
    {
      type: 'secondary',
      icon: '⚔️',
      text: 'Explorar Estratégias',
      onClick: handleSecondaryClick,
      onMouseEnter: handleStrategiesHover
    }
  ], [handlePrimaryClick, handleSecondaryClick, handlePlanHover]);

  return (
    <section className={`fortress-hero ${isVisible ? 'hero-visible' : ''}`}>
      {/* 🎭 Sistema de Partículas Otimizado */}
      <div className="hero-particles">
        {particles}
      </div>
      
      <div className="hero-content">
        {/* 🎯 Badge Beta */}
        <div 
          className="hero-badge"
          onMouseEnter={handleBadgeHover}
        >
          <span className="badge-text">FORTRESS BETA 1.8</span>
          <span className="badge-glow"></span>
        </div>

        {/* 🏆 Título Principal */}
        <h1 className="hero-title">
          <span className="title-line">SUA </span>
          <span className="text-evolution title-line">FORTRALEZA FINANCEIRA</span>
          <span className="title-line">PESSOAL E EMPRESARIAL</span>
        </h1>

        {/* 📝 Subtítulo */}
        <div className="subtitle-container">
          <p className="hero-subtitle">
            Do primeiro controle ao legado eterno - sua evolução financeira em uma única fortaleza
          </p>
          <div className="subtitle-ornament left"></div>
          <div className="subtitle-ornament right"></div>
        </div>

        {/* 🎮 Botões de Ação */}
        <div className="hero-actions">
          {buttonsData.map((button, index) => (
            <ActionButton
              key={`button-${index}`}
              type={button.type}
              icon={button.icon}
              text={button.text}
              onClick={button.onClick}
              onMouseEnter={button.onMouseEnter}
            />
          ))}
        </div>

        {/* 🛡️ Sistema de Planos */}
        <div className="plans-preview">
          {plansData.map((plan, index) => (
            <PlanCard
              key={`plan-${index}`}
              plan={plan.plan}
              icon={plan.icon}
              title={plan.title}
              description={plan.description}
              audience={plan.audience}
              onHover={handlePlanHover}
              onClick={handlePlanClick}
            />
          ))}
        </div>

        {/* ✨ Estatísticas */}
        <div className="hero-cta">
          <p className="cta-text">
            <strong>18.542+ fortalezas construídas</strong> • 
            <span className="highlight"> 96% de satisfação</span> • 
            <strong> R$ 32MH+ economizados</strong>
          </p>
        </div>
      </div>

      {/* 🎨 Overlay Adicional */}
      <div className="hero-overlay"></div>
    </section>
  );
};

// Display name para melhor debugging
Particle.displayName = 'Particle';
PlanCard.displayName = 'PlanCard';
ActionButton.displayName = 'ActionButton';
HeroSection.displayName = 'HeroSection';

export default HeroSection;