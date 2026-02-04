import React, { useState, useEffect } from 'react';
import { getForecast, getGoals, getKernelState } from '../api/coreApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [balance, setBalance] = useState(8235412.90);
    const [forecast, setForecast] = useState(null);
    const [goals, setGoals] = useState([]);
    const [kernel, setKernel] = useState(null);
    const [loading, setLoading] = useState(true);

    const fmt = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

    useEffect(() => {
        const load = async () => {
            try {
                const [f, g, k] = await Promise.all([getForecast(), getGoals(), getKernelState()]);
                setForecast(f);
                setGoals(g);
                setKernel(k);
            } catch (e) {
                console.error("Kernel Sync Error", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const chartData = forecast?.history?.length > 0 ? forecast.history : [
        { name: 'Jan', value: 20 }, { name: 'Feb', value: 22 }, { name: 'Mar', value: 18 },
        { name: 'Apr', value: 25 }, { name: 'May', value: 30 }, { name: 'Jun', value: 24 },
        { name: 'Jul', value: 32 }, { name: 'Aug', value: 40 }, { name: 'Sep', value: 31 },
        { name: 'Oct', value: 29 }, { name: 'Nov', value: 33 }, { name: 'Dec', value: 35 },
    ];

    const marketData = [
        { name: 'BTC', value: '€ 73,531.09', change: '+0.58%', icon: '₿' },
        { name: 'KOSPI', value: '2,633.24', change: '+10.12%', icon: '💹' },
    ];

    const transactions = [
        { label: 'Last Market', value: fmt(balance), time: '1 hour ago' },
        { label: 'Last Market', value: fmt(balance), time: '2 days ago' },
    ];

    if (loading) return <div className="h-screen flex items-center justify-center text-charcoal font-bold tracking-widest">SYNCHRONIZING KERNEL...</div>;

    return (
        <main className="dashboard-v81 animate-entrance">
            <div className="dashboard-grid">

                {/* LEFT COLUMN: PRIMARY DATA */}
                <div className="dashboard-primary">

                    {/* Your Fortress Card */}
                    <section className="card-panel dashboard-card dashboard-card--hero">
                        <p className="dashboard-label">Your Fortress Card</p>
                        <h2 className="dashboard-balance">{fmt(balance)}</h2>
                        <div className="dashboard-hero-glow" />
                    </section>

                    {/* AI Portfolio Overview */}
                    <section className="card-panel dashboard-card">
                        <header className="dashboard-card-header">
                            <div>
                                <h3 className="dashboard-title">AI Portfolio Overview</h3>
                                <p className="dashboard-subtitle">Monthly Performance</p>
                            </div>
                        </header>
                        <div className="dashboard-chart">
                            <ResponsiveContainer>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="fortressGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#0f1116" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(255,255,255,0.08)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(229, 231, 235, 0.7)', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
                                        contentStyle={{
                                            borderRadius: '14px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: '#111827',
                                            color: '#E5E7EB',
                                            boxShadow: '0 18px 30px -12px rgba(0,0,0,0.6)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2dd4bf"
                                        strokeWidth={3}
                                        fill="url(#fortressGlow)"
                                        dot={{ r: 4, fill: '#2dd4bf', strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: '#10B981' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* AI Insights */}
                    <section className="card-panel dashboard-card">
                        <h3 className="dashboard-title">AI Insights</h3>
                        <p className="dashboard-subtitle">Latest market news and AI-driven analysis.</p>
                        <button className="dashboard-action">View Insights</button>
                    </section>
                </div>

                {/* RIGHT COLUMN: SECONDARY DATA */}
                <div className="dashboard-secondary">

                    {/* Market Data */}
                    <section className="card-panel dashboard-card">
                        <h3 className="dashboard-title">Market Data</h3>
                        <div className="dashboard-list">
                            {marketData.map((item) => (
                                <div key={item.name} className="dashboard-row">
                                    <div className="dashboard-row-main">
                                        <span className="dashboard-icon">{item.icon}</span>
                                        <p className="dashboard-row-label">{item.name}</p>
                                    </div>
                                    <div className="dashboard-row-meta">
                                        <p className="dashboard-row-value">{item.value}</p>
                                        <p className="dashboard-row-change">{item.change} ↗</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Transactions */}
                    <section className="card-panel dashboard-card">
                        <h3 className="dashboard-title">Recent Transactions</h3>
                        <div className="dashboard-list">
                            {transactions.map((item) => (
                                <div key={`${item.time}-${item.value}`} className="dashboard-row">
                                    <div className="dashboard-row-main">
                                        <span className="dashboard-avatar">X</span>
                                        <div>
                                            <p className="dashboard-row-label">{item.label}</p>
                                            <p className="dashboard-row-time">{item.time}</p>
                                        </div>
                                    </div>
                                    <p className="dashboard-row-value">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </div>
        </main>
    );
};

export default Dashboard;
