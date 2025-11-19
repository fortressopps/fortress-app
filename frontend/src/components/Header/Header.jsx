import React from 'react';
import '../../../src/styles/design-system.css';

const Header = () => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--emerald-600) 0%, var(--emerald-500) 100%)',
      color: 'var(--white)',
      padding: '100px 0 80px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <span style={{ fontSize: '4rem', marginBottom: '20px', display: 'block' }}>🏰</span>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '25px',
          fontWeight: '600',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.2'
        }}>
          Controle Financeiro com Autoridade
        </h1>
        <p style={{
          fontSize: '1.3rem',
          maxWidth: '700px',
          margin: '0 auto 40px',
          opacity: '0.9',
          fontWeight: '300',
          lineHeight: '1.6'
        }}>
          Do controle básico no Sentinel à gestão completa no Legacy. Fortaleza solidez em cada decisão financeira.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <button className="btn btn-primary" onClick={() => alert('Começar Trial!')}>
            Começar Gratuitamente
          </button>
          <button style={{
            background: 'transparent',
            color: 'var(--white)',
            border: '2px solid var(--white)',
            padding: '14px 35px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }} onClick={() => alert('Conhecer Planos!')}>
            Conhecer Planos
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
