import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Benefits.css';

const Benefits = () => {
  const navigate = useNavigate();
  const [expandedBenefit, setExpandedBenefit] = useState(null);

  const toggleBenefit = (benefitId) => {
    setExpandedBenefit(expandedBenefit === benefitId ? null : benefitId);
  };

  const benefitsData = [
    {
      id: 'supermarket',
      icon: '🛒',
      name: 'MODO SUPERMERCADO',
      description: 'Controle total das compras do mês',
      shortDescription: 'Economize até 30% nas compras',
      features: [
        'Lista de compras inteligente',
        'Comparação de preços automática',
        'Alertas de promoções',
        'Controle de validade dos produtos',
        'Histórico de gastos detalhado',
        'Planos de compra semanais/mensais'
      ],
      stats: 'Economia média: R$ 287/mês',
      featured: true,
      type: 'supermarket'
    },
    {
      id: 'financial-goals',
      icon: '🎯',
      name: 'METAS FINANCEIRAS',
      description: 'Alcance seus objetivos com planejamento',
      shortDescription: 'Visualize seu progresso em tempo real',
      features: [
        'Definição de metas personalizadas',
        'Acompanhamento de progresso',
        'Alertas de milestones',
        'Projeções automáticas',
        'Dicas personalizadas',
        'Comemoração de conquistas'
      ],
      stats: '87% mais chances de sucesso',
      featured: false,
      type: 'goals'
    },
    {
      id: 'investment',
      icon: '📈',
      name: 'ANÁLISE DE INVESTIMENTOS',
      description: 'Tome decisões inteligentes',
      shortDescription: 'Otimize seus retornos',
      features: [
        'Análise de perfil de risco',
        'Recomendações personalizadas',
        'Simulação de cenários',
        'Diversificação automática',
        'Alertas de oportunidades',
        'Relatórios de performance'
      ],
      stats: 'Retorno médio: +18% ao ano',
      featured: false,
      type: 'investment'
    },
    {
      id: 'family',
      icon: '👨‍👩‍👧‍👦',
      name: 'CONTROLE FAMILIAR',
      description: 'Organize as finanças da família',
      shortDescription: 'Transparência e colaboração',
      features: [
        'Perfis individuais',
        'Metas familiares compartilhadas',
        'Controle de mesada',
        'Educação financeira infantil',
        'Relatórios familiares',
        'Orçamento colaborativo'
      ],
      stats: 'Famílias organizadas: 92%',
      featured: true,
      type: 'family'
    },
    {
      id: 'reports',
      icon: '📊',
      name: 'RELATÓRIOS DETALHADOS',
      description: 'Insights profundos sobre seus gastos',
      shortDescription: 'Tome decisões baseadas em dados',
      features: [
        'Dashboard personalizável',
        'Análise por categorias',
        'Comparativo mensal/anual',
        'Projeções futuras',
        'Exportação de dados',
        'Alertas inteligentes'
      ],
      stats: '15+ tipos de relatórios',
      featured: false,
      type: 'reports'
    },
    {
      id: 'security',
      icon: '🔒',
      name: 'SEGURANÇA AVANÇADA',
      description: 'Suas finanças protegidas',
      shortDescription: 'Tranquilidade garantida',
      features: [
        'Criptografia de ponta a ponta',
        'Autenticação biométrica',
        'Backup automático',
        'Monitoramento 24/7',
        'Seguro contra fraudes',
        'Conformidade LGPD'
      ],
      stats: 'Proteção 100% garantida',
      featured: false,
      type: 'security'
    }
  ];

  const handleLearnMore = useCallback((benefitType) => {
    switch (benefitType) {
      case 'supermarket':
        navigate('/receipts');
        break;
      case 'goals':
        navigate('/goals');
        break;
      case 'reports':
      case 'family':
      case 'investment':
      case 'security':
        navigate('/register');
        break;
      default:
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  }, [navigate]);

  return (
    <section className="benefits-container" id="benefits">
      <div className="benefits-content">
        <h2 className="benefits-title text-charcoal text-6xl font-bold tracking-tighter mb-6">
          System Infrastructure
        </h2>
        <p className="benefits-subtitle text-mute text-xl font-medium max-w-2xl mx-auto mb-20">
          Módulos integrados de custódia patrimonial e inteligência tática.
        </p>

        <div className="benefits-grid">
          {benefitsData.map((benefit, index) => (
            <div
              key={index}
              className={`benefits-card ${benefit.featured ? 'featured' : ''} ${benefit.type}`}
            >
              {benefit.featured && (
                <div className="featured-badge">
                  ⭐ Popular
                </div>
              )}

              <div className="benefits-header">
                <div className="benefit-icon neon-glow-emerald">
                  {benefit.icon}
                </div>
                <h3 className="benefit-name">{benefit.name}</h3>
                <p className="benefit-description">{benefit.description}</p>
                <p className="benefit-short-description">{benefit.shortDescription}</p>
              </div>

              <div className="benefits-stats">
                <div className="stats-badge">
                  {benefit.stats}
                </div>
              </div>

              {/* Botão Ler Mais */}
              <button
                className="read-more-btn"
                onClick={() => toggleBenefit(benefit.id)}
              >
                {expandedBenefit === benefit.id ? 'Ver Menos' : 'Ver Detalhes'}
                <span className="read-more-arrow">
                  {expandedBenefit === benefit.id ? '↑' : '↓'}
                </span>
              </button>

              {/* Conteúdo Expandido */}
              {expandedBenefit === benefit.id && (
                <div className="expanded-content">
                  <div className="features-section">
                    <h4 className="features-title">O que você ganha:</h4>
                    <ul className="benefits-features">
                      {benefit.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`benefits-button ${benefit.featured ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleLearnMore(benefit.type)}
                  >
                    {benefit.type === 'supermarket' ? 'Ativar Modo' :
                      benefit.type === 'family' ? 'Começar Agora' : 'Experimentar'}
                  </button>

                  {/* Micro-copy contextual */}
                  <div className="micro-copy">
                    <span>
                      {benefit.type === 'supermarket' && '✅ Disponível em todos os planos'}
                      {benefit.type === 'family' && '👨‍👩‍👧‍👦 Perfeito para famílias'}
                      {benefit.type === 'investment' && '📈 A partir do plano Vanguard'}
                      {benefit.type === 'reports' && '📊 Relatórios em tempo real'}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão CTA quando não expandido */}
              {expandedBenefit !== benefit.id && (
                <button
                  className={`benefits-button ${benefit.featured ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleLearnMore(benefit.type)}
                >
                  {benefit.type === 'supermarket' ? 'Ativar Modo' :
                    benefit.type === 'family' ? 'Começar Agora' : 'Saiba Mais'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Prova Social - Similar ao Pricing */}
        <div className="benefits-social-proof">
          <div className="benefits-proof-stats">
            <strong>15.328+</strong> benefícios ativos •
            <strong> 94%</strong> de adoção •
            <strong> 4.8/5</strong> satisfação
          </div>

          <div className="benefits-testimonials">
            <div className="benefit-testimonial">
              <div className="testimonial-content">
                "O modo supermercado mudou completamente minha relação com as compras.
                Economizo em média R$ 300 por mês só com a lista inteligente!"
              </div>
              <div className="testimonial-author">
                <span className="author-name">Maria S.</span>
                <span className="author-benefit">→ Modo Supermercado</span>
              </div>
            </div>

            <div className="benefit-testimonial">
              <div className="testimonial-content">
                "As metas financeiras me ajudaram a juntar R$ 15.000 para minha viagem dos sonhos.
                O acompanhamento visual foi fundamental para manter a motivação."
              </div>
              <div className="testimonial-author">
                <span className="author-name">Pedro L.</span>
                <span className="author-benefit">Metas Financeiras</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;