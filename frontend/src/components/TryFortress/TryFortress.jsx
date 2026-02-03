import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TryFortress.css';

const TryFortress = () => {
  const navigate = useNavigate();

  return (
    <div className="try-fortress-container">
      <div className="try-fortress-header">
        <Link to="/" className="back-button">
          ← Voltar para Home
        </Link>
        <h1>Experimente o Fortress - 100% Gratuito</h1>
        <p>Use nossas ferramentas financeiras agora mesmo e veja resultados reais</p>
      </div>

      <div className="tools-grid">
        <div className="tool-card">
          <div className="tool-icon">🛒</div>
          <h3>Modo Supermercado</h3>
          <p>Controle suas compras e economize no mercado</p>
          <button className="tool-button" onClick={() => navigate('/receipts')}>Usar Ferramenta</button>
        </div>

        <div className="tool-card">
          <div className="tool-icon">📊</div>
          <h3>Dashboard Financeiro</h3>
          <p>Visualize seus gastos e metas em tempo real</p>
          <button className="tool-button" onClick={() => navigate('/dashboard')}>Usar Ferramenta</button>
        </div>

        <div className="tool-card">
          <div className="tool-icon">🎯</div>
          <h3>Metas Financeiras</h3>
          <p>Defina e acompanhe seus objetivos</p>
          <button className="tool-button" onClick={() => navigate('/goals')}>Usar Ferramenta</button>
        </div>
      </div>

      <div className="save-section">
        <p>💡 Seus dados serão perdidos se você sair da página...</p>
        <div className="save-buttons">
          <button className="btn-primary" onClick={() => navigate('/register')}>Salvar Progresso - Criar Conta</button>
          <button className="btn-secondary" onClick={() => alert('Relatório PDF disponível após registro')}>Exportar Relatório PDF</button>
        </div>
      </div>
    </div>
  );
};

export default TryFortress;