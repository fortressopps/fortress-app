import React, { useMemo, useCallback, useState, useEffect } from 'react';
import './Benefits.css';

// Componente de Card Otimizado
const BenefitCard = React.memo(({ benefit, index, onHover }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 150);
    
    return () => clearTimeout(timer);
  }, [index]);

  const handleMouseEnter = useCallback(() => {
    onHover?.(benefit.type);
  }, [onHover, benefit.type]);

  const handleClick = useCallback(() => {
    console.log(`🎯 Benefit selecionado: ${benefit.type}`);
  }, [benefit.type]);

  return (
    <div 
      className={`benefit-card ${benefit.type} ${isVisible ? 'card-visible' : ''}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <div className="benefit-glow-effect"></div>
      <div className="benefit-content">
        <div className="benefit-icon-wrapper">
          <div className="benefit-icon">{benefit.icon}</div>
          <div className="icon-aura"></div>
        </div>
        
        <h3 className="benefit-title">{benefit.title}</h3>
        <p className="benefit-description">{benefit.description}</p>
        
        <ul className="benefit-features">
          {benefit.features.map((feature, idx) => (
            <FeatureItem key={idx} feature={feature} index={idx} />
          ))}
        </ul>
        
        <div className="benefit-hover-overlay"></div>
      </div>
    </div>
  );
});

// Componente de Feature Otimizado
const FeatureItem = React.memo(({ feature, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300 + (index * 50));
    
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <li className={`feature-item ${isVisible ? 'feature-visible' : ''}`}>
      <span className="feature-check">✓</span>
      <span className="feature-text">{feature}</span>
    </li>
  );
});

// Componente Principal
const Benefits = () => {
  const [activeBenefit, setActiveBenefit] = useState(null);

  // Dados otimizados com useMemo
  const benefitsData = useMemo(() => [
    {
      icon: '🛡️',
      title: 'SENTINEL - Estrategistas Iniciantes',
      description: 'Fundamentos sólidos para construir sua base financeira com segurança e controle absoluto',
      features: [
        'Controle absoluto de gastos e receitas',
        'Metas financeiras claras e alcançáveis',
        'Relatórios mensais detalhados e intuitivos',
        'Alertas inteligentes de orçamento',
        'Suporte prioritário especializado',
        'Educação financeira passo a passo'
      ],
      type: 'sentinel'
    },
    {
      icon: '⚔️',
      title: 'VANGUARD - Construtores',
      description: 'Otimização avançada para crescimento acelerado e construção de patrimônio',
      features: [
        'Análise profunda de investimentos',
        'Projeções futuras com IA precisa',
        'Estratégias personalizadas por perfil',
        'Integração com múltiplas plataformas',
        'Consultoria especializada mensal',
        'Otimização de custos automatizada'
      ],
      type: 'vanguard'
    },
    {
      icon: '👑',
      title: 'LEGACY - Arquitetos',
      description: 'Legado financeiro para gerações futuras com gestão patrimonial completa',
      features: [
        'Gestão patrimonial integrada',
        'Planejamento sucessório avançado',
        'Otimização fiscal estratégica',
        'Relatórios executivos corporativos',
        'Concierge financeiro 24/7',
        'Acesso a investimentos exclusivos'
      ],
      type: 'legacy'
    }
  ], []);

  const handleBenefitHover = useCallback((benefitType) => {
    setActiveBenefit(benefitType);
    console.log(`💎 Benefit em foco: ${benefitType}`);
  }, []);

  // Renderização otimizada dos cards
  const benefitCards = useMemo(() => 
    benefitsData.map((benefit, index) => (
      <BenefitCard
        key={benefit.type}
        benefit={benefit}
        index={index}
        onHover={handleBenefitHover}
      />
    )), [benefitsData, handleBenefitHover]
  );

  return (
    <section className="benefits-container" id="benefits">
      <div className="benefits-background-effects">
        <div className="benefits-particles"></div>
      </div>
      
      <div className="benefits-content">
        <div className="benefits-header">
          <h2 className="benefits-title">
            Construa Sua <span className="title-accent">Fortaleza Financeira</span>
          </h2>
          <p className="benefits-subtitle">
            Do controle básico à gestão patrimonial avançada, oferecemos soluções completas
            para cada etapa da sua jornada rumo à independência financeira
          </p>
        </div>

        <div className="benefits-grid">
          {benefitCards}
        </div>

        {activeBenefit && (
          <div className="active-benefit-indicator">
            <span>Foco em: {activeBenefit.toUpperCase()}</span>
          </div>
        )}
      </div>
    </section>
  );
};

// Display names para debugging
BenefitCard.displayName = 'BenefitCard';
FeatureItem.displayName = 'FeatureItem';
Benefits.displayName = 'Benefits';

export default Benefits;