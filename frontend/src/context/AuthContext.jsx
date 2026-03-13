import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axiosClient';

const AuthContext = createContext(null);

async function fetchUser() {
  const me = await api.get('/users/me').then((r) => r.data).catch(() => null);
  return me;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const me = await fetchUser();
    setUser(me);
    return me;
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await api.post('/auth/refresh');
        const at = r.data?.accessToken;
        if (at) {
          setAccessToken(at);
          const me = await fetchUser();
          setUser(me);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, pw) => {
    const r = await api.post('/auth/login', { email, password: pw });
    const at = r.data?.accessToken;
    if (at) {
      setAccessToken(at);
      const me = await fetchUser();
      setUser(me);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
