// Fortress v7.24 — Formulário de Meta Financeira
import React from 'react';

export default function GoalForm({ onSubmit }) {
  // TODO: Implementar formulário controlado
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <input type="text" placeholder="Nome da meta" required />
      <input type="number" placeholder="Valor" min={1} required />
      <select required>
        <option value="MONTHLY">Mensal</option>
        <option value="WEEKLY">Semanal</option>
      </select>
      <button type="submit">Criar Meta</button>
    </form>
  );
}
