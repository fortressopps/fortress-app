import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const nav = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setAccessToken(token);
      nav("/app");
    } else {
      nav("/login");
    }
  }, [nav]);

  return <div>Autenticando...</div>;
}
