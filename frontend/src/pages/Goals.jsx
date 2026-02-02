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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createGoal({
        ...newGoal,
        value: Math.round(parseFloat(newGoal.value) * 100) // to cents
      });
      setShowModal(false);
      setNewGoal({ name: '', value: '', periodicity: 'MONTHLY' });
      fetchGoals();
    } catch (err) {
      alert('Failed to create goal');
    }
  };

  const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <header>
          <h1 className="text-3xl font-bold text-white">Metas Financeiras</h1>
          <p className="text-gray-400">Defina limites mensais e semanais.</p>
        </header>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{goal.name}</h3>
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                    {goal.periodicity}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Meta</p>
                  <p className="font-bold text-white">{fmt(goal.value)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progresso</span>
                  <span className={`${goal.progress > 80 ? 'text-red-400' : 'text-green-400'}`}>
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${goal.progress > 90 ? 'bg-red-500' : goal.progress > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min(100, goal.progress)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500">Nenhuma meta definida ainda.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Criar Nova Meta</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Nome</label>
                <input
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                  value={newGoal.name}
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Valor (R$)</label>
                <input
                  required
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                  value={newGoal.value}
                  onChange={e => setNewGoal({ ...newGoal, value: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Periodicidade</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                  value={newGoal.periodicity}
                  onChange={e => setNewGoal({ ...newGoal, periodicity: e.target.value })}
                >
                  <option value="MONTHLY">Mensal</option>
                  <option value="WEEKLY">Semanal</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
