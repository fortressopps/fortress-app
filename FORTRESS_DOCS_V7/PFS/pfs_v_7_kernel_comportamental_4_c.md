PFS 4C — Kernel Comportamental

Versão: Enterprise v7.24 — Natural Flow Engine + Anti-Ruído Humano + Suavidade Cognitiva (Documento completo)

Status: r0.3 (revisado)
Escopo: define a camada comportamental que decide relevância, suavidade, prioridade, permissões de notificação, anti-ruído, reforço positivo e regras de text-generation para toda a plataforma.

Sumário (rápido)

Propósito

Princípios e guardrails

Visão geral de arquitetura

Variáveis e modelos internos

Cálculo de relevância — fórmula e exemplos

Modelo de suavidade (tone level) e mapping para UX

Natural Flow Engine — regras anti-ruído (detalhado)

Política de reforço positivo (quando e como)

Permissão de notificação — decisão completa (algoritmo)

Saída / contrato do Kernel (JSON)

Exemplos reais de inputs → outputs

Pseudocódigo e regras idempotentes

Testes, monitoração e SLOs

Atualização de textos / política de variação semântica

Rollout e feature flags

GDPR, privacidade e segurança

Lista de ACs finais e checklist de entrega

Apêndices (tabelas, thresholds, matriz de planos)

1. Propósito

O Kernel Comportamental é a camada de decisão intermediária entre o motor analítico (Financial Brain + Insights) e a superfície de UX (Notificações, Daily Console, Timeline).
Seu objetivo: garantir que somente comunicações relevantes, naturais e emocionalmente seguras cheguem ao usuário, respeitando limites cognitivos e planos comerciais.

2. Princípios e guardrails

Neutralidade emocional: nunca gerar julgamento.

Naturalidade temporal: respeitar ritmos humanos (no mínimo 72h entre elementos similares).

Determinismo: com os mesmos inputs e pesos, saída deve ser a mesma.

Idempotência: re-processar eventos não deve gerar duplicatas.

Transparência: todas decisões devem gerar metadados explicáveis (por que foi mostrada/por que foi bloqueada).

Segurança emocional: nunca reforçar ansiedade, culpa ou urgência.

Reforço factual: reforços só se baseiam em dados reais e não em heurísticas marketing-like.

3. Visão geral de arquitetura

Camadas:

Ingest — recebe eventos do Supermarket, Insights (4E), Forecast (4F).

Normalizer — padroniza timestamps, moedas, conversões de unidades (cents).

Feature extractor — calcula variáveis temporais (MA3, MA10), volatilidade, recorrência, impacto% no mês.

Decision core (Kernel) — roda regras + modelos heurísticos; aplica Natural Flow e anti-ruído; devolve metadados.

Composer — adiciona instruções de linguagem (suavidade, permissão de reforço) e encaminha ao Comms Engine (4D).

Audit & Trace — guarda input + decisão + versão do kernel para auditoria.

Observabilidade: traces OpenTelemetry, logs estruturados (pino), métricas Prometheus (queue size, decision latency, blocked_count, allowed_count).

4. Variáveis e modelos internos
Principais features calculadas

impact_cents — valor absoluto do evento.

impact_pct_month — (impact_cents / projected_month_total) * 100.

ma3_pct — variação percentual da média móvel 3 dias vs baseline.

ma10_pct — média móvel 10 dias.

volatility — stddev normalizada das últimas N entradas.

recurrence_score — número de repetições no período (escala 0..1).

novelty — quanto o item/estabelecimento é novo para o usuário.

confidence — confiança do insight (0..1) (ex.: OCR+parser+classifier combined).

user_sensitivity — valor (1..3) vindo de preferências e sinais (engagement, opted_in).

time_since_last_similar — em horas.

notifications_sent_window — quantas notificações nos últimos X dias.

Metadados

kernel_version

decision_timestamp

input_hash (para idempotência)

5. Cálculo de relevância — fórmula básica (configurável)

Base simplificada (pesos configuráveis por feature flag/env):

relevance_raw = w1 * impact_pct_month
              + w2 * abs(ma3_pct) 
              + w3 * abs(ma10_pct) 
              + w4 * recurrence_score * 100
              + w5 * (1 - confidence) * -10
              + w6 * novelty * 10


Ajustes:

aplicar saturation para evitar números extremos: relevance = sigmoid(relevance_raw / scale) * 100

penalizar eventos com baixa confiança: if confidence < 0.6 => relevance *= confidence

Exemplo de pesos iniciais (sugestão v1):

w1 = 0.5, w2 = 0.2, w3 = 0.1, w4 = 0.15, w5 = 0.05, w6 = 0.1

Notas:

Impacto de 7% do mês tende a aumentar muito a relevância.

Relevância final é 0..100. A decisão de notificar usa thresholds + cooldown rules.

6. Modelo de suavidade (tone level) e mapping UX

Suavidade é um integer 1..5 determinado pelo Kernel combinando: relevance, user_sensitivity, volatility, impact.

