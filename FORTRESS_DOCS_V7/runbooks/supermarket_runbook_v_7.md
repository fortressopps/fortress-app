🛒 SUPERMARKET-RUNBOOK v7.24 — FORTRESS ENTERPRISE EDITION



OCR Pipeline • Draft Management • Purchase Events • Categorização Financeira

Status: Estável • Criticidade: P3–P4 (Fonte primária dos dados financeiros)

Compatível com: Financial v7.24 • EDA v7.24 • DB v7 • Forecast 4F • IAM • Privacy



1\. PROPÓSITO



Este runbook define todo o funcionamento operacional, detecção, resposta, recuperação e melhoria contínua do pipeline de supermercado, responsável por:



OCR (scan → text → parse)



Draft Management (estrutura intermediária antes da conversão em transação financeira)



Categorização e enriquecimento financeiro



Geração de eventos:



purchase.scanned



purchase.parsed



purchase.categorized



purchase.confirmed (gera transação financeira)



É o principal fornecedor de dados para:



Forecast financeiro



Insights



Séries temporais



Conciliação



Análises de comportamento



2\. IMPACTO NO ECOSSISTEMA FORTRESS

Domínio	Impacto

Financeiro	80% de todas as transações começam aqui

EDA	Gera os principais eventos purchase.\*

Forecast	Erros de OCR → previsões imprecisas

Insights	Categorização ruim gera insights ruins

UX	É a experiência central de vários usuários

DB	É origem massiva de gravações



Por isso este pipeline possui criticidade P3/P4.



3\. SINTOMAS AVANÇADOS (OCR • Draft • Categorias)

3.1 OCR



confidence < 0.6 em mais de 10% das capturas



processing\_time p95 > 30s



scanned sem parsed em 5 min



Estabelecimentos comuns produzindo textos diferentes



Diferença > 10% entre total extraído e total final



3.2 Draft Management



Drafts não confirmados > 24h



Drafts com valores divergentes



Reconhecimento errado de item/quantidade



Muitos drafts pendentes do mesmo estabelecimento



3.3 Categorização



item.uncertain > 8%



Divergência entre categoria final × categoria usuário > 15%



Estabelecimentos inconsistentes entre si



Baixa confiança persistente no mesmo item/loja



3.4 Eventos EDA



Falta de ordering



Duplicidade de purchase.confirmed



purchase.parsed sem purchase.categorized



Eventos fora da janela temporal correta



4\. DETECÇÃO (N0–N4)

N0 — Monitoramento Automático

Qualidade do OCR

SELECT 

&nbsp;   COUNT(\*) as total,

&nbsp;   AVG(confidence) as avg\_conf,

&nbsp;   COUNT(\*) FILTER (WHERE confidence < 0.6) AS low\_conf,

&nbsp;   COUNT(\*) FILTER (WHERE raw\_text IS NULL) AS no\_parse

FROM ocr\_raw

WHERE created\_at > NOW() - INTERVAL '1 hour';



Tempo de processamento

SELECT percentile\_cont(0.95) WITHIN GROUP (ORDER BY processing\_ms)

FROM ocr\_raw

WHERE created\_at > NOW() - INTERVAL '1 hour';



Itens sem categoria

SELECT COUNT(\*) AS uncategorized

FROM purchase\_items

WHERE category IS NULL

AND created\_at > NOW() - INTERVAL '1 hour';



Eventos faltantes no EDA

SELECT \*

FROM purchase\_events

WHERE event\_type='parsed'

AND NOT EXISTS (

&nbsp;   SELECT 1 FROM purchase\_events p 

&nbsp;   WHERE p.event\_type='categorized'

&nbsp;   AND p.purchase\_id = purchase\_events.purchase\_id

)

AND created\_at > NOW() - INTERVAL '15 minutes';



5\. DIAGNÓSTICO AVANÇADO

5.1 Estabelecimentos Problemáticos

SELECT establishment,

&nbsp;      COUNT(\*) AS total\_items,

&nbsp;      COUNT(\*) FILTER (WHERE confidence < 0.7) AS low\_conf,

&nbsp;      COUNT(\*) FILTER (WHERE category IS NULL) AS uncategorized

FROM purchase\_items

WHERE created\_at > NOW() - INTERVAL '7 days'

GROUP BY establishment

HAVING COUNT(\*) FILTER (WHERE confidence < 0.7)::float / COUNT(\*) > 0.1;



5.2 Divergência de Totais

SELECT purchase\_id, extracted\_total, user\_total

FROM purchase\_drafts

WHERE ABS(extracted\_total - user\_total) > 2;



5.3 Parsers corrompidos por loja

SELECT establishment, COUNT(\*) AS null\_items

FROM ocr\_raw

WHERE parsed\_items IS NULL

AND created\_at > NOW() - INTERVAL '24 hours'

GROUP BY establishment;



5.4 Categorização inconsistente

