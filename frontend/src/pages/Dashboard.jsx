import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { getForecast } from '../api/coreApi';

// Mock market data (backend doesn't have this endpoint)
const mockMarketData = [
  { name: 'Stocks', value: '$12,450', change: 2.3, icon: '📈' },
  { name: 'Bonds', value: '$5,200', change: -0.5, icon: '📊' },
  { name: 'Crypto', value: '$1,890', change: 5.1, icon: '₿' },
];

// Mock recent transactions (backend doesn't have transactions - could derive from lists)
const mockTransactions = [
  { merchant: 'Supermarket', amount: 87.50, time: '2h ago', icon: '🛒' },
  { merchant: 'Coffee Shop', amount: 5.20, time: '5h ago', icon: '☕' },
  { merchant: 'Gas Station', amount: 45.00, time: '1d ago', icon: '⛽' },
];

function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
}

export default function Dashboard() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getForecast()
      .then((data) => setForecast(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data - use forecast history or mock monthly data
  const chartData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (forecast?.history?.length) {
      const byMonth = {};
      months.forEach((m, i) => { byMonth[i] = { month: m, value: 0 }; });
      forecast.history.forEach((h) => {
        const d = new Date(h.date);
        const i = d.getMonth();
        if (byMonth[i]) byMonth[i].value += h.amount || 0;
      });
      return Object.values(byMonth);
    }
    return months.map((month, i) => ({
      month,
      value: Math.round(300 + Math.random() * 400),
    }));
  })();

  const balance = forecast?.meta
    ? (forecast.meta.budget || 0) - (forecast.meta.currentSpend || 0)
    : 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error card">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="card dashboard-card-fortress">
            <h2>Your Fortress Card</h2>
            <div className="dashboard-balance">{formatBRL(balance)}</div>
            <p className="dashboard-balance-sub">Available balance</p>
          </div>

          <div className="card dashboard-chart-card">
            <h2>AI Portfolio Overview</h2>
            <p className="dashboard-chart-sub">Monthly spending</p>
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => v}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111',
                      border: '1px solid #1a1a1a',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [formatBRL(value), 'Spent']}
                  />
                  <Bar
                    dataKey="value"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card dashboard-insights-card">
            <h2>AI Insights</h2>
            <p className="dashboard-insights-sub">
              Personalized financial insights powered by AI
            </p>
            <Link to="/intelligence" className="btn btn-primary">
              View Insights
            </Link>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="card dashboard-market-card">
            <h3>Market Data</h3>
            <div className="dashboard-market-list">
              {mockMarketData.map((item) => (
                <div key={item.name} className="dashboard-market-item">
                  <span className="dashboard-market-icon">{item.icon}</span>
                  <div className="dashboard-market-info">
                    <span className="dashboard-market-name">{item.name}</span>
                    <span className="dashboard-market-value">{item.value}</span>
                  </div>
                  <span
                    className={`dashboard-market-change ${
                      item.change >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card dashboard-transactions-card">
            <h3>Recent Transactions</h3>
            <div className="dashboard-transactions-list">
              {mockTransactions.map((t, i) => (
                <div key={i} className="dashboard-transaction-item">
                  <span className="dashboard-transaction-icon">{t.icon}</span>
                  <div className="dashboard-transaction-info">
                    <span className="dashboard-transaction-merchant">{t.merchant}</span>
                    <span className="dashboard-transaction-time">{t.time}</span>
                  </div>
                  <span className="dashboard-transaction-amount">
                    {formatBRL(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 16px;
          color: var(--text-secondary);
        }
        .dashboard-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--card-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dashboard-grid {
          display: grid;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr 320px;
          }
        }
        .dashboard-main { display: flex; flex-direction: column; gap: 24px; }
        .dashboard-card-fortress {
          padding: 32px;
        }
        .dashboard-card-fortress h2 {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: 8px;
        }
        .dashboard-balance { font-size: 2.5rem; font-weight: 700; }
        .dashboard-balance-sub { color: var(--text-secondary); font-size: 14px; }
        .dashboard-chart-card {
          padding: 24px;
        }
        .dashboard-chart-card h2 { font-size: 1.1rem; margin-bottom: 4px; }
        .dashboard-chart-sub { color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; }
        .dashboard-chart { width: 100%; }
        .dashboard-insights-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dashboard-insights-card h2 { font-size: 1.1rem; }
        .dashboard-insights-sub { color: var(--text-secondary); font-size: 14px; }
        .dashboard-sidebar { display: flex; flex-direction: column; gap: 24px; }
        .dashboard-market-card, .dashboard-transactions-card {
          padding: 20px;
        }
        .dashboard-market-card h3, .dashboard-transactions-card h3 {
          font-size: 1rem;
          margin-bottom: 16px;
        }
        .dashboard-market-list, .dashboard-transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dashboard-market-item, .dashboard-transaction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--card-border);
        }
        .dashboard-market-item:last-child, .dashboard-transaction-item:last-child {
          border-bottom: none;
        }
        .dashboard-market-icon { font-size: 1.2rem; }
        .dashboard-market-info, .dashboard-transaction-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dashboard-market-name, .dashboard-transaction-merchant { font-weight: 500; }
        .dashboard-market-value { font-size: 14px; color: var(--text-secondary); }
        .dashboard-transaction-time { font-size: 12px; color: var(--text-secondary); }
        .dashboard-market-change.positive { color: var(--primary); }
        .dashboard-market-change.negative { color: #ef4444; }
        .dashboard-transaction-amount { font-weight: 600; }
      `}</style>
    </div>
  );
}
