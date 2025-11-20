import React from 'react';
import './Pricing.css';

const Pricing = () => {
  const pricingPlans = [
    {
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
        alert('🎉 Excelente escolha! Você está entre os 85% que começam pelo Sentinel e evoluem depois.');
        break;
      
      case 'trial':
        alert(`🎉 Excelente escolha! Prepare-se para transformar suas finanças.\n\nVocê terá 7 dias para explorar todas as funcionalidades do Vanguard e ver resultados reais.`);
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
        <h2 className="pricing-title">
          Escolha Seu Nível de Controle
        </h2>
        <p className="pricing-subtitle">
          Comece gratuito, cresça com inteligência, construa seu legado. 
          <strong> 92% dos usuários evoluem dentro de 3 meses.</strong>
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
                <div className="plan-icon">
                  {plan.icon}
                </div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
              </div>
              
              <div className="pricing-amount">
                {plan.ctaType === 'expert' ? (
                  <div className="expert-cta">
                    <div className="expert-icon">💼</div>
                    <div className="expert-text">Solução Personalizada</div>
                  </div>
                ) : (
                  <>
                    {plan.originalPrice && (
                      <div className="original-price">
                        De R$ {plan.originalPrice}
                      </div>
                    )}
                    <div className="price">
                      {plan.ctaType === 'free' ? (
                        <span className="free-price">{plan.price}</span>
                      ) : (
                        <>
                          <span className="currency">R$</span>
                          {plan.price}
                        </>
                      )}
                    </div>
                    <div className="period">{plan.period}</div>
                  </>
                )}
              </div>
              
              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              
              <button 
                className={`pricing-button ${plan.featured ? 'btn-primary' : 'btn-secondary'} ${plan.ctaType}`}
                onClick={() => handleCtaClick(plan.type, plan.ctaType)}
              >
                {plan.buttonText}
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
          ))}
        </div>

        {/* Prova Social - Depoimentos Reais */}
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