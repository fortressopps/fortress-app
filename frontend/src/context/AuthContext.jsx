import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken } from "../api/axiosClient";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await api.post("/auth/refresh");
        const at = r.data?.accessToken;
        if (at) {
          setAccessToken(at);
          const me = await api
            .get("/users/me")
            .then((r) => r.data)
            .catch(() => null);
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
    const r = await api.post("/auth/login", { email, password: pw });
    const at = r.data?.accessToken;
    if (at) {
      setAccessToken(at);
      const me = await api
        .get("/users/me")
        .then((r) => r.data)
        .catch(() => null);
      setUser(me);
      return true;
    }
    return false;
  };
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setAccessToken(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
