import React from 'react';
import './Pricing.css';

const Pricing = () => {
  const plans = [
    {
      name: 'Sentinel',
      price: 'Grátis',
      description: 'Controle básico para começar',
      features: [
        'Até 50 transações/mês',
        'Insights básicos',
        'Suporte por email',
        '1 meta financeira',
        'App web apenas'
      ],
      cta: 'Começar Gratuitamente',
      popular: false
    },
    {
      name: 'Guardian',
      price: 'R$ 29',
      period: '/mês',
      description: 'Para controle total',
      features: [
        'Transações ilimitadas',
        'Insights avançados',
        'Suporte prioritário',
        'Metas ilimitadas',
        'App mobile + web',
        'Relatórios detalhados',
        'Modo Supermercado'
      ],
      cta: 'Testar 7 Dias Grátis',
      popular: true
    },
    {
      name: 'Legacy',
      price: 'R$ 59',
      period: '/mês',
      description: 'Gestão completa',
      features: [
        'Tudo do Guardian',
        'Consultoria personalizada',
        'Exportação de dados',
        'API access',
        'Usuários ilimitados',
        'Treinamentos exclusivos',
        'Priority 24/7'
      ],
      cta: 'Falar com Especialista',
      popular: false
    }
  ];

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="pricing__content">
          <h2 className="pricing__title">
            Planos que se adaptam à sua <span className="text-emerald">jornada</span>
          </h2>
          <p className="pricing__description">
            Comece grátis e evolua conforme suas necessidades crescem
          </p>

          <div className="pricing__grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing__card ${plan.popular ? 'pricing__card--popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Mais Popular</div>}
                
                <div className="pricing__header">
                  <h3 className="pricing__name">{plan.name}</h3>
                  <div className="pricing__price">
                    {plan.price}
                    {plan.period && <span className="pricing__period">{plan.period}</span>}
                  </div>
                  <p className="pricing__description-card">{plan.description}</p>
                </div>

                <ul className="pricing__features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="pricing__feature">
                      ✅ {feature}
                    </li>
                  ))}
                </ul>

                <button className={`btn ${plan.popular ? 'btn--primary' : 'btn--secondary'} pricing__cta`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
