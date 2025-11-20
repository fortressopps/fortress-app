import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="fortress-dashboard">
      {/* 🎯 CABEÇALHO DA TORRE DE CONTROLE */}
      <div className="dashboard-header">
        <h1>Torre de Controle</h1>
        <div className="user-archetype">
          <span className="archetype-badge strategist">O ESTRATEGISTA</span>
        </div>
      </div>
      
      {/* 📊 GRID PRINCIPAL */}
      <div className="dashboard-grid">
        
        {/* 🗺️ MAPA PATRIMONIAL */}
        <div className="dashboard-card map-card">
          <h3>🗺️ Mapa Patrimonial</h3>
          <div className="map-visualization">
            <p>Visão completa do seu território financeiro</p>
            <small>Patrimônio total: R$ ---</small>
          </div>
        </div>
        
        {/* 🔔 ALERTAS DO GUARDIÃO */}
        <div className="dashboard-card alerts-card">
          <h3>🔔 Alertas do Guardião</h3>
          <div className="alerts-list">
            <div className="alert-item warning">
              <h4>Meta do Mês</h4>
              <p>Você está a 75% da sua economia mensal</p>
            </div>
            <div className="alert-item info">
              <h4>Investimento Disponível</h4>
              <p>R$ 1.200 disponíveis para aplicar</p>
            </div>
            <div className="alert-item info">
              <h4>Relatório Semanal</h4>
              <p>Seu patrimônio cresceu 2.3% esta semana</p>
            </div>
          </div>
        </div>
        
        {/* 🏆 TRILHA DE EVOLUÇÃO FORTRESS */}
        <div className="dashboard-card progress-card">
          <h3>🏆 Trilha de Evolução</h3>
          <div className="evolution-track">
            <div className="phase sentinel active">
              <span>🛡️ FASE SENTINEL</span>
              <br />
              <small>Domínio do Território Financeiro</small>
            </div>
            <div className="phase vanguard">
              <span>⚔️ FASE VANGUARD</span>
              <br />
              <small>Expansão Estratégica</small>
            </div>
            <div className="phase legacy">
              <span>👑 FASE LEGACY</span>
              <br />
              <small>Construção de Legado</small>
            </div>
          </div>
        </div>
        
        {/* 💰 FLUXO FINANCEIRO */}
        <div className="dashboard-card">
          <h3>💰 Fluxo Financeiro</h3>
          <div style={{padding: '2rem', textAlign: 'center', color: 'var(--gray-strategic)'}}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📊</div>
            <p>Seu fluxo de entrada e saída este mês</p>
            <small>Em desenvolvimento</small>
          </div>
        </div>
        
        {/* 🎯 METAS E OBJETIVOS */}
        <div className="dashboard-card">
          <h3>🎯 Metas do Estrategista</h3>
          <div style={{padding: '2rem', textAlign: 'center', color: 'var(--gray-strategic)'}}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🎯</div>
            <p>Suas metas financeiras em andamento</p>
            <small>Em desenvolvimento</small>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;