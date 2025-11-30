PFS 4F — Sistema de Projeções & Forecast
Versão Enterprise v7.24 — Módulo Predictivo + Tendências + Desvios + Análise Temporal

Status: v7.24
Escopo: define como a Fortress prevê o comportamento financeiro do usuário nos próximos dias, semanas e mês; gera projeções quantitativas, riscos leves, estabilidade e desvios; alimenta Insights (4E) e Kernel (4C).

Tamanho esperado: 12.000+ caracteres
Nível: Full Enterprise (implementável imediatamente)

SUMÁRIO

Propósito

Princípios

Arquitetura do sistema

Tipos de projeções

Variáveis e features extraídas

Modelos estatísticos e heurísticos usados

Motor de previsão mensal

Motor de previsão semanal

Motor de estabilidade

Motor de desvios

Motor de risco leve

Motor de ajuste dinâmico (feedback loop)

Matriz de confiabilidade

Objeto final (JSON de forecast)

Exemplos reais

Regras de suavidade interpretativa

Pseudocódigo

Critérios de aceite

NFRs

Observabilidade

Planos por tier

Encerramento

1. PROPÓSITO DO SISTEMA DE PROJEÇÕES

O módulo 4F existe para responder três perguntas:

“Para onde seu mês está indo?”

“Esse ritmo é sustentável?”

“O que esperar dos próximos dias?”

Ele não julga, não corrige, não dita comportamento.
Ele descreve movimento e prevê cenários prováveis com neutralidade matemática.

2. PRINCÍPIOS

Previsibilidade suave, nunca alarmista

Probabilístico, nunca determinístico

Explicar movimento > prever número bruto

Sem instrução, apenas interpretação

Transparência: sempre mostrar nível de confiança

Zero ansiedade

Respeitar padrões humanos, não perfeição matemática

3. ARQUITETURA DO SISTEMA DE FORECAST

Camadas:

Data Intake — compras, recorrências, projeções anteriores

Normalization Layer — remove outliers, normaliza valores

Feature Extractor — gera variáveis (tendência, ritmo, MA3/MA10 etc.)

Forecast Core — 5 motores paralelos:

Motor Mensal

Motor Semanal

Motor de Estabilidade

Motor de Desvios

Motor de Risco Leve

Confidence Engine

Composição Final (Forecast v7.24)

Entrega → Insights (4E) → Kernel (4C)

4. TIPOS DE PROJEÇÃO
4.1 Previsão Mensal

previsão do gasto total do mês

delta vs previsto inicial

estabilidade vs volatilidade

4.2 Previsão Semanal

ritmo dos próximos 3–5 dias

tendências leves (subida / queda suave)

4.3 Previsão de Estabilidade

quão “calmo” está o padrão

desvio padrão suavizado

probabilidade de manter comportamento atual

4.4 Previsão de Desvios

risco de ultrapassar metas internas do mês

desvio entre previsão e realizado

4.5 Previsão de Risco Leve

risco leve (nunca alarmante)

“está correndo acima do seu ritmo normal”

“movimento leve de alta nas últimas 48h”

5. VARIÁVEIS PRINCIPAIS
5.1 Temporais

MA3 — média móvel 3 dias

MA10 — média móvel 10 dias

Seasonality — sazonalidade semanal

Peak detection — picos de gasto

Recorrências detectadas

5.2 Quantitativas

gasto total do mês

gasto previsto inicial

projeção diária

ritmo atual (spend/day)

delta previsto vs real

variação % (curto e longo prazo)

5.3 Estabilidade

stddev suave

moving volatility

estabilidade ponderada (0–1)

5.4 Confiabilidade

confidenceForecast = combinação de

quantidade de dados

consistência do padrão

ruído

outliers

6. MODELOS ESTATÍSTICOS
6.1 Básicos (tier Sentinel/Vanguard)

MA3

MA10

exponencial smoothing

regressão linear simples

normalização de outliers

6.2 Avançados (Legacy)

Holt-Winters adaptado

regressão fluida com pesos temporais

janela dinâmica

amortecimento de sazonalidade

clusters de comportamento do usuário

7. MOTOR DE PREVISÃO MENSAL

Cálculo:

forecast_month = (MA10 * dias_restantes) + gasto_acumulado


Ajustes:

aplicar peso maior para MA3 quando volatilidade baixa

aplicar amortização quando houver recorrência confirmada

limitar projeções absurdas com top cap = 2 * stddev histórica

Confidence:

confidence_month = 1 - volatility


O insight 4E usa esse número para decidir:

