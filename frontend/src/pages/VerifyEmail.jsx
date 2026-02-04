import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";

export default function VerifyEmail() {
  const [status, setStatus] = useState("Verificando...");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("Token ausente.");
      return;
    }
    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        if (res.data.ok) setStatus("Email verificado com sucesso!");
        else setStatus(res.data.error || "Erro ao verificar email.");
      })
      .catch(() => setStatus("Erro ao verificar email."));
  }, []);
  return (
    <main>
      <h2>Verificação de Email</h2>
      <div>{status}</div>
    </main>
  );
}
