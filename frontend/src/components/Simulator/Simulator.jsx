import React, { useState } from 'react';
import './Simulator.css';

const Simulator = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', category: 'Alimentação' });

  const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Vestuário', 'Outros'];

  const addTransaction = () => {
    if (newTransaction.description && newTransaction.amount) {
      const transaction = {
        id: Date.now(),
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        date: new Date().toLocaleDateString('pt-BR')
      };
      setTransactions([transaction, ...transactions]);
      setNewTransaction({ description: '', amount: '', category: 'Alimentação' });
    }
  };

  const removeTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="simulator">
      <div className="simulator__header">
        <div className="container">
          <div className="simulator__nav">
            <button className="btn btn--secondary" onClick={() => window.history.back()}>
              ← Voltar
            </button>
            <h1>Simulador Financeiro Fortress</h1>
            <button className="btn btn--primary">Salvar Progresso</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="simulator__content">
          <div className="simulator__add">
            <h3>Adicionar Gastos</h3>
            <div className="add__form">
              <input
                type="text"
                placeholder="Descrição"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                className="form__input"
              />
              <input
                type="number"
                placeholder="Valor (R$)"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="form__input"
              />
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                className="form__select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button onClick={addTransaction} className="btn btn--primary">
                Adicionar
              </button>
            </div>
          </div>

          <div className="simulator__transactions">
            <h3>Seus Gastos ({transactions.length})</h3>
            {transactions.length === 0 ? (
              <div className="empty__state">
                <p>Nenhum gasto registrado ainda</p>
              </div>
            ) : (
              <div className="transactions__list">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="transaction__item">
                    <div className="transaction__info">
                      <div className="transaction__description">{transaction.description}</div>
                      <div className="transaction__category">{transaction.category}</div>
                      <div className="transaction__date">{transaction.date}</div>
                    </div>
                    <div className="transaction__amount">
                      R$ {transaction.amount.toFixed(2)}
                      <button onClick={() => removeTransaction(transaction.id)} className="transaction__remove">
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="simulator__cta">
            <div className="cta__content">
              <h2>✨ Versão Completa Disponível</h2>
              <button className="btn btn--primary btn--large">
                Criar Conta para Salvar Progresso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
