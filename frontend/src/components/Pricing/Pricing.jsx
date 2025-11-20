import React, { useState, useEffect } from 'react';
import './Pricing.css';

const Pricing = () => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2026-04-21T23:59:59');
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      name: "Sentinel",
      description: "Controle financeiro essencial",
      price: "Grátis",
      originalPrice: null,
      features: [
        "Controle de gastos pessoais",
        "Categorização de despesas",
        "Relatórios básicos",
        "App mobile incluso",
        "Suporte por email"
      ],
      cta: "Começar Gratuitamente",
      featured: false
    },
    {
      name: "Vanguard",
      description: "Controle avançado para prosperidade",
      price: "R$ 19,90",
      originalPrice: "R$ 29,90",
      features: [
        "Tudo do Sentinel",
        "Orçamento personalizado",
        "Metas financeiras",
        "Investimentos tracking",
        "Relatórios avançados",
        "Suporte prioritário"
      ],
      cta: "Experimentar 7 Dias",
      featured: true
    },
    {
      name: "Legacy",
      description: "Governança empresarial completa",
      price: "R$ 59,90",
      originalPrice: "R$ 89,90",
      features: [
        "Tudo do Vanguard",
        "Múltiplos usuários",
        "Fluxo de caixa empresarial",
        "Relatórios fiscais",
        "Integração contábil",
        "Suporte dedicado"
      ],
      cta: "Falar com Especialista",
      featured: false
    }
  ];

  return (
    <section className="pricing section-py" id="pricing">
      <div className="container">
        <div className="pricing__header">
          <h2 className="pricing__title">Planos que Crescem com Você</h2>
          <p className="pricing__subtitle">
            Comece gratuitamente e evolua conforme suas necessidades
          </p>
        </div>

        {/* Timer de Oferta */}
        <div className="pricing__offer">
          <div className="offer__badge">Oferta por Tempo Limitado</div>
          <div className="offer__timer">
            <div className="timer__item">
              <span className="timer__value">{timeLeft.days || 0}</span>
              <span className="timer__label">Dias</span>
            </div>
            <div className="timer__item">
              <span className="timer__value">{timeLeft.hours || 0}</span>
              <span className="timer__label">Horas</span>
            </div>
            <div className="timer__item">
              <span className="timer__value">{timeLeft.minutes || 0}</span>
              <span className="timer__label">Minutos</span>
            </div>
            <div className="timer__item">
              <span className="timer__value">{timeLeft.seconds || 0}</span>
              <span className="timer__label">Segundos</span>
            </div>
          </div>
        </div>

        {/* Cards de Planos */}
        <div className="pricing__grid">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`pricing__card ${plan.featured ? 'pricing__card--featured' : ''}`}
            >
              {plan.featured && (
                <div className="card__badge">Mais Popular</div>
              )}
              
              <div className="card__header">
                <h3 className="card__name">{plan.name}</h3>
                <p className="card__description">{plan.description}</p>
                
                <div className="card__price">
                  <span className="price__current">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="price__original">{plan.originalPrice}</span>
                  )}
                </div>
              </div>

              <ul className="card__features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="feature__item">
                    <span className="feature__icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`btn btn--card ${plan.featured ? 'btn--primary' : 'btn--secondary'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
