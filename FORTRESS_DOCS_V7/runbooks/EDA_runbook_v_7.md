🔄 EDA-RUNBOOK v7.24 — Fortress Enterprise Edition



Compatível com: Event Catalog v7.24 • EDA Spec v7.24 • DB Runbook • Observability Blueprint

Camada: Kafka / NATS / Redis Streams / EventBus Interno

Objetivos: Integridade → Ordem → Idempotência → Consistência → Continuidade



1\. PROPÓSITO



Este runbook define diagnóstico, operação, recuperação, rollback e resposta a incidentes para a arquitetura orientada a eventos Fortress.



Ele cobre:



Event Bus Core



Topics/Streams



Outbox Pattern



Event Store



Projeções



DLQ



Retention \& Ordering



Idempotência



Schemas e Versionamento



Consumidores e Producers



2\. SINTOMAS DE FALHAS

2.1 Técnicos



Lag crescente (consumer groups atrasando)



DLQ aumentando



Eventos duplicados



Eventos fora de ordem



Consumidores offline



Falha em commit de offsets



Producers desconectando / buffer travado



Rebalanceamento constante



2.2 Semânticos



Eventos sem consumidor



Payloads inválidos (schema mismatch)



Idempotência quebrada



Ordem temporal violada



Consumidores processando eventos inválidos



Schemas incompatíveis entre serviços



Projeções inconsistentes



2.3 Operacionais



Topic perto do limite de retention



Partições desequilibradas



Throughput abaixo do baseline



Falhas de serialização/deserialização



Retries estourando para o mesmo evento



3\. DETECÇÃO (N0–N4)

N0 — Automático



Monitoramento de lag por consumer group



Falha de commit de offset



Alertas de erro no consumer



Outbox stuck > 5 min



DLQ gerando novos eventos



N1 — Sintomas Estruturais



Aumento lento e constante de lag



Crescimento anormal de DLQ



Eventos fora de ordem detectados



Duplicação detectada pelo mesmo consumer



N2 — Análise Profunda



Verificação de ordenação temporal



Idempotência quebrada



Inconsistência entre projections



Schema incompatível sendo publicado



N3 — Falha Operacional



Falha de partitions



Falha de consumers críticos



Rebalanceamento infinito



Configuração incorreta de batch ou commit



N4 — Crítico



Perda de eventos



Corrupção do event stream



Indisponibilidade completa do Bus



Vazamento de events sensíveis



Falha completa do event store



4\. DIAGNÓSTICO v7 (SQL + Queries + Checks)

4.1 Eventos pendentes no Outbox

SELECT event\_type, COUNT(\*) AS pendentes

FROM events\_outbox

WHERE status = 'pending'

AND created\_at < NOW() - INTERVAL '5 minutes'

GROUP BY event\_type;



4.2 Análise de DLQ

SELECT event\_type, error\_reason, COUNT(\*)

FROM event\_dlq

WHERE created\_at > NOW() - INTERVAL '1 hour'

GROUP BY event\_type, error\_reason;



4.3 Eventos duplicados (mesma chave)

SELECT event\_key, COUNT(\*) 

FROM event\_store

GROUP BY event\_key

HAVING COUNT(\*) > 1;



4.4 Auditoria de ordenação

SELECT event\_type, created\_at, LAG(created\_at)

&nbsp; OVER (PARTITION BY aggregate\_id ORDER BY created\_at)

FROM event\_store;



4.5 Verificar retenção

-- Kafka example

kafka-topics.sh --describe --topic events.main



5\. RECUPERAÇÃO AUTOMÁTICA (N0)



Executada pelo próprio sistema:



Retry exponencial de eventos falhos



Reprocessamento automático da DLQ



Rebalanceamento de consumers



Recriação automática de conexões



Fallback para processamento síncrono



Retry de offsets travados



Reconstrução automática de projeções



Replay parcial da janela de eventos



Repopulação de caches



6\. RECUPERAÇÃO ORIENTADA (N1)



Checklist direto:



A DLQ está sendo processada?



Consumers estão healthy?



O lag está reduzindo?



Há eventos fora de ordem?



Idempotência está ativa?



Algum consumer está preso?



Há rebalanceamento em loop?



Retention insuficiente?



Mais partições necessárias?



7\. RECUPERAÇÃO TÉCNICA (N2)



Para engenharia:



Corrigir schemas quebrados



Validar com Event Catalog



Verificar versionamento (compatibilidade para trás)



Migrar payload problemático



Ajustar consumidores



Batch size



Intervalo de commit



Modo de auto.offset.reset



Max.poll.interval.ms



Resolver problemas de ordenação



Recriar keying



Rebalancear partições



Forçar ordering por aggregate



Debug de serialização



Verificar header de schema



Ajustar Avro/JSON/Proto



Idempotência



Regenerar chave idempotente



Atualizar store de dedupe



8\. AÇÃO SRE (N3)



Ações mais complexas:



Scaling de partitions



Redistribuição de consumidores



Reconfiguração de retention policies



Elevação de throughput



Otimização de batch processing



Migração de topics



Rebuild total de projeções



Failover de EventBus



Fluxo:



Problema → Mitigação → Corrigir → Validar → Estabilizar



9\. INCIDENTE CRÍTICO (N4)

Casos



Perda massiva de eventos



Corrupção de stream



Vazamento de eventos sensíveis



Falha total do EDA



Falha do event store



DLQ infinita + eventos críticos perdidos



Procedimento oficial



Congelar publicação



Pausar consumers



Ativar event store backup



Restaurar a partir do último offset válido



Reprocessar eventos críticos manualmente



Validar consistência cross-service



Reabilitar publicação



Rodar reconciliação sistêmica



Documentar Post-Mortem v7.24



10\. CHECKLISTS OFICIAIS

Diário



Lag < 1.000



DLQ vazia



Todos consumers ativos



Ordem temporal preservada



Offsets atualizados



Sem warnings de serialização



Throughput na baseline



Por Release



Schemas compatíveis



Consumers registrados



DLQ handlers implementados



Idempotência testada



Replay testado



Outbox saudável



Semanal



Teste de replay em ambiente isolado



Validação de compatibilidade de schemas



Teste de velocidade de consumers



Teste de retention



11\. INDICADORES (KPIs)

KPI	Meta

Event Lag	< 1 minuto

DLQ Size	0 eventos

Event Loss Rate	0%

Consumer Availability	> 99.9%

Ordering Violations	0

Duplicate Events	< 0.001%

Retry Success Rate	> 99%

12\. PLAYBOOK DE ROLLBACK



Pausar Consumers



Reverter schema para versão anterior



Resetar offsets para posição segura



Reprocessar janela afetada



Validar projeções



Revalidar integridade cross-service



Reativar consumers



Monitorar lag por 30 min



13\. BLOQUEIO DE EMERGÊNCIA



Modo síncrono only



Pausar consumers



Event logging sem processamento



Publicação somente para eventos críticos



Suspender outbox



Desabilitar DLQ temporariamente



Ativar auditoria ampliada



Fluxo:



Erro crítico →

&nbsp;  Pausa total →

&nbsp;     Preservar estado →

&nbsp;        Restaurar stream →

&nbsp;           Reprocessar →

&nbsp;              Reabrir



14\. DIAGRAMAS (ASCII)

14.1 Pipeline de eventos

Producer → Outbox → EventBus → Consumer → Projection → Cache → API



14.2 Ciclo de recuperação

\[Falha] → \[Detecção N0] → \[N1 Checks]

&nbsp;        → N2 Technical → N3 SRE → N4 Critical

&nbsp;               → Estabilização → OK