Família E (Desvio)

Família C (Tendência longa)

8. MOTOR DE PREVISÃO SEMANAL
forecast_week = MA3 * 5


para gera leitura de:

ritmo

estabilidade

micro tendência

Esse motor alimenta:

B1–B4 (Tendências curtas)

F1–F2 (Estabilidade)

9. MOTOR DE ESTABILIDADE

Estabilidade = 1 – volatilidade normalizada.

Volatilidade:

vol = stddev(normalized_purchases_last_10d) / MA10


Classificação:

0.8–1.0 → muito estável

0.6–0.79 → estável

0.4–0.59 → moderada

<0.4 → instável

Estabilidade alta permite:

reforço positivo

suavidade 1–2 no Kernel

insights de tranquilidade

10. MOTOR DE DESVIOS
desvio_pct = (realizado - previsto) / previsto * 100


Classificação:

leve: <5%

moderado: 5–12%

forte: >12%

O insight correspondente é E1, E2 ou E3.

11. MOTOR DE RISCO LEVE (NÃO-ALARMISTA)

Risco nunca é apresentado como “alerta”.

Medição:

risco = (MA3 - MA10) / MA10


Classificação:

leve (0.5%–3%)

moderado (3%–7%)

significativo (>7%)

Isso alimenta:

A1, A2, A3 (Impactos imediatos)

G1–G2 (Oportunidades suaves)

12. MOTOR DE AJUSTE DINÂMICO (FEEDBACK)

Toda vez que algo acontece diferente do previsto:

erro = realizado - forecast_diario
ajuste = erro * learning_rate


Learning rate:

0.1 Sentinel

0.25 Vanguard

0.4 Legacy

13. MATRIZ DE CONFIABILIDADE

Fatores que reduzem confiança:

alto número de outliers

baixa quantidade de dados

mês recém-iniciado

comportamento muito irregular

entrada recente no app

Confiabilidade define:

se forecast vira insight

se insight vira notificação

suavidade da mensagem

14. OBJETO FINAL DO FORECAST
{
  "mes": {
    "forecast_total": 2270.40,
    "realizado": 920.30,
    "previsto_original": 2100.00,
    "desvio_pct": 8.09,
    "confianca": 0.77
  },
  "semana": {
    "previsao": 415.70,
    "tendencia": "subida_leve",
    "confianca": 0.71
  },
  "estabilidade": {
    "score": 0.82,
    "classificacao": "muito_estavel"
  },
  "risco_leve": {
    "nivel": "moderado",
    "var_pct": 4.8
  },
  "kernel_metadata": {
    "permitir_insight": true,
    "permitir_notificacao": false,
    "suavidade_sugerida": 2
  },
  "timestamp": "2025-11-29T16:35:00Z"
}

15. EXEMPLOS REAIS (curtos)
Caso 1 — mês estável

MA10 estável

desvio <3%
Resultado: insight F1 (estabilidade), suavidade 1.

Caso 2 — subida leve

MA3 > MA10 em 2.5%
Resultado: insight B2 (tendência curta moderada).

Caso 3 — desvio real forte

desvio >12%
Resultado: insight E3 (forte), suavidade 3–4.

16. SUAVIDADE INTERPRETATIVA

O forecast nunca usa:

alerta

cuidado

urgente

você deveria

Sempre usa:

ritmo

tendência

movimento

padrão

estabilidade

17. PSEUDOCÓDIGO
onUpdate:
  features = extract()
  month = calcMonthForecast(features)
  week = calcWeekForecast(features)
  stability = calcStability(features)
  risco = calcRisk(features)
  desvio = calcDeviation(features)

  object = composeForecast(month, week, stability, risco, desvio)
  sendToInsights(object)

18. CRITÉRIOS DE ACEITE

forecast gere dados <120ms

zero instrução → só interpretação

estabilidade calculada com stddev normalizada

desvio coerente com dados reais

alto desvio → insights coerentes

reforço positivo apenas quando permitido

19. NFR

determinístico

replicável

auditável

seguro emocionalmente

20. OBSERVABILIDADE

Métricas:

forecast_latency

forecast_errors

desvio_histórico

accuracy semanal/mensal

21. LIMITES POR PLANO

Sentinel → previsões básicas
Vanguard → previsões completas
Legacy → motores avançados + sazonalidade inteligente

22. ENCERRAMENTO

O forecast v7.24 forma o “mapa cognitivo” que sustenta o 4E (Insights) e o 4C (Kernel), garantindo previsões calmas, factuais e emocionalmente seguras.