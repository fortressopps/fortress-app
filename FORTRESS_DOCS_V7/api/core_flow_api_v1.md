# Fortress Core Flow API Reference (v1.0)
**Status:** Implementado em v7.24
**Orquestração:** Síncrona (Data -> Cognition -> Decision -> Action)
**Módulos:** Supermarket (4B), Insights (4E), Kernel (4C), Notifications (4D)

---

## 1. Visão Geral
Esta API expõe o "ciclo cognitivo" completo do Financial Brain. Ao submeter um recibo (compra), o sistema automaticamente:
1. Processa os dados financeiros (**Supermarket**).
2. Interpreta cognitivamente o evento (**Insights**).
3. Decide a relevância e permissões (**Kernel**).
4. Despacha a comunicação apropriada (**Notifications**).

---

## 2. Endpoint Principal

### `POST /supermarket/receipts/process`
Processa um recibo e retorna imediatamente o insight gerado e a decisão de notificação.

**Autenticação:** Bearer Token (JWT)

#### 2.1 Payload (Input)
```json
{
  "total": 5000,         // Valor em centavos (ex: 50.00 BRL)
  "category": "Padaria", // Nome da categoria
  "projectedTotal": 100000, // (Opcional) Orçamento mensal em centavos
  "average": 2000          // (Opcional) Média de 3 dias para calcular tendência
}
```

#### 2.2 Response (Output)
```json
{
  "success": true,
  "data": {
    "receipt": {
      "total": 5000,
      "impact_pct": 5.0 // Impacto calculado (Supermarket 4B)
    },
    "insight": {
      "tipo": "B2",
      "familia": "B",
      "relevancia": 60,
      "interpretacao": "Seu ritmo em Padaria subiu moderadamente...",
      "suavidade": 3 // Tom de voz (Insights 4E)
    },
    "decision": {
      "relevance": 60,
      "permit": true,
      "reason": "Integration Flow",
      "reinforce": false // Kernel 4C decidiu não reforçar
    },
    "notification": {
      "id": "uuid-...",
      "canaisSuggested": ["daily_console"], // Notifications 4D roteou apenas para console
      "mensagemFinal": "Seu ritmo em Padaria subiu moderadamente..."
    }
  }
}
```

---

## 3. Lógica do Fluxo (Deep Dive)

### Passo 1: Supermarket (4B)
- **Cálculo:** `computeImpactInMonth` determina quanto a compra afeta o mês.
- **Input:** 5000 cents / 100000 budget.
- **Output:** 5% de impacto.

### Passo 2: Insights (4E)
- **Cognição:** `InsightFactory` detecta a família.
- **Regra:** Impacto 5% triggers Família B (Tendência) ou A2 (Impacto Moderado).
- **Gramática:** Gera texto "Seu ritmo subiu..." via `GrammarEngine`.

### Passo 3: Kernel (4C)
- **Decisão:** `computeRelevance` avalia o insight.
- **Escala:** Impacto de 5% é escalado para relevância ~50-60.
- **Permissão:** Verifica cooldown (mock: 0) e hora (mock: sempre permitido).

### Passo 4: Notifications (4D)
- **Despacho:** `Dispatcher` roteia com base na relevância.
- **Regra:** Relevância < 70 -> Apenas Console. Relevância >= 70 -> Push.
- **Reforço:** Kernel disse `reinforce: false`, então mensagem final não tem sufixo positivo.

---

## 4. Exemplos de Comportamento

| Cenário | Compra (R$) | Impacto | Relevância | Canal |
|---|---|---|---|---|
| **Pãozinho** | 10.00 | 0.1% | Baixa (<30) | Console (Silencioso) |
| **Mercado Semanal** | 400.00 | 8.0% | Média (50) | Console (Prioritário) |
| **Celular Novo** | 5000.00 | 50.0% | Alta (>90) | **PUSH** + Console |
