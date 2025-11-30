Event Catalog v7

Fortress v7.24 — Enterprise Edition

Catálogo Completo de Eventos do Sistema (Domínio, Semântica, Fluxos, Estrutura, Regras e Exemplos Funcionais)

1\. PROPÓSITO DO DOCUMENTO



Este documento define todos os eventos oficiais do ecossistema Fortress, incluindo:



nome oficial do evento



significado funcional



origem (módulo que o emite)



destino (módulo que o consome)



categoria



estrutura conceitual do payload



fluxo semântico



regras de idempotência



casos de uso



exemplos reais



relação com Kernel (4C), Insights (4E) e Forecast (4F)



O Event Catalog complementa o Glossário (Doc 5) e serve como camada fundamental para arquitetura, APIs, modeling e IA (Cursor).



2\. FILOSOFIA DO EVENT SYSTEM v7.24



O Fortress é um sistema event-driven cognitivamente interpretativo.



Regras fundamentais dos eventos:



Todo evento descreve um fato, nunca uma instrução.



Todo evento é imutável.



Todo evento tem significado humano e impacto cognitivo.



Eventos não carregam tom emocional — apenas dados.



Eventos podem gerar insights, mas não precisam.



Todo evento é auditável, rastreável e idempotente.



Eventos são consumidos pelo Financial Brain, Forecast, Kernel ou Notificações.



3\. CATEGORIAS OFICIAIS DE EVENTOS



As categorias padronizam o ecossistema.



Categoria	Significado

finance.purchase	Registro de compra

finance.adjustment	Ajuste de dados históricos

forecast.update	Atualização de projeções

forecast.stability	Mudança de estabilidade

behavior.pattern	Padrões detectados

behavior.recurrence	Recorrência confirmada

insight.generated	Insight criado

insight.relevance	Relevância recalculada

kernel.decision	Decisão do Kernel

notification.proposed	Mensagem candidata

notification.sent	Notificação enviada

user.preference	Mudança de preferência

system.maintenance	Evento técnico relevante

4\. TABELA GERAL DOS EVENTOS (MAPA COMPLETO)



A mais importante tabela deste documento.



A seguir, os 38 eventos oficiais do Fortress v7.24:



Nº	Evento	Categoria	Origem	Consumidor

1	purchase.created	finance.purchase	Supermarket	Financial Brain

2	purchase.updated	finance.purchase	Supermarket	Financial Brain

3	purchase.deleted	finance.purchase	Supermarket	Financial Brain

4	purchase.draft.created	finance.purchase	OCR Engine	Supermarket

5	purchase.draft.confirmed	finance.purchase	Supermarket	Financial Brain

6	ocr.scanned	finance.purchase	OCR Engine	Parser + Classifier

7	ocr.parsed	finance.purchase	Parser	Supermarket

8	ocr.confidence.low	finance.purchase	OCR Engine	UX, Brain (bloqueia insights)

9	classification.item.categorized	finance.purchase	Classifier	Supermarket

10	classification.item.uncertain	finance.purchase	Classifier	UX Review

11	forecast.month.updated	forecast.update	Forecast Engine	Insights

12	forecast.week.updated	forecast.update	Forecast Engine	Insights

13	forecast.stability.changed	forecast.stability	Forecast Engine	Insights + Kernel

14	forecast.risk.changed	forecast.update	Forecast Engine	Kernel

15	forecast.deviation.detected	forecast.update	Forecast Engine	Insights

16	behavior.pattern.detected	behavior.pattern	Financial Brain	Insights

17	behavior.pattern.updated	behavior.pattern	Financial Brain	Insights

18	behavior.recurrence.confirmed	behavior.recurrence	Financial Brain	Insights

19	behavior.volatility.changed	behavior.pattern	Brain	Forecast

20	insight.generated	insight.generated	Insights Engine	Kernel

21	insight.relevance.updated	insight.relevance	Kernel	Insights Engine

22	insight.suppressed	insight.generated	Kernel	Logging

