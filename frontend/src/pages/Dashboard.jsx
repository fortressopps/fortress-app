import React from 'react';
import { useAuth } from '../context/AuthContext';
export default function Dashboard(){ const {user,logout}=useAuth(); return (<main><h2>Dashboard</h2><div>Welcome {user?.email||'user'}</div><button onClick={logout}>Logout</button></main>); }
