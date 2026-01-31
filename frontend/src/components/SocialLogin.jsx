import React, { useState } from 'react';

export default function SocialLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleGoogle = () => {
    setLoading(true);
    setError('');
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`;
  };
  const handleMicrosoft = () => {
    setLoading(true);
    setError('');
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/microsoft`;
  };
  return (
    <div style={{marginTop:16}}>
      <button onClick={handleGoogle} style={{marginRight:8}} disabled={loading}>Entrar com Google</button>
      <button onClick={handleMicrosoft} disabled={loading}>Entrar com Microsoft</button>
      {loading && <span style={{marginLeft:8}}>Redirecionando...</span>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
