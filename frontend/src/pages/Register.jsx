import React, { useState } from 'react';
import api from '../api/axiosClient';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <main>
      <h2>Registrar</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Senha (mín. 6)" value={form.password} onChange={handleChange} required />
        <button disabled={loading}>Registrar</button>
      </form>
      {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
      {success && <div style={{color:'green',marginTop:8}}>{success}</div>}
      <div style={{marginTop:16}}>
        {require('../components/SocialLogin').default()}
      </div>
    </main>
  );
}
