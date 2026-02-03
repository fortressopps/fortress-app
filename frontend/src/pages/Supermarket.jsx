import React, { useState, useEffect } from 'react';
import {
    getSupermarketLists,
    createSupermarketList,
    getSupermarketListById,
    updateSupermarketItem,
    processReceipt
} from '../api/coreApi';

const CATEGORIES = ['Mercado', 'Farmacia', 'Restaurante', 'Lazer', 'Eletronicos', 'Servicos'];

const Supermarket = () => {
    const [lists, setLists] = useState([]);
    const [strategy, setStrategy] = useState('MENSAL');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const data = await getSupermarketLists();
            setLists(data.items || []);
        } catch (err) {
            console.error("Lists sync failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessing(true);
        // Simulating neural processing delay for "Apple-level" feel
        setTimeout(async () => {
            try {
                // In a real app, we'd upload the file. Here we simulate a process receipt call
                const res = await processReceipt({
                    total: 12550, // R$ 125,50
                    category: 'Mercado',
                    projectedTotal: 100000
                });
                setResult(res.data);
                fetchLists();
            } catch (err) {
                console.error("Neural scan failed", err);
            } finally {
                setProcessing(false);
            }
        }, 2000);
    };

    const handleItemToggle = async (listId, item) => {
        try {
            await updateSupermarketItem(listId, item.id, {
                purchased: !item.purchased
            });
            fetchLists();
        } catch (err) {
            console.error("Item toggle failed", err);
        }
    };

    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((val || 0) / 100);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-silver-mute font-medium tracking-[0.3em] uppercase animate-pulse">Sincronizando Estratégia...</div>
        </div>
    );

    return (
        <div className="space-y-16 max-w-7xl mx-auto pb-20 p-8">
            <header className="flex justify-between items-end opacity-0 animate-entrance">
                <div className="space-y-1">
                    <h1 className="text-charcoal text-2xl font-bold tracking-tight">Estratégia de Consumo</h1>
                    <p className="text-mute text-sm">Gestão de suprimentos e otimização de fluxo MA3.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2 card-panel rounded-full text-[10px] font-bold text-mute hover:text-charcoal transition-all uppercase tracking-[0.2em]">
                        Exportar Listas
                    </button>
                    <label className="px-6 py-2 bg-forest-green text-white rounded-full text-[10px] font-bold cursor-pointer hover:scale-[1.05] transition-all uppercase tracking-[0.2em] shadow-lg">
                        + Processar Recibo
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={processing} />
                    </label>
                </div>
            </header>

            {/* Strategy Selection */}
            <div className="flex gap-4 p-1.5 card-panel rounded-full w-max bg-surface opacity-0 animate-entrance stagger-1">
                {['MENSAL', 'ESTRATÉGICA', 'EMERGÊNCIA'].map((strat) => (
                    <button
                        key={strat}
                        onClick={() => setStrategy(strat)}
                        className={`px-10 py-3 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-500 ${strategy === strat ? 'bg-forest-green text-white shadow-md' : 'text-mute hover:text-charcoal'}`}
                    >
                        {strat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Shopping Lists */}
                <div className="lg:col-span-2 space-y-8">
                    {lists.length === 0 ? (
                        <div className="card-panel p-20 text-center border-dashed opacity-0 animate-entrance">
                            <p className="text-mute text-sm italic">Nenhuma lista ativa para esta estratégia.</p>
                        </div>
                    ) : (
                        lists.map((list, idx) => (
                            <div key={list.id} className="card-panel p-10 opacity-0 animate-entrance group transition-all duration-700">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 card-panel rounded-2xl flex items-center justify-center text-xl bg-surface">
                                            🛒
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-charcoal tracking-tight group-hover:text-forest-green transition-colors">{list.name || 'Nova Lista'}</h3>
                                            <p className="text-[10px] text-mute uppercase tracking-[0.2em] font-bold">{list.items?.length || 0} Itens Vinculados</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-emerald-surface text-forest-green border border-emerald-primary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em]">
                                        Status: Nominal
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {list.items?.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-6 bg-surface border border-border-light rounded-3xl hover:bg-white transition-all">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={item.purchased}
                                                    onChange={() => handleItemToggle(list.id, item)}
                                                    className="w-5 h-5 rounded-lg border-border-light checked:bg-forest-green transition-all cursor-pointer accent-forest-green"
                                                />
                                                <span className={`text-sm font-medium ${item.purchased ? 'text-mute line-through opacity-50' : 'text-charcoal'}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-mute">
                                                {item.quantity} {item.unit || 'un'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Analysis/Results Sidebar */}
                <div className="space-y-10">
                    {processing ? (
                        <div className="card-panel p-12 text-center animate-pulse">
                            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                                🧠
                            </div>
                            <p className="text-[10px] text-charcoal font-bold tracking-[0.3em] uppercase mb-2">Neural Scan...</p>
                            <p className="text-xs text-mute">Decodificando topologia fiscal...</p>
                        </div>
                    ) : result ? (
                        <div className="card-panel p-10 border-forest-green/20 bg-emerald-surface opacity-0 animate-entrance">
                            <h3 className="text-[10px] font-bold text-forest-green tracking-[0.3em] uppercase mb-10 flex items-center gap-2">
                                <span className="w-2 h-2 bg-forest-green rounded-full"></span>
                                Auditoria de Recebimento
                            </h3>
                            <div className="space-y-8">
                                <div className="p-6 bg-white/50 rounded-3xl border border-border-light">
                                    <p className="text-[10px] text-mute uppercase tracking-[0.2em] font-bold mb-3">Estabelecimento</p>
                                    <p className="text-lg text-charcoal font-bold">{(result.receipt || result).store || 'Identificado'}</p>
                                    <p className="text-[10px] text-mute font-mono">{new Date().toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-white/50 rounded-3xl border border-border-light">
                                        <p className="text-[10px] text-mute uppercase tracking-[0.2em] font-bold mb-2">Total</p>
                                        <p className="text-xl font-bold text-charcoal tracking-tighter">{fmt((result.receipt || result).total)}</p>
                                    </div>
                                    <div className="p-6 bg-white/50 rounded-3xl border border-border-light">
                                        <p className="text-[10px] text-mute uppercase tracking-[0.2em] font-bold mb-2">Impacto</p>
                                        <p className="text-xl font-bold text-forest-green tracking-tighter">{((result.receipt || result).impact_pct || 0).toFixed(2)}%</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] text-mute uppercase tracking-[0.2em] font-bold">Impacto Cognitivo</p>
                                    <div className="p-4 bg-white/80 rounded-2xl border border-forest-green/10">
                                        <p className="text-xs text-forest-green leading-relaxed font-medium">"{(result.insight || result).interpretacao || "Processamento concluído com sucesso."}"</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full py-5 rounded-2xl bg-forest-green text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all"
                                >
                                    Arquivar Auditoria
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card-panel p-12 opacity-0 animate-entrance text-center group transition-all duration-700">
                            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-8 text-3xl group-hover:scale-110 transition-transform">
                                📜
                            </div>
                            <h4 className="text-charcoal font-bold mb-3 tracking-tight">Scanner de Recibos</h4>
                            <p className="text-xs text-mute font-medium leading-relaxed">Arraste seu cupom fiscal para sincronizar gastos com o Kernel em tempo real.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Supermarket;
