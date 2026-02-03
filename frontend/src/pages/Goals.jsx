import { useState, useEffect } from 'react';
import { getGoals, createGoal } from '../api/coreApi';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', value: '', periodicity: 'MONTHLY' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      console.error("Goals sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createGoal({
        ...newGoal,
        value: Math.round(parseFloat(newGoal.value) * 100)
      });
      setShowModal(false);
      setNewGoal({ name: '', value: '', periodicity: 'MONTHLY' });
      fetchGoals();
    } catch (err) {
      alert('Falha ao registrar diretriz estratégica.');
    }
  };

  const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-silver-mute font-medium tracking-[0.3em] uppercase animate-pulse">Sincronizando Diretrizes...</div>
    </div>
  );

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-20 p-8">
      <div className="flex justify-between items-center opacity-0 animate-entrance">
        <header className="space-y-1">
          <h1 className="text-charcoal text-2xl font-bold tracking-tight">Metas de Evolução</h1>
          <p className="text-mute text-sm">Diretrizes de crescimento e travas de segurança patrimonial.</p>
        </header>
        <button
          onClick={() => setShowModal(true)}
          className="bg-forest-green text-white px-10 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-lg"
        >
          + Registrar Diretriz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {goals.map((goal, idx) => (
          <div key={goal.id} className="card-panel p-10 group opacity-0 animate-entrance">
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-charcoal tracking-tight group-hover:text-forest-green transition-colors">{goal.name}</h3>
                  <span className="text-[10px] bg-surface border border-border-light px-4 py-1 rounded-full text-mute font-bold tracking-[0.2em] uppercase">
                    {goal.periodicity === 'MONTHLY' ? 'MENSAL' : goal.periodicity === 'WEEKLY' ? 'SEMANAL' : goal.periodicity}
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] text-mute font-bold uppercase tracking-[0.3em]">Target</p>
                    <p className="font-bold text-charcoal text-3xl tracking-tighter">{fmt(goal.value)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${goal.analysis?.atRisk ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-emerald-surface text-forest-green border border-emerald-primary/20'}`}>
                      {goal.analysis?.atRisk ? '⚠️ Risco' : '✓ Nominal'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] text-mute uppercase font-bold tracking-[0.2em]">
                    <span>Progresso Patrimonial</span>
                    <span className="text-charcoal font-mono">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border-light">
                    <div
                      className={`h-full transition-all duration-[1.5s] ease-out ${goal.progress > 90 ? 'bg-red-500' : goal.progress > 60 ? 'bg-yellow-500' : 'bg-forest-green'}`}
                      style={{ width: `${Math.min(100, goal.progress)}%` }}
                    />
                  </div>
                </div>

                {goal.analysis?.deviation && (
                  <div className="pt-8 flex justify-between items-center border-t border-border-light">
                    <span className="text-[10px] text-mute uppercase tracking-[0.2em] font-bold">Desvio Estimado</span>
                    <span className={`text-xs font-mono font-bold ${goal.analysis.deviation.status === 'over' ? 'text-red-500' : 'text-forest-green'}`}>
                      {goal.analysis.deviation.deviation_pct > 0 ? '+' : ''}{goal.analysis.deviation.deviation_pct}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-24 text-center card-panel border-dashed opacity-0 animate-entrance">
            <p className="text-mute text-sm italic">Nenhuma diretriz estratégica definida para este ciclo.</p>
          </div>
        )}
      </div>

      {/* Modal: Museum-Grade Design (Light Adapted) */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-8 z-[1000] animate-entrance">
          <div className="card-panel p-16 w-full max-w-xl shadow-2xl">
            <h2 className="text-3xl font-bold text-charcoal tracking-tight mb-10">Provisionar Diretriz</h2>
            <form onSubmit={handleCreate} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-mute uppercase tracking-[0.3em] ml-2">Nome da Operação</label>
                <input
                  required
                  placeholder="Ex: Reserva Vanguard"
                  className="w-full bg-surface border border-border-light rounded-2xl p-6 text-charcoal focus:border-forest-green outline-none transition-all placeholder:text-mute/30 text-lg"
                  value={newGoal.name}
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-mute uppercase tracking-[0.3em] ml-2">Valor Alvo (R$)</label>
                  <input
                    required
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-surface border border-border-light rounded-2xl p-6 text-charcoal focus:border-forest-green outline-none transition-all placeholder:text-mute/30 text-lg"
                    value={newGoal.value}
                    onChange={e => setNewGoal({ ...newGoal, value: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-mute uppercase tracking-[0.3em] ml-2">Frequência</label>
                  <select
                    className="w-full bg-surface border border-border-light rounded-2xl p-6 text-charcoal focus:border-forest-green outline-none text-lg appearance-none cursor-pointer"
                    value={newGoal.periodicity}
                    onChange={e => setNewGoal({ ...newGoal, periodicity: e.target.value })}
                  >
                    <option value="MONTHLY">Mensal</option>
                    <option value="WEEKLY">Semanal</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-6 rounded-2xl text-mute text-[10px] font-bold uppercase tracking-[0.3em] hover:text-charcoal transition-all"
                >
                  Abortar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-6 px-12 rounded-2xl bg-forest-green text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all duration-500"
                >
                  Implementar Diretriz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
