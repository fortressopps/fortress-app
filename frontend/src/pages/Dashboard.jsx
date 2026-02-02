import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getForecast, getGoals } from '../api/coreApi';

export default function Dashboard() {
    const [forecastData, setForecastData] = useState(null);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [forecast, userGoals] = await Promise.all([
                    getForecast(),
                    getGoals()
                ]);
                setForecastData(forecast);
                setGoals(userGoals);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading neural interface...</div>;

    const { meta, forecast } = forecastData || {};
    const monthlyProjection = forecast?.previsaoMensal?.gastoTotalPrevisto || 0;

    // Format currency
    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);

    // Chart Data Preparation
    const chartData = [
        { name: 'Gasto Atual', amount: meta?.currentSpend / 100 },
        { name: 'Projeção', amount: monthlyProjection / 100 },
        { name: 'Orçamento', amount: meta?.budget / 100 },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Fortress Dashboard
                </h1>
                <p className="text-gray-400">Financial Brain Status: <span className="text-green-400">ONLINE</span></p>
            </header>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-2">Orçamento Mensal</h3>
                    <p className="text-2xl font-bold text-white">{fmt(meta?.budget || 0)}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-2">Gasto Atual</h3>
                    <p className="text-2xl font-bold text-blue-400">{fmt(meta?.currentSpend || 0)}</p>
                    <div className="w-full bg-gray-700 h-2 mt-4 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, meta?.percentage)}%` }}
                        />
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-500">{meta?.percentage}% usado</p>
                </div>

                <div className={`bg-gray-800 p-6 rounded-xl border ${forecast?.riscoLeve ? 'border-red-500' : 'border-green-500'}`}>
                    <h3 className="text-gray-400 text-sm mb-2">Projeção Final</h3>
                    <p className={`text-2xl font-bold ${forecast?.riscoLeve ? 'text-red-400' : 'text-green-400'}`}>
                        {fmt(monthlyProjection)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Confiança: {Math.round((forecast?.confidenceForecast || 0) * 100)}%
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-6">Comparativo Financeiro</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                    formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                />
                                <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-6">Tendência Semanal</h3>
                    <div className="flex items-center justify-center h-48 flex-col">
                        <span className="text-4xl mb-4">
                            {forecast?.previsaoSemanal?.tendencia === 'subida' ? '📈' :
                                forecast?.previsaoSemanal?.tendencia === 'queda' ? '📉' : '➡️'}
                        </span>
                        <p className="text-xl font-medium text-white capitalize">
                            {forecast?.previsaoSemanal?.tendencia || 'Estável'}
                        </p>
                        <p className="text-gray-400 mt-2 text-center">
                            Ritmo diário recente: {fmt((forecast?.previsaoSemanal?.ritmoProximosDias || 0) * 100)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
