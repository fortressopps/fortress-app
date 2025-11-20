import React from 'react';
import './Benefits.css';

const Benefits = () => {
  const benefits = [
    {
      icon: '📊',
      title: 'Insights em Tempo Real',
      description: 'Visualize seus gastos e receitas com gráficos interativos e relatórios detalhados.'
    },
    {
      icon: '🎯',
      title: 'Metas Personalizadas',
      description: 'Defina objetivos financeiros e acompanhe seu progresso automaticamente.'
    },
    {
      icon: '🛒',
      title: 'Modo Supermercado',
      description: 'Economia inteligente com comparação de preços e alertas de promoções.'
    },
    {
      icon: '🔒',
      title: 'Segurança Máxima',
      description: 'Seus dados protegidos com criptografia de nível bancário.'
    },
    {
      icon: '📱',
      title: 'Multiplataforma',
      description: 'Acesse de qualquer dispositivo, sempre com seus dados sincronizados.'
    },
    {
      icon: '💎',
      title: 'Suporte Premium',
      description: 'Time especializado para ajudar você a alcançar sua liberdade financeira.'
    }
  ];

  return (
    <section className="benefits" id="benefits">
      <div className="container">
        <div className="benefits__content">
          <h2 className="benefits__title">
            Por que escolher o <span className="text-emerald">Fortress</span>?
          </h2>
          <p className="benefits__description">
            Ferramentas poderosas que transformam sua relação com o dinheiro
          </p>

          <div className="benefits__grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit__card">
                <div className="benefit__icon">{benefit.icon}</div>
                <h3 className="benefit__title">{benefit.title}</h3>
                <p className="benefit__description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
