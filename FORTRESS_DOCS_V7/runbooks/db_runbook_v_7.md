🛢️ DB RUNBOOK v7.24



Fortress Enterprise Edition

Operational \& Recovery Playbook — Database Layer



Status: Estável

Compatível com: Data Model Spec v7.24, EDA v7.24, API v7.24, Observability v7.24

Pilares: Segurança • Integridade • Resiliência • Continuidade



1\. PROPÓSITO



Este documento define operações, diagnóstico, monitoramento, recuperação, rollback e resposta a incidentes para a camada de persistência:



PostgreSQL 14+



Redis (Cache + Rate Limit)



Blob Storage (MinIO/S3)



Outbox \& Event Store



TimescaleDB (se habilitado)



Objetivos



Detectar falhas antes que impactem o usuário



Garantir integridade do modelo de dados



Recuperar sistema sem perda financeira



Dar diretrizes para SRE, Engenharia e DataOps



Seguir metodologia N0 → N4 oficial da Fortress



2\. ESCOPO DO SISTEMA

2.1 Componentes cobertos



Core Database (transactions, accounts, ledger)



Read models / projections



Outbox events



Search indexes



Redis cache



Backup/PITR



Replicação síncrona e assíncrona



Particionamento e arquivamento



3\. SINTOMAS DE FALHAS

3.1 Técnicos



Latência > 200 ms p95



Deadlocks frequentes



max\_connections no limite



CPU > 80% por 5 min



Replicação atrasada > 30s



WAL crescendo sem controle



Disco < 15%



3.2 Integridade de Dados



Saldos divergentes (transactions vs accounts.balance)



Duplicidade no events\_outbox



Inconsistência em read models



Corrupção em JSONB



Índices fragmentados > 30%



Partições estourando (range inadequado)



4\. DETECÇÃO OFICIAL (N0–N4)

N0 — Automático



Slow query monitor



Redis error-ratio



Blob retrieval failure



WAL growth



N1 — Sinais Estruturais



Deadlocks



Replicação lenta



Índices degradados



N2 — Análise de Causa



Query plans



Estatísticas desatualizadas



Erros de cardinalidade



N3 — Falhas Operacionais



Pooling saturado



Particionamento incorreto



Falhas de migração



N4 — Crítico



Perda de dados



Corrupção



Indisponibilidade total



Falha de integridade financeira



5\. DIAGNÓSTICO TÉCNICO (v7.24)

5.1 Consultas longas

SELECT pid, NOW() - query\_start AS duration, query

FROM pg\_stat\_activity

WHERE state = 'active'

AND NOW() - query\_start > '200ms'::interval;



5.2 Replicação

SELECT client\_addr, sync\_state,

pg\_wal\_lsn\_diff(pg\_current\_wal\_lsn(), replay\_lsn) AS lag\_bytes

FROM pg\_stat\_replication;



5.3 Deadlocks

SELECT \* FROM pg\_stat\_database\_conflicts;



5.4 Estatísticas

SELECT relname, n\_dead\_tup, n\_live\_tup, last\_vacuum, last\_analyze

FROM pg\_stat\_user\_tables

ORDER BY n\_dead\_tup DESC;



5.5 Fragmentação de índices

SELECT

&nbsp;   schemaname, relname,

&nbsp;   idx\_scan, idx\_tup\_read, idx\_tup\_fetch

FROM pg\_stat\_user\_indexes;



6\. RECUPERAÇÃO AUTOMÁTICA (N0)



Ações executadas pelo sistema:



Kill automático de queries > 5 minutos



Rebuild automático de índices fragmentados



Failover do read-replica



Vacuum agressivo em tabelas críticas



Limpeza de sessões idle



Reconstrução automática de projeções inconsistentes



Reprocessamento de outbox duplicado



7\. RECUPERAÇÃO GUIADA (N1)



Checklist imediato:



Verificar conexões ativas



Validar replicação



Executar VACUUM ANALYZE



Identificar queries lentas



Rebuild de índices problemáticos



Limpar cache Redis



Revalidar projeções (read models)



8\. RECUPERAÇÃO TÉCNICA (N2)



Aprofundamento técnico:



Revisão de query plans



Corrigir cardinalidade incorreta



Criar índices faltantes



Corrigir queries N+1



Resolver deadlocks estruturais



Ajustar parâmetros (work\_mem, shared\_buffers, etc.)



9\. AÇÃO SRE (N3)



Ações estruturais:



Scale vertical (CPU/RAM)



Scale horizontal (shards/replicas)



Reconfiguração de poolings (PGbouncer)



Particionamento emergencial



Migração de dados crítica



Reindexação total



Arquivamento de partições antigas



Fluxo de decisão:



Sintoma → Classificação (N1/N2/N3) → Ação SRE → Validação → Estabilização



10\. INCIDENTE CRÍTICO (N4)

Casos:



Perda de dados transacionais



Corrupção



Vazamento de PII



Falha de consistência financeira



Indisponibilidade total



Falha de restore



Procedimento Oficial:



Congelar writes



Ativar modo emergencia (read-only)



Selecionar backup PITR



Restaurar snapshot consistente



Validar:



ledger



saldos



projections



eventos



Reexecutar Forecast \& Reconciliation



Documentar no Post-Mortem



11\. CHECKLISTS OFICIAIS

Diário



Latência p95 < 200ms



Replication lag < 1MB



Deadlocks = 0



Cache hit ratio > 95%



WAL dentro do limite



Disco > 20%



Semanal



Índices revisados



Partições criadas



Estatísticas atualizadas



Query plans verificados



Outbox limpo



Rebuild de projeções lento



Mensal



Restore-test de backup



Reindexação completa



Validação do particionamento



Validação financeira total



12\. KPIs OFICIAIS

KPI	Meta

Latência p95	< 200 ms

Cache hit ratio	> 95%

Replication lag	< 1 MB

WAL Growth	Controlado

Connection usage	< 80%

Deadlocks	0

Rebuild time	< 10 min

13\. PLAYBOOK DE ROLLBACK



Identificar transação problemática



Executar compensações



Reconciliar saldos



Revalidar forecasts



Reemitir eventos



Recalcular projeções



Validar ledger final



Script base de reconciliação

SELECT account\_id, SUM(amount) AS calc\_balance

FROM transactions

GROUP BY account\_id;



14\. BLOQUEIO DE EMERGÊNCIA



Modo read-only



Pausar jobs batch



Interromper processamento EDA



Forçar consistência de cache



Liberar somente serviços essenciais



Fluxo:



Detectou anomalia →

&nbsp;  Congela writes →

&nbsp;     Valida integridade →

&nbsp;        Corrige problema →

&nbsp;           Reabre writes



15\. DIAGRAMAS

15.1 Fluxo de detecção → estabilização

\[Sintoma] 

&nbsp;  → \[Classificação N0–N4]

&nbsp;     → \[Ação Automática]

&nbsp;        → (ok?) → \[Resolver]

&nbsp;                   ↳Caso N3/N4 → SRE



15.2 Ciclo de integridade financeira

\[Transactions] → \[Ledger] → \[Balance] → \[Forecast] → \[Reports]

&nbsp;        ↑\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_Validação\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_↑

