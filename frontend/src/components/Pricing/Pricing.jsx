import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = useState(null);

  const togglePlan = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const pricingPlans = [
    {
      id: 'sentinel',
      icon: '🛡️',
      name: 'SENTINEL',
      description: 'Comece sua jornada sem riscos',
      price: 'Free',
      period: 'para sempre',
      features: [
        'Controle de gastos básico',
        '3 metas financeiras',
        'Relatórios simples',
        'Suporte comunitário',
        'App mobile incluso',
        'Sem compromisso'
      ],
      buttonText: 'Começar Gratuitamente',
      featured: false,
      type: 'sentinel',
      ctaType: 'free'
    },
    {
      id: 'vanguard',
      icon: '⚔️',
      name: 'VANGUARD',
      description: 'A escolha inteligente para crescimento',
      price: '19,90',
      originalPrice: '29,90',
      period: 'por mês',
      features: [
        'Tudo do Sentinel',
        'Metas ilimitadas',
        'Análise de investimentos',
        'Projeções avançadas',
        'Relatórios detalhados',
        'Integração bancária'
      ],
      buttonText: 'Experimentar Agora',
      featured: true,
      type: 'vanguard',
      ctaType: 'trial'
    },
    {
      id: 'legacy',
      icon: '👑',
      name: 'LEGACY',
      description: 'Solução personalizada para seu legado',
      price: 'Personalizado',
      period: 'sob consulta',
      features: [
        'Tudo do Vanguard',
        'Gestor financeiro dedicado',
        'Planejamento sucessório',
        'Otimização fiscal avançada',
        'Consultoria familiar',
        'Relatórios executivos',
        'Concierge exclusivo'
      ],
      buttonText: 'Falar com Especialista',
      featured: false,
      type: 'legacy',
      ctaType: 'expert'
    }
  ];

  const handleCtaClick = (planType, ctaType) => {
    switch (ctaType) {
      case 'free':
      case 'trial':
        navigate('/register');
        break;

      case 'expert':
        const phone = '5511999999999';
        const message = encodeURIComponent(`Olá! Vi o plano Legacy no Fortress e gostaria de uma consultoria personalizada para meu legado financeiro. Podemos conversar?`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        break;

      default:
        break;
    }
  };

  return (
    <section className="pricing-container" id="pricing">
      <div className="pricing-content">
        <h2 className="pricing-title text-charcoal text-6xl font-bold tracking-tighter mb-6">
          Custódia & Governança
        </h2>
        <p className="pricing-subtitle text-mute text-xl font-medium max-w-2xl mx-auto mb-20">
          Planos táticos para construção de legado e expansão patrimonial.
        </p>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${plan.featured ? 'featured' : ''} ${plan.type}`}
            >
              {plan.featured && (
                <div className="featured-badge">
                  🚀 Mais Escolhido
                </div>
              )}

              {plan.type === 'vanguard' && (
                <div className="promo-badge">
                  🔥 33% OFF
                </div>
              )}

              <div className="pricing-header">
                <div className="plan-icon neon-glow">
                  {plan.icon}
                </div>
                <h3 className="plan-name text-charcoal font-bold">{plan.name}</h3>
                <p className="plan-description text-mute font-medium">{plan.description}</p>
              </div>

              <div className="pricing-amount">
                {plan.ctaType === 'expert' ? (
                  <div className="expert-cta">
                    <div className="expert-icon">💼</div>
                    <div className="expert-text text-white">Solução Personalizada</div>
                  </div>
                ) : (
                  <>
                    {plan.originalPrice && (
                      <div className="original-price opacity-40 line-through">
                        R$ {plan.originalPrice}
                      </div>
                    )}
                    <div className="price text-charcoal text-4xl font-bold tracking-tighter">
                      {plan.ctaType === 'free' ? (
                        <span className="free-price">{plan.price}</span>
                      ) : (
                        <>
                          <span className="currency text-xl font-medium">R$</span>
                          {plan.price}
                        </>
                      )}
                    </div>
                    <div className="period text-[10px] text-mute uppercase font-bold tracking-widest">{plan.period}</div>
                  </>
                )}
              </div>

              {/* Botão Ler Mais - Estilizado para combinar com o design */}
              <button
                className="read-more-btn"
                onClick={() => togglePlan(plan.id)}
              >
                {expandedPlan === plan.id ? 'Ler Menos' : 'Ler Mais'}
                <span className="read-more-arrow">
                  {expandedPlan === plan.id ? '↑' : '↓'}
                </span>
              </button>

              {/* Conteúdo Expandido */}
              {expandedPlan === plan.id && (
                <div className="expanded-content">
                  <div className="features-section">
                    <h4 className="features-title">Funcionalidades Incluídas:</h4>
                    <ul className="pricing-features">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`pricing-button ${plan.featured ? 'btn-primary' : 'btn-secondary'} ${plan.ctaType}`}
                    onClick={() => handleCtaClick(plan.type, plan.ctaType)}
                  >
                    {plan.buttonText}
                    {plan.ctaType === 'trial' && (
                      <span className="trial-badge">7 DIAS GRÁTIS</span>
                    )}
                  </button>

                  {/* Micro-copy psicológico */}
                  {plan.ctaType === 'free' && (
                    <div className="micro-copy">
                      <span>✅ Sem cartão de crédito</span>
                    </div>
                  )}

                  {plan.ctaType === 'trial' && (
                    <div className="micro-copy">
                      <span>✨ 7 dias para explorar tudo</span>
                    </div>
                  )}

                  {plan.ctaType === 'expert' && (
                    <div className="micro-copy">
                      <span>🎯 Análise personalizada sem custo</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botão CTA quando não expandido */}
              {expandedPlan !== plan.id && (
                <button
                  className={`pricing-button ${plan.featured ? 'btn-primary' : 'btn-secondary'} ${plan.ctaType}`}
                  onClick={() => handleCtaClick(plan.type, plan.ctaType)}
                >
                  {plan.buttonText}
                  {plan.ctaType === 'trial' && (
                    <span className="trial-badge">7 DIAS GRÁTIS</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Prova Social - Mantido igual */}
        <div className="social-proof">
          <div className="proof-stats">
            <strong>18.542+</strong> fortalezas construídas •
            <strong> 96%</strong> de satisfação •
            <strong> R$ 32Mi+</strong> economizados
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                "Comecei pelo Sentinel, e depois que abri meu MEI mudei para o Vanguard.
                Já estou nesse plano há 3 meses e foi a melhor escolha que fiz para minhas finanças!"
              </div>
              <div className="testimonial-author">
                <span className="author-name">Carlos R.</span>
                <span className="author-plan">→ Vanguard há 3 meses</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "O modo supermercado do Sentinel já me salvou muito! Consigo controlar
                cada compra e evito desperdícios. Minha família notou a diferença no orçamento."
              </div>
              <div className="testimonial-author">
                <span className="author-name">Ana P.</span>
                <span className="author-plan">Sentinel - Modo Supermercado</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "Quando ativei o modo supermercado semanal do Vanguard, nossas economias
                deram um salto! Planejo as compras da família toda e sobra dinheiro no final do mês."
              </div>
              <div className="testimonial-author">
                <span className="author-name">Roberta M.</span>
                <span className="author-plan">Vanguard - Família de 4</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "Comecei a usar a plataforma porque é muito fácil organizar os detalhes da herança.
                O Legacy me dá tranquilidade para planejar o futuro dos meus filhos."
              </div>
              <div className="testimonial-author">
                <span className="author-name">José A.</span>
                <span className="author-plan">Legacy - Planejamento Familiar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;