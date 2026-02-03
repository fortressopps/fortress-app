import React, { useState, useEffect } from 'react';
import { getForecast, getGoals, getKernelState } from '../api/coreApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
        { name: 'Jan', val: 20 }, { name: 'Feb', val: 22 }, { name: 'Mar', val: 18 },
        { name: 'Apr', val: 25 }, { name: 'May', val: 30 }, { name: 'Jun', val: 24 },
        { name: 'Jul', val: 32 }, { name: 'Aug', val: 40 }, { name: 'Sep', val: 31 },
        { name: 'Oct', val: 29 }, { name: 'Nov', val: 33 }, { name: 'Dec', val: 35 },
    ];

    if (loading) return <div className="h-screen flex items-center justify-center text-charcoal font-bold tracking-widest">SYNCHRONIZING KERNEL...</div>;

    return (
        <main className="dashboard-v81 p-8 pt-24 ml-0 lg:ml-[240px]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-entrance">

                {/* LEFT COLUMN: PRIMARY DATA */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Your Fortress Card */}
                    <section className="card-panel p-10 flex flex-col justify-between h-56">
                        <div>
                            <h3 className="text-mute text-sm font-semibold mb-6">Your Fortress Card</h3>
                            <h2 className="text-5xl font-bold text-forest-green tracking-tight">
                                {fmt(balance)}
                            </h2>
                        </div>
                    </section>

                    {/* AI Portfolio Overview */}
                    <section className="card-panel p-8">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-charcoal text-lg font-bold">AI Portfolio Overview</h3>
                                <p className="text-mute text-xs">Monthly Performance</p>
                            </div>
                        </header>
                        <div className="h-72 w-full">
                            <ResponsiveContainer>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-mute)', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'var(--emerald-surface)' }}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}
                                    />
                                    <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 7 ? 'var(--emerald-primary)' : 'var(--neon-accent)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* AI Insights */}
                    <section className="card-panel p-8">
                        <h3 className="text-charcoal text-lg font-bold mb-2">AI Insights</h3>
                        <p className="text-mute text-sm mb-6">Latest market news and AI-driven analysis.</p>
                        <button className="bg-forest-green text-white px-8 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all">
                            View Insights
                        </button>
                    </section>
                </div>

                {/* RIGHT COLUMN: SECONDARY DATA */}
                <div className="space-y-8">

                    {/* Market Data */}
                    <section className="card-panel p-8">
                        <h3 className="text-charcoal text-md font-bold mb-8">Market Data</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">₿</span>
                                    <div>
                                        <p className="text-sm font-bold">BTC</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">€ 73,531.09</p>
                                    <p className="text-[10px] text-forest-green font-bold">+0.58% ↗</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">💹</span>
                                    <div>
                                        <p className="text-sm font-bold">KOSPI</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">2,633.24</p>
                                    <p className="text-[10px] text-forest-green font-bold">+10.12% ↗</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Transactions */}
                    <section className="card-panel p-8">
                        <h3 className="text-charcoal text-md font-bold mb-8">Recent Transactions</h3>
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-forest-green flex items-center justify-center text-white text-xs">X</div>
                                        <div>
                                            <p className="text-xs font-bold">Last Market</p>
                                            <p className="text-[10px] text-mute">{i} hour ago</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold">{fmt(balance)}</p>
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
