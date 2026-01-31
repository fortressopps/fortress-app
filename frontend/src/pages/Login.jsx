import React, { useState } from 'react';
import '../styles/messages.css';
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
    if (ok) nav('/app');
    else setError('Credenciais inválidas');
  };

  return (
    <main>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
        <button>Login</button>
      </form>
      <div style={{marginTop:12}}>
        <a href="/register">Não tem conta? Registre-se</a>
        <div style={{marginTop:16}}>
          {require('../components/SocialLogin').default()}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </main>
  );
}