Mapping simples:

relevance < 25 => suavidade = 1

25 <= relevance < 45 => suavidade = 2

45 <= relevance < 70 => suavidade = 3

70 <= relevance < 85 => suavidade = 4

>=85 => suavidade = 5 (apenas quando impacto real e confiança alta)

Comportamento UX:

Nível 1: só aparece no Daily Console, não notifica.

Nível 2: pode aparecer em feed / console.

Nível 3: insight apresentado com contexto; notificação possível se cooldown ok.

Nível 4–5: notificação priorizada; reforço positivo possível se o sinal for positivo.

7. Natural Flow Engine — anti-ruído (detalhado)

Objetivo: evitar sensação de “app insistente” e manter naturalidade.

7.1 Tabela de intervalos (padrão)
Tipo	Intervalo mínimo padrão
Insight similar (alto)	72h
Insight similar (baixo)	120h
Reforço positivo	168h (7 dias)
Sugestão leve	120h (5 dias)
Tendência repetida	96h
Micro variações consolidado	≥ 4 dias
Reaparecer de mesmo tema (diferente texto)	72–120h dependendo relevância
7.2 Confirmação de padrões

Recorrência precisa de ≥3 repetições para virar insight.

Tendência de curto prazo precisa de ≥3 dias com direção alinhada.

Tendência longa: ≥10 dias.

7.3 Consolidação & agrupamento

Se N eventos similares no período P (ex.: 3 variações leves em 4 dias), o Kernel consolida para um único insight com aggregation_metadata (count, window, avg_impact).

7.4 Anti-repetição textual

O kernel armazena fingerprint textual (hash dos templates) e bloqueia reaparição do mesmo template para o mesmo usuário por 7 dias.

Quando um insight deve reaparecer, o Composer pede variação semântica via template engine (placeholders e sinônimos).

7.5 Exceptions (quando quebrar o anti-ruído)

Eventos com impacto crítico (ex.: >15% do previsto mensal) pulam cooldowns, mas ainda respeitam horário e não usam tom de alerta.

Baixa confiança => bloqueio (não forçar notificações).

8. Política de reforço positivo

Reforço positivo = finalização que aumenta leve bem-estar do usuário (sem manipulação).

8.1 Quando permitir

impact_pct_month negativo (economia) ou comportamento estável por 3+ dias

relevance na faixa 40..85 e sinal dá leitura positiva

user_opt_in_reinforcement == true ou plano com permissão (Vanguard/Legacy)

8.2 Como construir

Deve ser factual e curta (1–2 frases).

Evitar superlativos absolutos.

Ex.: “Ótimo sinal de consistência.” / “Esse ritmo tende a trazer sensação de controle.”

8.3 Limites

Máx. 1 reforço por semana.

Não usar reforço em mensagens críticas (nível 4–5) a menos que haja estabilização.

9. Permissão de notificação — algoritmo completo (pseudocódigo)
function decideNotification(input):
  features = extractFeatures(input)
  relevance = computeRelevance(features)
  suavidade = mapSuavidade(relevance, features.user_sensitivity)
  last_similar = getTimeSinceLastSimilar(user, topic)
  if relevance < MIN_RELEVANCE_THRESHOLD:
    return {permit: false, reason: "low_relevance"}
  if features.confidence < 0.6:
    return {permit: false, reason: "low_confidence"}
  # cooldown logic
  min_interval = kernelCooldownForType(topic, relevance)
  if last_similar < min_interval:
    return {permit: false, reason: "cooldown"}
  # time window
  if not isHourAllowed(now, user):
    return {permit: false, reason: "time_block"}
  # spam protection
  if notificationsThisWindow(user) >= maxAllowed(user.plan):
    return {permit: false, reason: "quota_exceeded"}
  # pass
  permit = true
  reinforced = allowReinforcement(relevance, features)
  return {
    permit: true,
    relevance: relevance,
    suavidade: suavidade,
    reinforce: reinforced,
    cooldownMin: min_interval
  }


Notas: kernelCooldownForType usa a tabela de intervalos; notificationsThisWindow respeita planos.

10. Saída / contrato do Kernel (JSON)
{
  "kernel_version": "4c-v7.24-rc3",
  "decision_timestamp": "2025-11-29T16:00:00Z",
  "permitted": true,
  "relevance": 78,
  "suavidade": 4,
  "prioridade": 8.2,
  "reinforce_allowed": true,
  "cooldown_min_hours": 96,
  "reason": "high_impact_trend_confirmed",
  "input_hash": "sha256:abcd1234",
  "trace_id": "trace-xxx",
  "explain": {
     "impact_pct_month": 6.8,
     "ma3_pct": 4.2,
     "recurrence": 0.67,
     "confidence": 0.92
  }
}

11. Exemplos reais (inputs → outputs)
Caso 1 — Compra média, sem impacto

Input: compra R$ 35, impact_pct_month=0.3, ma3_pct=0.2, confidence=0.95
Output: permitted=false (relevance 15) → apenas console.

