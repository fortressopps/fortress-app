import React from 'react';
import './Benefits.css';

const Benefits = () => {
  const benefits = [
    {
      icon: '🏰',
      title: 'Solidez Comprovada',
      description: 'Infraestrutura robusta com segurança bancária para proteger seu patrimônio.'
    },
    {
      icon: '📊',
      title: 'Análise Inteligente',
      description: 'Controle total com ferramentas de análise preditiva para tomada de decisão.'
    },
    {
      icon: '🛒',
      title: 'Modo Supermercado',
      description: 'Economia real no dia a dia com planejamento e controle de compras.'
    },
    {
      icon: '🚀',
      title: 'Implementação Rápida',
      description: 'Comece em minutos sem complicação. Foco no que realmente importa.'
    },
    {
      icon: '🔒',
      title: 'Privacidade Total',
      description: 'Seus dados são criptografados e nunca compartilhados com terceiros.'
    },
    {
      icon: '📈',
      title: 'Crescimento Garantido',
      description: 'Escalável do uso pessoal ao empresarial sem mudar de plataforma.'
    }
  ];

  return (
    <section className="benefits section-py" id="benefits">
      <div className="container">
        <div className="benefits__header">
          <h2 className="benefits__title">Vantagens Exclusivas</h2>
          <p className="benefits__subtitle">
            Recursos pensados para oferecer o melhor em gestão financeira
          </p>
        </div>

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
    </section>
  );
};

export default Benefits;
