import React, { useState, useEffect } from 'react';
import './Simulator.css';

const Simulator = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', category: 'Alimentação' });
  const [monthlyBudget, setMonthlyBudget] = useState(3000);
  const [insights, setInsights] = useState([]);

  const categories = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 
    'Saúde', 'Educação', 'Vestuário', 'Outros'
  ];

  const categoryColors = {
    'Alimentação': '#10b981',
    'Transporte': '#3b82f6', 
    'Moradia': '#8b5cf6',
    'Lazer': '#f59e0b',
    'Saúde': '#ef4444',
    'Educação': '#06b6d4',
    'Vestuário': '#ec4899',
    'Outros': '#6b7280'
  };
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

  const calculateInsights = () => {
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = monthlyBudget - totalSpent;
    const dailyBudget = remaining / (30 - new Date().getDate());
    
    const categoryTotals = {};
    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const biggestExpense = transactions.length > 0 ? 
      transactions.reduce((max, t) => t.amount > max.amount ? t : max) : null;

    return [
      totalSpent > 0 && {
        type: 'total',
        title: 'Total Gasto',
        value: `R$ ${totalSpent.toFixed(2)}`,
        subtitle: `${((totalSpent / monthlyBudget) * 100).toFixed(1)}% do orçamento`
      },
      {
        type: 'remaining',
        title: 'Saldo Restante',
        value: `R$ ${remaining.toFixed(2)}`,
        subtitle: dailyBudget > 0 ? `R$ ${dailyBudget.toFixed(2)} por dia` : 'Orçamento estourado'
      },
      biggestExpense && {
        type: 'biggest',
        title: 'Maior Gastos',
        value: biggestExpense.description,
        subtitle: `R$ ${biggestExpense.amount} - ${biggestExpense.category}`
      },
      Object.keys(categoryTotals).length > 0 && {
        type: 'category',
        title: 'Categoria Principal',
        value: Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b),
        subtitle: `R$ ${Math.max(...Object.values(categoryTotals)).toFixed(2)}`
      }
    ].filter(Boolean);
  };
          {/* Adicionar Transação */}
          <div className="simulator__add">
            <h3>Adicionar Gastos</h3>
            <div className="add__form">
              <input
                type="text"
                placeholder="Descrição (ex: Supermercado, Uber, ...)"
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

          {/* Lista de Transações */}
          <div className="simulator__transactions">
            <h3>Seus Gastos Recentes</h3>
            {transactions.length === 0 ? (
              <div className="empty__state">
                <div className="empty__icon">💸</div>
                <p>Nenhum gasto registrado ainda</p>
                <small>Adicione seus primeiros gastos para ver insights poderosos</small>
              </div>
            ) : (
              <div className="transactions__list">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="transaction__item">
                    <div className="transaction__info">
                      <div className="transaction__description">
                        {transaction.description}
                      </div>
                      <div className="transaction__category" style={{ color: categoryColors[transaction.category] }}>
                        {transaction.category}
                      </div>
                      <div className="transaction__date">
                        {transaction.date}
                      </div>
                    </div>
                    <div className="transaction__amount">
                      R$ {transaction.amount.toFixed(2)}
                      <button 
                        onClick={() => removeTransaction(transaction.id)}
                        className="transaction__remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Call to Action Final */}
          <div className="simulator__cta">
            <div className="cta__content">
              <h2>✨ Visualização Completa Disponível</h2>
              <p>
                Esta é apenas uma demonstração do poder do Fortress. 
                Na versão completa você terá:
              </p>
              <ul>
                <li>✅ Histórico ilimitado de transações</li>
                <li>✅ Gráficos interativos e relatórios detalhados</li>
                <li>✅ Metas financeiras personalizadas</li>
                <li>✅ Modo Supermercado com economia inteligente</li>
                <li>✅ Suporte especializado</li>
              </ul>
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
