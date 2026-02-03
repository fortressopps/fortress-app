import React, { useState } from 'react';
import api from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const nav = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/register', form);
      if (res.data.ok) {
        setSuccess(res.data.message || 'Verifique seu email para ativar a conta.');
      } else {
        setError(res.data.error || 'Erro ao registrar.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="card-panel p-16 w-full max-w-md animate-entrance shadow-xl border-border-light bg-card">
        <header className="mb-12 text-center">
          <div className="brand-circle mx-auto mb-6 w-12 h-12 flex items-center justify-center bg-forest-green rounded-full">
            <div className="w-4 h-4 bg-white/90 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-charcoal tracking-tight mb-2">Nova Fortaleza</h2>
          <p className="text-mute text-xs font-medium uppercase tracking-widest">Inicie sua reconquista patrimonial v8.1</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-mute uppercase tracking-[0.2em] ml-2">Designação (Nome)</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-surface border border-border-light rounded-xl p-4 text-charcoal outline-none focus:border-forest-green transition-all text-sm"
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-mute uppercase tracking-[0.2em] ml-2">Identidade (Email)</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-surface border border-border-light rounded-xl p-4 text-charcoal outline-none focus:border-forest-green transition-all text-sm"
              placeholder="exemplo@fortress.local"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-mute uppercase tracking-[0.2em] ml-2">Assinatura (Senha)</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-surface border border-border-light rounded-xl p-4 text-charcoal outline-none focus:border-forest-green transition-all text-sm"
              placeholder="********"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 rounded-xl bg-forest-green text-white font-bold text-xs uppercase tracking-[0.2em] hover:shadow-lg active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'Processando...' : 'Protocolar Registro'}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-border-light pt-8">
          <button
            onClick={() => nav('/login')}
            className="text-mute text-[10px] font-bold uppercase tracking-[0.2em] hover:text-charcoal transition-all">
            Já possuo acesso validado
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-center font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-forest-green text-xs text-center font-bold">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
