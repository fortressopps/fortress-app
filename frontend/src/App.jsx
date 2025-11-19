import React from 'react';
import './App.css';
import Header from './components/Header/Header.jsx';
import './styles/design-system.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>Fortress - Em Desenvolvimento</h2>
          <p>Modo Supermercado e Dashboard em breve!</p>
        </div>
      </main>
    </div>
  );
}

export default App;