Caso 2 — Compra grande, tendência confirmada

Input: compra R$ 420, impact_pct_month=6.5, ma3_pct=4.8, recurrence=0.5, confidence=0.9
Output: permitted=true, relevance=78, suavidade=4, reinforce_allowed=false, cooldown=96h

Caso 3 — Estabilidade positiva

Input: ma10_pct= -2.2 (queda de gasto), variabilidade baixa, confidence 0.98
Output: permitted=true, relevance=50, suavidade=2, reinforce_allowed=true (recomenda reforço positivo)

12. Pseudocódigo completo (fluxo idempotente)
onEvent(event):
  canonical = normalize(event)
  hash = sha256(canonical)
  if isProcessed(hash): return  # idempotent
  features = extractFeatures(canonical)
  decision = decideNotification(features)
  saveAudit(hash, canonical, features, decision)
  if decision.permitted:
    composer.queueMessage(user, event, decision)
  markProcessed(hash)


Idempotência: isProcessed consultará tabela kernel_processed_messages com TTL para limpezas futuras.

13. Testes, monitoração e SLOs
Testes unitários

relevância: grid tests com vários combos de features

cooldown: testes de janela (simular envio e re-check)

idempotência: reprocessar mesma mensagem e garantir sem duplicatas

Testes de integração

rodar pipelines com OCR false-positives (confidence baixo) e garantir bloqueio

simular picos e garantir consolidação

Monitoração

métricas: kernel_decision_latency, kernel_allowed_count, kernel_blocked_count, kernel_reinforce_count, kernel_cooldown_violations

alertas: se decision_latency > 150ms por 5m; se kernel_blocked_count subir >200% em 1h (possível infra ou thresholds mal calibrados)

SLOs

decisão < 100ms (p95)

idempotência 100% (teste E2E)

menos de 1% de false-block on high-confidence events (meta inicial)

14. Atualização de textos / política de variação semântica

Para evitar repetição e pareça natural:

Fingerprint de template: cada template tem id. Quando reaparecer, Composer pede variation_level (soft/medium/hard) e Kernel exige variation_level >= required (1..3) dependendo de time_since_last_similar.

Banco de micro-phrases: manter um catálogo aprovado de expressões (curadoria por equipe de UX Writing).

Regra de diversidade: não repetir mesmo slot + mesmo verbo + mesmo adjetivo em menos de 7 dias.

Fallback: se não houver variação segura, suprimir notificação (evitar forçar variação sintética que pareça falsa).

15. Rollout e feature flags

kernel_v7.24_enabled — geral

kernel_relevance_weights_v1 — pesos iniciais

kernel_natural_flow_enabled — ativa anti-ruído expandido

kernel_text_variation_enabled — ativa política de variação

Rollout: canary 1% → 10% → 50% → 100% com monitoramento de métricas de bloqueio e de satisfação (NPS integrada).

16. GDPR, privacidade e segurança

Todas decisões armazenam apenas input_hash e metadados, não texto integral de PII (quando aplicável mascarar).

TTL para logs sensíveis: 90 dias por padrão, com opção de exportação por requisição do usuário.

Controle de consentimento para reforço positivo e analytics.

17. Critérios de aceite (AC finais)

AC1: Kernel responde em <100ms p95.

AC2: Kernel bloqueia notificações quando confidence <0.6.

AC3: Kernel nunca emite mensagens com palavras da blacklist.

AC4: Idempotência garantida (mesmo evento não duplica notificações).

AC5: Variação textual respeitada (não reaparecer template em <7 dias).

AC6: Reforço positivo apenas quando condições atendidas.

AC7: Logs de decisão auditáveis e legíveis.

18. Matriz de limites por plano (resumo)
Plano	Sensibilidade (user_sensitivity)	Intervalos mínimos	Reforço
Sentinel	1	maior (120h)	não
Vanguard	1–2 (dinâmico)	padrão (72–96h)	sim (leve)
Legacy	1–3 (ajustável)	flexível	sim (completo)
19. Operação e runbook (resumo)

Se kernel_decision_latency > 150ms: escalar pods, verificar DB e queue.

Se kernel_blocked_count subir inesperadamente: rodar simulação local com payloads de 24h e comparar decisões.

Para rollback: desativar feature flag kernel_natural_flow_enabled e retornar a kernel_relevance_weights_v0.

20. Apêndices
A — Tabela de thresholds (resumo)

Impacto leve: 1–3%

Impacto moderado: 3–7%

Impacto forte: >7%

Desvio leve: <5%

Desvio moderado: 5–12%

Confiança aceitável: >=0.6

B — Exemplo de audit log (esquemático)
{
  "input_hash": "sha256:abcd",
  "kernel_version": "4c-v7.24-rc3",
  "decision": {...},
  "timestamp": "2025-11-29T16:00Z"
}

Encerramento

Este documento 4C (versão completa) foi projetado para ser implementável imediatamente: contém fórmulas, pseudocódigo, políticas e critérios de aceite.