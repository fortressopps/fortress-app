import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
export default function Login(){ const [email,setEmail]=useState('ops@fortress.local'); const [pw,setPw]=useState('devpass'); const auth=useAuth(); const nav=useNavigate();
  const submit=async e=>{ e.preventDefault(); const ok=await auth.login(email,pw); if(ok) nav('/'); else alert('fail'); };
  return (<main><h2>Login</h2><form onSubmit={submit}><input value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" value={pw} onChange={e=>setPw(e.target.value)}/><button>Login</button></form></main>);
}
