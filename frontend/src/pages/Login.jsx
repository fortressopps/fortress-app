import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const isDev = process.env.NODE_ENV === 'development';
  const [email, setEmail] = useState(isDev ? 'ops@fortress.local' : '');
  const [pw, setPw] = useState(isDev ? 'devpass' : '');
  const [error, setError] = useState('');
  const auth = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError('');
    const ok = await auth.login(email, pw);
    if (ok) nav('/dashboard'); // Fix: redirect to dashboard
    else setError('Credenciais inválidas');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="card-panel p-16 w-full max-w-md animate-entrance shadow-xl border-border-light bg-card">
        <header className="mb-12 text-center">
          <div className="brand-circle mx-auto mb-6 w-12 h-12 flex items-center justify-center bg-forest-green rounded-full">
            <div className="w-4 h-4 bg-white/90 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-charcoal tracking-tight mb-2">Acesso Tático</h2>
          <p className="text-mute text-xs font-medium uppercase tracking-widest">Fortress Institutional v8.1</p>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-mute uppercase tracking-[0.2em] ml-2">Identidade (Email)</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-xl p-4 text-charcoal outline-none focus:border-forest-green transition-all text-sm"
              placeholder="ops@fortress.local"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-mute uppercase tracking-[0.2em] ml-2">Asssignature (Senha)</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-xl p-4 text-charcoal outline-none focus:border-forest-green transition-all text-sm"
              placeholder="********"
            />
          </div>

          <button className="w-full py-4 rounded-xl bg-forest-green text-white font-bold text-xs uppercase tracking-[0.2em] hover:shadow-lg active:scale-95 transition-all">
            Validar Protocolo
          </button>
        </form>

        <div className="mt-12 text-center border-t border-border-light pt-8">
          <button
            onClick={() => nav('/register')}
            className="text-mute text-[10px] font-bold uppercase tracking-[0.2em] hover:text-charcoal transition-all">
            Solicitar Novo Vínculo
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-center font-bold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
