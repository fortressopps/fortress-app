import React from 'react';
import './Benefits.css';

const Benefits = () => {
  const benefitsData = [
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
  ];

  return (
    <section className="benefits-container" id="benefits">
      <div className="benefits-content">
        <h2 className="benefits-title">
          Construa Sua Fortaleza Financeira
        </h2>
        <p className="benefits-subtitle">
          Do controle básico à gestão patrimonial avançada, oferecemos soluções completas 
          para cada etapa da sua jornada rumo à independência financeira
        </p>
        
        <div className="benefits-grid">
          {benefitsData.map((benefit, index) => (
            <div key={index} className={`benefit-card ${benefit.type}`}>
              <div className="benefit-icon">
                {benefit.icon}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <ul className="benefit-features">
                {benefit.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;