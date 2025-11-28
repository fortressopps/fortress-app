import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import App from '../App';
function Protected({ children }){
  const {user,loading} = useAuth();
  if(loading) return <div>Loading...</div>;
  if(!user) return <Navigate to="/login" />;
  return children;
}
export default function Router(){
  return (<BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Protected><Dashboard/></Protected>} />
    <Route path="*" element={<App/>} />
  </Routes></AuthProvider></BrowserRouter>);
}