23	kernel.decision.made	kernel.decision	Kernel	Notification Engine

24	kernel.cooldown.blocked	kernel.decision	Kernel	Logging

25	kernel.reinforcement.allowed	kernel.decision	Kernel	Notification Engine

26	notification.proposed	notification.proposed	Notification Engine	Kernel (validação)

27	notification.sent	notification.sent	Notification Engine	Audit

28	user.preference.changed	user.preference	App	Kernel

29	user.sensitivity.changed	user.preference	App	Kernel

30	user.timezone.changed	user.preference	App	Notification Engine

31	system.historic.rebuild	system.maintenance	Job Runner	Brain/Forecast

32	system.retroactive.recalculate	system.maintenance	Job Runner	Brain

33	system.cleanup	system.maintenance	Infra	Audit

34	meta.goal.created	finance.adjustment	Goals	Forecast + Brain

35	meta.goal.updated	finance.adjustment	Goals	Forecast

36	meta.goal.deleted	finance.adjustment	Goals	Forecast

37	item.list.generated	behavior.pattern	Supermarket	UX/Console

38	item.list.recommended	behavior.pattern	Supermarket	Forecast

5\. EVENTOS DETALHADOS (DESCRIÇÃO COMPLETA)



Agora, cada evento será descrito com significado, fluxo, payload, exemplo real e regras funcionais.



5.1 purchase.created

Categoria



finance.purchase



Origem



Supermarket



Consumidor



Financial Brain → Forecast → Insights



Significado



Uma compra confirmada foi registrada.



Payload conceitual

{

&nbsp; "purchaseId": "...",

&nbsp; "userId": "...",

&nbsp; "totalCents": 18900,

&nbsp; "timestamp": "2025-11-29T13:20Z",

&nbsp; "items": \[

&nbsp;   { "name": "Frango", "category": "Proteínas", "price": 1200 }

&nbsp; ]

}



Fluxo do evento



Brain recalcula impacto (% do mês).



Forecast recalcula previsões.



Insights geram potenciais avaliações de impacto.



Kernel decide se notifica.



5.2 purchase.updated



Atualização de uma compra — corrigir categoria, valor, itens.



Regra importante:

Atualizações só são permitidas nas últimas 24h.



5.3 purchase.deleted



Remoção lógica (não física) de uma compra.



Impacta:



forecast



estabilidade



tendências



recorrências



5.4 purchase.draft.created



Recibo interpretado automaticamente, ainda não confirmado.



Payload inclui confidence de OCR.



5.5 purchase.draft.confirmed



Usuário aprovou o draft → vira evento oficial de compra.



5.6 ocr.scanned



Foto recebida → OCR executado.



5.7 ocr.parsed



Parser transformou texto em itens estruturados.



5.8 ocr.confidence.low



Confidence < 0.6 →

Brain, Forecast e Kernel ignoram este evento para evitar insights imprecisos.



5.9 classification.item.categorized



Um item foi classificado automaticamente com confiança adequada.



5.10 classification.item.uncertain



Item identificado como ambíguo →

Entra em lista de revisão no app.



5.11 forecast.month.updated



O Forecast recalculou o total do mês.



Payload:



{

&nbsp; "forecastTotal": 2430.40,

&nbsp; "confidence": 0.71,

&nbsp; "deltaPct": 5.1

}





Este evento alimenta Insights (família E e C).



5.12 forecast.week.updated



Similar ao mensal, mas com foco em 3–5 dias.



5.13 forecast.stability.changed



Estabilidade mudou de:



estável → muito estável



moderada → instável etc.



Este evento só ocorre quando há mudança real, não micro variação.



5.14 forecast.risk.changed



Risco leve ou moderado alterou valor.



Não é risco alarmante.



5.15 forecast.deviation.detected



Desvio previsto vs. real > thresholds.



Gera insights da família E1, E2, E3.



5.16 behavior.pattern.detected



Brain detectou um padrão inicial, mas ainda não confirmado.



