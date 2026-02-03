import React, { useState, useEffect } from 'react';
import { getKernelState } from '../api/coreApi';

const Intelligence = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getKernelState();
                setData(result);
            } catch (error) {
                console.error("Failed to sync neural engine", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-silver-mute font-medium tracking-[0.3em] uppercase animate-pulse">Sincronização Neural...</div>
        </div>
    );

    const { weights, persona, flow } = data || {};

    const weightMap = weights ? [
        { label: 'Impacto Mensal (w1)', weight: Math.round(weights.w1 * 100) },
        { label: 'MA3 / Frequência (w2)', weight: Math.round(weights.w2 * 100) },
        { label: 'Urgência Categórica (w3)', weight: Math.round(weights.w3 * 100) },
        { label: 'Conflito de Metas (w4)', weight: Math.round(weights.w4 * 100) },
        { label: 'Confiança do Kernel (w5)', weight: Math.round(weights.w5 * 100) },
    ] : [];

    const personaLabels = {
        'A': 'Evitação Cognitiva',
        'B': 'Disciplina Estratégica',
        'C': 'Fluidez Emocional',
        'D': 'Minimalismo Vigilante'
    };

    return (
        <div className="space-y-16 max-w-7xl mx-auto pb-20 p-8">
            <header className="space-y-1 opacity-0 animate-entrance">
                <h1 className="text-charcoal text-2xl font-bold tracking-tight">Intelligence Engine v8.1</h1>
                <p className="text-mute text-sm">Transparência analítica e auditoria de consciência financeira.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Persona Card */}
                <div className="lg:col-span-2 card-panel p-12 opacity-0 animate-entrance group transition-all duration-700">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-bold tracking-[0.3em] text-forest-green mb-12 uppercase">Persona Audit</h3>
                        <div className="flex flex-col md:flex-row items-center gap-14">
                            <div className="w-36 h-36 rounded-full card-panel flex items-center justify-center text-6xl bg-emerald-surface">
                                {persona.detectedPersona === 'C' ? '⚔️' : persona.detectedPersona === 'A' ? '🛡️' : '⚖️'}
                            </div>
                            <div className="flex-1 space-y-8">
                                <p className="text-5xl font-bold tracking-tighter text-charcoal">
                                    {personaLabels[persona.detectedPersona] || 'Vanguarda'}
                                </p>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 bg-surface border border-border-light rounded-3xl">
                                        <span className="text-[10px] text-mute block uppercase tracking-[0.2em] mb-2 font-bold">Impacto Permitido</span>
                                        <span className="text-forest-green font-bold text-xl tracking-tight">{persona.maxImpactPermitted}%</span>
                                    </div>
                                    <div className="p-6 bg-surface border border-border-light rounded-3xl">
                                        <span className="text-[10px] text-mute block uppercase tracking-[0.2em] mb-2 font-bold">Suavidade Alvo</span>
                                        <span className="text-charcoal font-bold text-xl tracking-tight">
                                            {persona.recommendedSuavidade >= 4 ? 'MÁXIMA' : persona.recommendedSuavidade >= 3 ? 'MÉDIA' : 'BAIXA'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-mute leading-[1.8] font-medium italic">
                                    "{persona.cognitiveWarning || "O sistema opera em modo de vigilância ativa para proteção do seu patrimônio."}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weights Card */}
                <div className="card-panel p-12 opacity-0 animate-entrance stagger-1">
                    <h3 className="text-[10px] font-bold tracking-[0.3em] text-charcoal mb-10 uppercase">Pesos Neurais</h3>
                    <div className="space-y-10">
                        {weightMap.map((w, idx) => (
                            <div key={w.label} className="space-y-4">
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.2em]">
                                    <span className="text-mute">{w.label}</span>
                                    <span className="text-charcoal">{w.weight}%</span>
                                </div>
                                <div className="h-1 bg-surface rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-forest-green transition-all duration-[2s] ease-out"
                                        style={{ width: `${Math.min(100, w.weight)}%`, transitionDelay: `${idx * 0.1}s` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Natural Flow Status */}
            <div className="card-panel p-12 opacity-0 animate-entrance stagger-2">
                <div className="flex justify-between items-center mb-12">
                    <h3 className="text-[10px] font-bold tracking-[0.3em] text-charcoal uppercase">Fluxo Natural (PFS 4D §8)</h3>
                    <div className="px-6 py-1.5 bg-emerald-surface border border-emerald-primary/10 rounded-full text-forest-green text-[10px] font-bold tracking-[0.2em] uppercase">
                        Antiruído Ativo
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-sm text-mute font-medium leading-[1.8]">O motor anti-ruído garante que você receba apenas os insights mais críticos, respeitando intervalos cognitivos para decisões precisas e filtragem estratégica.</p>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.2em]">
                                <span className="text-mute">Próximo Intervalo</span>
                                <span className="text-forest-green font-bold">Disponível Agora</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <div className="h-full bg-forest-green w-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-8 bg-surface border border-border-light rounded-[32px] text-center">
                            <span className="text-[10px] text-mute block mb-3 uppercase tracking-[0.3em] font-bold">Cooldown</span>
                            <span className="text-4xl font-bold text-charcoal tracking-tighter">00:00:00</span>
                        </div>
                        <div className="p-8 bg-surface border border-border-light rounded-[32px] text-center">
                            <span className="text-[10px] text-mute block mb-3 uppercase tracking-[0.3em] font-bold">Insights Today</span>
                            <span className="text-4xl font-bold text-charcoal tracking-tighter">{flow.history?.length || 0}/2</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intelligence;
