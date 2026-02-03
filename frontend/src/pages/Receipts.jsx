import { useState } from 'react';
import { processReceipt } from '../api/coreApi';

const CATEGORIES = [
    'Mercado', 'Farmacia', 'Restaurante', 'Lazer', 'Eletronicos', 'Servicos'
];

export default function Receipts() {
    const [formData, setFormData] = useState({
        total: '',
        category: 'Mercado',
        projected: '1000'
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Amount in cents
            const data = {
                total: Math.round(parseFloat(formData.total) * 100),
                category: formData.category,
                projectedTotal: Math.round(parseFloat(formData.projected) * 100)
            };

            const response = await processReceipt(data);
            setResult(response);
        } catch (err) {
            setError('Failed to process receipt. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const InsightCard = ({ insight }) => (
        <div className="bg-purple-900/30 border border-purple-500/50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-start">
                <h4 className="text-purple-300 font-bold mb-1">Insight {insight.familia}-{insight.tipo}</h4>
                <span className="text-xs px-2 py-1 rounded bg-purple-800 text-purple-200">
                    Nível {insight.nivel}
                </span>
            </div>
            <p className="text-white text-lg font-medium">{insight.interpretacao}</p>
            <div className="mt-2 flex gap-2">
                <span className="text-xs text-purple-400">#{insight.familia}</span>
                <span className="text-xs text-purple-400">#{insight.tipo}</span>
                {insight.conflict && <span className="text-xs text-red-400 font-bold">#CONFLITO</span>}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <header className="text-center pt-8">
                <div className="inline-block px-4 py-1 rounded-full glass-surface-emerald text-xs font-bold tracking-widest text-emerald-primary mb-4">
                    CENTRAL DE INTELIGÊNCIA V7
                </div>
                <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
                    PROCESSAR COMPRA
                </h1>
                <p className="text-silver-mute max-w-md mx-auto">Sincronização manual com o Kernel de decisão.</p>
            </header>

            <div className="glass-surface p-8 rounded-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Total (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.total}
                            onChange={e => setFormData({ ...formData, total: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                        <select
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Orçamento Planejado (R$)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none"
                            value={formData.projected}
                            onChange={e => setFormData({ ...formData, projected: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Simulação de orçamento para cálculo de impacto.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold transition-all ${loading
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                            }`}
                    >
                        {loading ? 'Analisando...' : 'Processar Transação'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                    {error}
                </div>
            )}

            {result && result.success && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold text-white">Análise do Kernel</h2>

                    {/* Card de Impacto */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <span className="text-sm text-gray-400">Impacto Mensal</span>
                            <p className="text-xl font-bold text-white">
                                {result.data.receipt.impact_pct.toFixed(1)}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg ${result.data.decision.permit ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                            <span className="text-sm text-gray-400">Decisão Kernel</span>
                            <p className={`text-xl font-bold ${result.data.decision.permit ? 'text-green-400' : 'text-red-400'}`}>
                                {result.data.decision.permit ? 'APROVADO' : 'BLOQUEADO'}
                            </p>
                            <span className="text-xs opacity-75">Relevância: {result.data.decision.relevance}</span>
                        </div>
                    </div>

                    {/* Card de Insight */}
                    {result.data.insight && (
                        <div className="glass-surface-emerald p-1 rounded-xl">
                            <InsightCard insight={result.data.insight} />
                        </div>
                    )}

                    {/* Canais */}
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h4 className="text-gray-400 text-sm mb-2">Canais Ativados</h4>
                        <div className="flex gap-2">
                            {result.data.notification.canaisSuggested.map(channel => (
                                <span key={channel} className="px-3 py-1 bg-gray-700 rounded-full text-sm capitalize">
                                    {channel}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