Exemplo: “toda segunda-feira há uma compra pequena”.



5.17 behavior.pattern.updated



Padrão existente mudou magnitude ou consistência.



5.18 behavior.recurrence.confirmed



O padrão se repete pela 3ª vez →

Agora é recorrência oficial.



5.19 behavior.volatility.changed



Volatilidade ficou:



alta



baixa



estável



Impacta:



Forecast



Insights



Kernel



5.20 insight.generated



Insight criado pelo módulo 4E.



Payload:



{

&nbsp; "insightId": "...",

&nbsp; "tipo": "B2",

&nbsp; "familia": "Tendência curta",

&nbsp; "interpretação": "Seu ritmo subiu um pouco nos últimos dias...",

&nbsp; "dados": "MA3 +2.8%",

&nbsp; "relevancia": 52

}





Mandado ao Kernel.



5.21 insight.relevance.updated



Kernel recalculou a relevância com novos pesos/contexto.



5.22 insight.suppressed



Insight gerado mas descartado pelo Kernel.



Razões comuns:



relevância baixa



cooldown



repetição textual



user\_sensitivity



5.23 kernel.decision.made



Decisão completa do Kernel (permitido ou não).



5.24 kernel.cooldown.blocked



Insight era relevante, mas barrado por cooldown.



5.25 kernel.reinforcement.allowed



Reserva espaço para reforço positivo leve no texto final.



5.26 notification.proposed



Mensagem pré-finalizada antes da checagem de cooldown/horário.



5.27 notification.sent



Notificação enviada ao app.



5.28 user.preference.changed



Alterações em:



insight frequency



tipos de alerta



reforço positivo



categories favoritas



Impacta Kernel diretamente.



5.29 user.sensitivity.changed



Nível ajustado (1–3).



5.30 user.timezone.changed



Ajusta janela horária permitida para notificações.



5.31 system.historic.rebuild



Reconstrução de histórico (apenas manutenção).



5.32 system.retroactive.recalculate



Recalcula padrões e previsões em lote.



5.33 system.cleanup



Evento de limpeza e retenção.



5.34 meta.goal.created



Criou meta.



Forecast recalcula impacto no mês.



5.35 meta.goal.updated



Ajustes nos valores → Forecast recalcula.



5.36 meta.goal.deleted



Meta removida → comportamento reequilibrado.



5.37 item.list.generated



Lista inteligente criada pelo Supermarket baseada em:



histórico



sazonalidade



consumo



5.38 item.list.recommended



Lista recomendada ao usuário.



6\. RELAÇÃO ENTRE EVENTOS E INSIGHTS



Tabela de quais eventos disparam insights:



Evento	Família de Insight

purchase.created	A1–A3, B1

forecast.month.updated	C1, E1–E3

forecast.week.updated	B1–B4

forecast.stability.changed	F1–F2

forecast.risk.changed	G1–G2

behavior.recurrence.confirmed	D1–D3

behavior.pattern.updated	C1–C2

purchase.updated	A1

purchase.deleted	C2 (tendência corrigida)

7\. REGRAS DE IDEMPOTÊNCIA



Um evento é considerado o mesmo quando:



sha256(payload + timestamp\_normalizado) === hashAnterior





Exceções:



notification.sent → sempre único



ocr.scanned → baseado no rawImageHash



8\. APÊNDICE — EXEMPLOS COMPLETOS DE FLUXO (END-TO-END)

Fluxo 1 — Compra → Insight → Notificação



purchase.created



forecast.month.updated



insight.generated



kernel.decision.made



notification.sent



Fluxo 2 — OCR (Confidence Baixo)



ocr.scanned



ocr.parsed



ocr.confidence.low

→ fim (nenhum insight é gerado)



Fluxo 3 — Recorrência Confirmada



purchase.created



behavior.pattern.detected



purchase.created



behavior.pattern.updated



purchase.created



behavior.recurrence.confirmed



insight.generated (família D)