SELECT establishment, COUNT(\*)

FROM purchase\_items

WHERE category != last\_known\_category

AND confidence > 0.8

AND created\_at > NOW() - INTERVAL '30 days'

GROUP BY establishment;



6\. RECUPERAÇÃO (N0–N4)

N0 — Autocorreção (Fully Automated)



Retry inteligente OCR



Template matching por estabelecimento



Agrupamento de textos similares



Auto-categorização usando fallback heurístico



Autocorreção de preços (modelos de plausibilidade)



N1 — Intervenção do Pipeline (Operações)

./ocr-pipeline --reprocess-low-confidence --since=24h

./categorization-engine --sync-templates

./draft-cleanup --older-than=48h





Checklist:



Drafts limpos



Eventos corrigidos



Estabelecimentos em cache



Categorização estabilizada



N2 — Correção de Dados (Engenharia)



Recategorização de grandes volumes



Reconstrução de dataframes OCR → itens



Fix de modelos específicos por loja



Replay de purchase.draft.\* + purchase.categorized



Recalibração de confiança por cluster



N3 — Falha Operacional do Pipeline



Desativar OCR (modo “Manual Priority”)



Forçar categorização básica



Reconstruir históricos afetados



Reprocessar eventos do dia inteiro



Validar impacto no Financial e Forecast



N4 — Colapso de Pipeline



Ocorrências:



30%+ OCR inválido



20%+ itens sem categoria



Totais divergentes em larga escala



Corrupção no fluxo de purchase.\*



Ações:



OCR desativado



Apenas entrada manual



Hard reset de modelos



Reprocessamento completo do histórico recente



Auditoria financeira



Bloqueio temporário de insights dependentes



7\. INCIDENTES CRÍTICOS SUPERMARKET

7.1 OCR Comprometido (Modelo quebrado)



Suspender OCR imediatamente



Ativar entrada manual prioritária



Reprocessar últimos 7 dias



Rebaixar confiança global



Treinar modelo alternativo



Comunicar usuários (“Revisão de qualidade ativa”)



7.2 Categorização Inconsistente



Congelar categorização automática



Recategorização humana dos últimos 7 dias



Calibrar embeddings/heurísticas



Resetar categorias aprendidas por loja



Regerar insights afetados



Revisar impacto no Financial Engine



7.3 Eventos purchase.\* Faltando ou Duplicados



Reset do offset



Replay completo do EventStore



Reconstrução de projeções



Auditoria do ordering



Correção do ledger financeiro



Regeneração da série histórica de compras



8\. CHECKLISTS DE QUALIDADE

Diário



OCR confidence > 0.7 (90% dos scans)



Drafts confirmados > 80% em 24h



Uncertain < 5%



p95 < 15s



Eventos purchase.ordered corretos



Semanal



Novo batch de treinamento do modelo



Ajustes de templates de estabelecimentos



Feedback dos usuários aplicado



Clean-up de drafts antigos



Auditoria de divergências > R$ 2,00



Mensal



Auditoria completa de estabelecimentos



Recalibração dos modelos OCR+Categorization



Avaliação de séries temporais do supermercado



Revisão de categorias inconsistentes



9\. KPIs DE EXPERIÊNCIA \& PRECISÃO

KPI	Meta

OCR Success Rate	> 85% (confidence > 0.7)

Draft Conversion	> 75% em 24h

Categorization Accuracy	> 90%

Processing Speed	< 10s p95

Event Consistency	100% ordering correto

Uncertain Rate	< 5%

10\. BLOQUEIOS \& FALLBACKS (HARD STOPS)



Ativar quando:



OCR confidence global < 0.55



Uncertain > 10%



Eventos purchase.\* divergentes



Draft totals inconsistentes



p95 > 30s



Categorização falhando sistematicamente



Modos:



Manual Only



Desativa OCR



Usuário informa valores manualmente



Menor experiência, mas zero risco



Categorization Basic



Apenas categorias genéricas



Reduz drift e frustração



Template Only



OCR apenas para estabelecimentos conhecidos



Ignora texto desconhecido



Review Required



Todos os drafts exigem confirmação manual



11\. DIAGRAMAS (ASCII)

11.1 Pipeline de Supermercado

Camera → OCR Scan → Text Extraction → Parsing → Item Map → Categorization → Draft → User Confirm → purchase.confirmed



11.2 Níveis de Ação

N0 Detect → N1 Pipeline Ops → N2 Data Fix → N3 Failure → N4 Collapse



11.3 Fluxo de Eventos

scanned → parsed → items.created → categorized → confirmed → financial.transaction.created



12\. HISTÓRICO



v7.24 — Revisão completa



Elevação ao padrão Enterprise



Adicionado N0–N4



KPIs, SQL avançado, fluxos, incidentes



Ações para OCR, draft, categorias e eventos



Integração com Financial, EDA e Forecast



Roteiro para fallback completo

