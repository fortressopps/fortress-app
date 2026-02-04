import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

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
        opacity: opacity,
      }}
    />
  );
});

// Componente de Card de Plano Otimizado
const PlanCard = React.memo(
  ({ plan, icon, title, description, audience, onHover, onClick }) => {
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
  },
);

// Componente de Botão Otimizado
const ActionButton = React.memo(
  ({ type, icon, text, onClick, onMouseEnter }) => {
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
        {type === "primary" && <span className="btn-glow"></span>}
        {type === "secondary" && <span className="btn-sparkle"></span>}
      </button>
    );
  },
);

// Componente Principal
const HeroSection = () => {
  const navigate = useNavigate();
  // Wait, I already have navigate from useNavigate() on line 96.

  // Actually, I'll just rewrite the return statement to be cleaner and light-themed.
  return (
    <section
      className="fortress-hero bg-surface min-h-[80vh] flex items-center justify-center p-8 py-32"
      id="hero"
    >
      <div className="max-w-4xl text-center space-y-12 animate-entrance">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-surface border border-emerald-primary/10 rounded-full">
          <div className="w-2 h-2 bg-emerald-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-forest-green tracking-widest uppercase">
            Fortress v8.1 Institutional
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-charcoal tracking-tight leading-tight">
          Patrimônio sob <br />
          <span className="text-forest-green">Custódia Inteligente</span>
        </h1>

        <p className="text-mute text-lg md:text-xl max-w-2xl mx-auto font-medium">
          A infraestrutura tática definitiva para gestão, sucessão e proteção de
          ativos digitais e físicos.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-5 bg-forest-green text-white rounded-2xl font-bold text-sm tracking-widest hover:shadow-2xl hover:scale-105 transition-all uppercase"
          >
            Iniciar Protocolo
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 bg-card border border-border-light text-charcoal rounded-2xl font-bold text-sm tracking-widest hover:bg-surface transition-all uppercase"
          >
            Acesso Operador
          </button>
        </div>

        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center opacity-60">
          <div>
            <p className="text-3xl font-bold text-charcoal">18.5k+</p>
            <p className="text-[10px] font-bold text-mute uppercase tracking-widest">
              Fortalezas Ativas
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">€ 3.2B</p>
            <p className="text-[10px] font-bold text-mute uppercase tracking-widest">
              Ativos Sob Gestão
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">99.9%</p>
            <p className="text-[10px] font-bold text-mute uppercase tracking-widest">
              Uptime Sentinel
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Display name para melhor debugging
Particle.displayName = "Particle";
PlanCard.displayName = "PlanCard";
ActionButton.displayName = "ActionButton";
HeroSection.displayName = "HeroSection";

export default HeroSection;
