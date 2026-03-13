import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts';
import { TrendingUp, Target, ShoppingBag, ArrowRight } from 'lucide-react';
import { getForecast, getGoalsWithProgress, getMarketData, getTransactions, getTransactionSummary, getAlerts } from '../api/coreApi';
import { formatBRL } from '../utils/format';
import './Dashboard.css';

const CATEGORY_ICONS = {
  FOOD: '🍽️',
  TRANSPORT: '🚗',
  HEALTH: '💊',
  ENTERTAINMENT: '🍿',
  SHOPPING: '🛍️',
  SALARY: '💰',
  OTHER: '📌',
};

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function Dashboard() {
  const [data, setData] = useState({
    forecast: null,
    goals: [],
    market: null,
    recentTxs: [],
    txSummary: null,
    alerts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecast, goals, marketObj, txObj, txSumm, alerts] = await Promise.all([
        getForecast(),
        getGoalsWithProgress(),
        getMarketData().catch(e => e.response?.data || []), // Catch to handle 503 fallback gracefully
        getTransactions({ limit: 5 }).catch(e => ({ data: [] })),
        getTransactionSummary().catch(e => ({ balance: 0, totalIncome: 0, totalExpenses: 0 })),
        getAlerts().catch(e => []),
      ]);
      setData({
        forecast,
        goals: Array.isArray(goals) ? goals : [],
        market: Array.isArray(marketObj) ? marketObj : [],
        recentTxs: txObj?.data || [],
        txSummary: txSumm,
        alerts: Array.isArray(alerts) ? alerts : [],
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // Chart data from forecast category breakdown
  const chartData = (() => {
    if (data.forecast?.spendingByCategory) {
      return Object.entries(data.forecast.spendingByCategory)
        .map(([name, value]) => ({
          name: name.charAt(0) + name.slice(1).toLowerCase(), // e.g. "FOOD" -> "Food"
          value
        }))
        .filter(item => item.value > 0) // Only show categories with spending
        .sort((a, b) => b.value - a.value); // Order by highest spending
    }
    return [];
  })();

  const budget = data.forecast?.meta?.budget || 0;
  const balance = data.txSummary ? data.txSummary.balance : 0;
  const spent = data.txSummary ? data.txSummary.totalExpenses : 0;
  const income = data.txSummary ? data.txSummary.totalIncome : 0;

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Syncing with Fortress Kernel...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-header-stats">
          <div className="header-stat">
            <span className="stat-label">Active Goals</span>
            <span className="stat-val">{data.goals.length}</span>
          </div>
          <div className="header-stat">
            <span className="stat-label">Member Tier</span>
            <span className="stat-val text-primary">VANGUARD</span>
          </div>
        </div>
      </header>

      {error && <div className="dashboard-error card">⚠️ {error}</div>}

      {data.alerts && data.alerts.length > 0 && (
        <div className="dash-alerts-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {data.alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`card dash-alert-card bg-${alert.type}`}
              style={{
                padding: '16px',
                borderLeft: `4px solid var(--${alert.type})`,
                backgroundColor: `rgba(var(--${alert.type}-rgb, 128, 128, 128), 0.1)`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ color: `var(--${alert.type})`, fontWeight: 'bold' }}>
                {alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span style={{ color: `var(--${alert.type})` }}>
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* --- Main Card --- */}
          <div className="card dash-main-card">
            <div className="dash-main-info">
              <label>Estimated Balance Remaining</label>
              <div className="dash-main-balance">{formatBRL(balance)}</div>
              <div className="dash-main-footer">
                <span className={balance < 500 ? 'text-warning' : 'text-success'}>
                  {balance < 500 ? '⚠️ Low budget alert' : '✓ Safe spending zone'}
                </span>
                <Link to="/goals" className="dash-link">Manage Goals <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>

          {/* --- Chart Section --- */}
          <div className="card dash-chart-card">
            <div className="dash-chart-header">
              <div>
                <h3>Spending Breakdown</h3>
                <p>Current month expenses by category</p>
              </div>
              <div className="dash-chart-legend">
                <span className="legend-item"><i className="bg-primary" /> Spent</span>
              </div>
            </div>
            <div className="dash-chart-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#22c55e' }}
                    formatter={(value) => [formatBRL(value), 'Spent']}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- Quick AI Action --- */}
          <div className="card dash-ai-card">
            <div className="dash-ai-icon">✨</div>
            <div className="dash-ai-content">
              <h3>Kernel Intelligence is active</h3>
              <p>Based on your last 3 lists, you can save {formatBRL(42)} by consolidating produce shopping.</p>
            </div>
            <Link to="/intelligence" className="btn btn-primary dash-ai-btn">View Analysis</Link>
          </div>

          <div className="dash-split-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            {/* --- Recent Transactions --- */}
            <div className="card dash-tx-card">
              <div className="sidebar-card-header">
                <h3>Recent Transactions</h3>
                <Link to="/transactions" className="sidebar-more">All</Link>
              </div>
              <div className="dash-tx-list">
                {data.recentTxs.length === 0 ? (
                  <p className="empty-text">No transactions yet. Add one manually or complete a shopping list.</p>
                ) : (
                  data.recentTxs.map(tx => (
                    <div key={tx.id} className="dash-activity-item" style={{ alignItems: 'center' }}>
                      <div className="tx-icon" style={{ fontSize: '1.2rem', marginRight: '12px' }}>
                        {CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.OTHER}
                      </div>
                      <div className="dash-activity-info" style={{ flex: 1 }}>
                        <span className="dash-activity-name">{tx.description}</span>
                        <span className="tx-meta" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                           <span className={tx.amount < 0 ? 'text-danger' : 'text-success'} style={{ paddingRight: '6px' }}>
                            {tx.category.toLowerCase()}
                           </span>
                           {timeAgo(tx.date)}
                        </span>
                      </div>
                      <div className={`dash-activity-amount ${tx.amount < 0 ? 'text-danger' : 'text-success'}`}>
                        {formatBRL(tx.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* --- Market Data --- */}
            <div className="card dash-market-card">
              <div className="sidebar-card-header">
                <h3>Market Data</h3>
                {data.market?.some(m => m.cached) && (
                  <span className="text-warning" style={{ fontSize: '0.75rem' }} title="Data may be outdated">⚠️ Cached</span>
                )}
              </div>
              <div className="dash-market-list">
                {(!data.market || data.market.length === 0) ? (
                  <p className="empty-text">Market services unavailable.</p>
                ) : (
                  data.market.map(asset => (
                    <div key={asset.ticker} className="dash-activity-item">
                      <div className="dash-activity-info">
                        <span className="dash-activity-name">{asset.ticker}</span>
                        <span className="tx-meta" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{asset.name.substring(0,15)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="dash-activity-amount">R$ {asset.price.toFixed(2)}</div>
                        <div className={asset.change_percent >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '0.8rem' }}>
                          {asset.change_percent >= 0 ? '▲' : '▼'} {Math.abs(asset.change_percent).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          {/* --- Goals Tracker --- */}
          <div className="card dash-sidebar-card">
            <div className="sidebar-card-header">
              <Target size={18} />
              <h3>Goal Progress</h3>
            </div>
            <div className="dash-goals-list">
              {data.goals.slice(0, 3).map(goal => (
                <div key={goal.id} className="dash-goal-item">
                  <div className="dash-goal-info">
                    <span>{goal.name} {goal.autoCalculated && <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>AUTO</span>}</span>
                    <span>{Math.round(goal.progress)}%</span>
                  </div>
                  <div className="dash-progress-bg">
                    <div className="dash-progress-fill" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
              {data.goals.length === 0 && <p className="empty-text">No active goals found.</p>}
              <Link to="/goals" className="sidebar-more">View all goals</Link>
            </div>
          </div>

          {/* --- Monthly Overview --- */}
          <div className="card dash-sidebar-card">
            <div className="sidebar-card-header">
              <TrendingUp size={18} />
              <h3>Monthly Overview</h3>
            </div>
            <div className="dash-activity-list">
              <div className="dash-activity-item">
                <div className="dash-activity-info">
                  <span className="dash-activity-name">Budget limit</span>
                </div>
                <div className="dash-activity-amount">{formatBRL(budget)}</div>
              </div>
              <div className="dash-activity-item">
                <div className="dash-activity-info">
                  <span className="dash-activity-name">Income</span>
                </div>
                <div className="dash-activity-amount text-success">{formatBRL(income)}</div>
              </div>
              <div className="dash-activity-item">
                <div className="dash-activity-info">
                  <span className="dash-activity-name">Spent</span>
                </div>
                <div className="dash-activity-amount text-danger">{formatBRL(spent)}</div>
              </div>

              <div className="dash-progress-bg" style={{ margin: '8px 0' }}>
                <div
                  className="dash-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((spent / Math.max(budget, 1)) * 100))}%`,
                    background: spent > budget ? '#ef4444' : 'var(--primary)'
                  }}
                />
              </div>

              <div className="dash-activity-item">
                <div className="dash-activity-info">
                  <span className="dash-activity-name">Forecasted</span>
                </div>
                <div className="dash-activity-amount">{formatBRL(data.forecast?.meta?.forecastedTotal || 0)}</div>
              </div>
              <div className="dash-activity-item" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '12px', marginTop: '4px' }}>
                <div className="dash-activity-info">
                  <span className="dash-activity-name">Net Balance</span>
                </div>
                <div className={`dash-activity-amount ${balance < 0 ? 'text-danger' : 'text-success'}`}>
                  {formatBRL(balance)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
