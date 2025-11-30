Observability Blueprint v7.24

Fortress Enterprise Edition

Monitoramento, Logs, Métricas, Alertas, Auditoria Cognitiva e Telemetria

1\. PROPÓSITO DO DOCUMENTO



Este documento define:



como o Fortress deve ser monitorado



que métricas devem existir



como logs devem ser estruturados



como o sistema deve detectar inconsistências cognitivas



qual a estratégia de alertas



indicadores para Brain, Forecast, Kernel e Notificações



como medir estabilidade emocional do sistema



como detectar assincronias e deriva cognitiva



Este blueprint é essencial para:



DevOps / SRE



Engenharia



Time Cognitivo (Kernel/Insights)



IA (Cursor/GPT)



Equipe de Produto



2\. PRINCÍPIOS DE OBSERVABILIDADE DO FORTRESS



Transparência cognitiva

O sistema precisa saber quando está pensando errado.



Métricas sobre semântica, não só sobre performance

ex.: % de insights suprimidos, não só CPU.



Logs estruturados e sem PII

Não expor valores exatos de pagamentos ou nomes de estabelecimentos.



Alarmes sobre comportamento, não apenas falhas técnicas

ex.: “Kernel repetiu a mesma mensagem 3 vezes”.



Ciclos de saúde cognitiva

O Brain e o Forecast têm ciclos de estabilidade que devem ser medidos.



Event-Driven Telemetry

Cada evento tem uma assinatura observável (Documento 6).



3\. TRÍADE DE OBSERVABILIDADE DO FORTRESS



O Fortress deve ter visibilidade total sobre:



A — Telemetria Técnica



latências



falhas de banco



filas



processamento de eventos



erros de rede



B — Telemetria Cognitiva



coerência entre insights



alinhamento entre Kernel e Forecast



estabilidade das tendências



ruído interpretativo



C — Telemetria Emocional



repetição indesejada



excesso de mensagens



suavidade média



horário de envio vs. impacto



Este é o diferencial do sistema.



4\. ARQUITETURA DE OBSERVABILIDADE

&nbsp;                   ┌────────────────┐

&nbsp;                   │ Event Log      │

&nbsp;                   │ (JSON, DB)     │

&nbsp;                   └───────┬────────┘

&nbsp;                           │

&nbsp;       ┌───────────────────┼──────────────────────┐

&nbsp;       ▼                   ▼                      ▼

┌─────────────┐     ┌─────────────┐        ┌─────────────┐

│Metrics Store│     │Log Pipeline │        │Alert Manager │

│  (Prometheus│     │ (ELK/OTel)  │        │   (Grafana)  │

└───────┬─────┘     └─────┬──────┘        └───────┬─────┘

&nbsp;       │                 │                        │

&nbsp;       ▼                 ▼                        ▼

┌─────────────┐    ┌──────────────┐        ┌───────────────┐

│ Dashboards  │    │ Analytics IA │        │ Alarms (Ops)   │

│ (Grafana)   │    │(Drift/Pattern│        │ Alarms (Cogn.) │

└─────────────┘    └──────────────┘        └───────────────┘



5\. LOGS — DIRETRIZES OFICIAIS

5.1 Formato dos logs



Todos os logs devem ser JSON estruturado.



Exemplo:



{

&nbsp; "timestamp": "2025-11-29T13:20:00Z",

&nbsp; "service": "forecast",

&nbsp; "event": "forecast.month.updated",

&nbsp; "level": "info",

&nbsp; "traceId": "uuid",

&nbsp; "userId": "uuid",

&nbsp; "stabilityScore": 0.42

}



5.2 Proibições de logs



Logs não podem conter:



nome do estabelecimento



valores financeiros absolutos



itens detalhados



interpretações de insights



mensagens enviadas ao usuário



Para evitar riscos emocionais e vazamento de PII.



5.3 Logs essenciais por módulo

Supermarket



OCR confidence



item parsing time



purchase created / updated / deleted



Brain



MA3/MA10 (sem valores absolutos)



padrões detectados



indicadores de recorrência



volatilidade



Forecast



qualidade do modelo



confiança



estabilidade calculada



delta\_pct



Kernel



relevância



cooldown



suavidade aplicada



motivos de supressão



Notification



proposta



envio



falhas de push



6\. MÉTRICAS — O CORAÇÃO DA OBSERVABILIDADE



As métricas são divididas em técnicas e cognitivas.



6.1 MÉTRICAS TÉCNICAS

6.1.1 Latência



api\_response\_time\_ms



event\_processing\_time\_ms



forecast\_generation\_ms



6.1.2 Erros



error\_rate



ocr\_failure\_rate



notification\_delivery\_failures



6.1.3 Banco e filas



db\_connection\_pool\_usage



queue\_backlog



eventbus\_retry\_count



6.2 MÉTRICAS COGNITIVAS (PRINCIPAIS)



Essas métricas são únicas do Fortress.



6.2.1 Coerência Cognitiva



insight\_incoherence\_score



kernel\_alignment\_consistency



forecast\_brain\_divergence\_pct



pattern\_stability\_index



6.2.2 Ruído e Suavidade



kernel\_suppression\_rate



avg\_suavidade



cooldown\_blocks\_count



daily\_notification\_count



6.2.3 Drift Cognitivo



cognitive\_drift\_events



drift\_recovery\_time\_ms



6.2.4 Saúde do Forecast



forecast\_error\_rate



forecast\_confidence\_avg



stability\_score\_trend



6.3 MÉTRICAS EMOCIONAIS



Este conjunto mede a experiência subjetiva do usuário:



notification\_timing\_score (horário vs conforto)



repetition\_sensitivity\_index



message\_density\_daily



reinforcement\_usage\_rate



7\. DASHBOARDS OFICIAIS (GRAFANA)

O Fortress tem 5 dashboards obrigatórios:

7.1 Dashboard 1 — Saúde Geral do Sistema



Mostra:



latência



erros



filas



taxa de delivery de notificações



7.2 Dashboard 2 — Cognitive Overview



Focado no cérebro:



coerência



relevância média



inconsistências detectadas



divergência Forecast vs Brain



7.3 Dashboard 3 — Kernel Health



Focado na parte comportamental:



suavidade média



cooldown ativo



insights permitidos



rate de supressão



7.4 Dashboard 4 — Forecast Panel



Focado em previsões:



estabilidade



confiança



erros percentuais



variação diária



7.5 Dashboard 5 — User Emotional Experience Panel



Acompanhamento indireto da experiência do usuário:



repetição



densidade de mensagens



sensibilidade respeitada



eventos de “soft warning”



8\. ALERTAS (ALARMES) — REGRAS OFICIAIS

8.1 Alertas Técnicos



eventbus backlog > X



forecast\_error\_rate > 10%



db\_pool\_usage > 80%



8.2 Alertas Cognitivos



Esses são únicos:



kernel\_suppression\_rate > 60%

→ indica insights de baixa qualidade ou ruído cognitivo.



insight\_incoherence\_score > 0.3

→ indica “mensagens contraditórias”.



forecast\_brain\_divergence\_pct > 20%

→ indica desalinhamento cognitivo.



daily\_notification\_count > limite

→ risco de incômodo emocional.



8.3 Alertas Emocionais



message\_density\_daily > 6



repetition\_sensitivity\_index > 0.5



reinforcement\_usage\_rate == 0 por 7 dias

→ indica “tom seco” involuntário.



9\. EVENTOS CRÍTICOS MONITORADOS



Monitorar via Prometheus:



brain.engine.failed



forecast.engine.failed



kernel.error



system.cognitive\_drift\_detected



notification.delivery\_failed



ocr.confidence.low



Esses eventos acionam alertas automáticos.



10\. AUDITORIA COGNITIVA (MÓDULO ÚNICO DO FORTRESS)



O Fortress possui um processo exclusivo de auditoria cognitiva:



10.1 O que é auditado



coerência das frases



suavidade aplicada



movimentos repetidos



decisões de supressão



previsões instáveis



cadências de notificação



10.2 Frequência



todo insight é auditado em background



semanalmente são revisadas 10 mil decisões do Kernel



10.3 Mecanismo



job coleta amostras



IA classifica padrões



dashboard exibe score



engenheiro valida



Kernel recebe ajuste fino se necessário



11\. CHECKLIST DE OBSERVABILIDADE (LANÇAMENTO)



&nbsp;Logs estruturados > 95%



&nbsp;Métricas cognitivas funcionando



&nbsp;Dashboards carregando



&nbsp;Alertas críticos configurados



&nbsp;Drift cognitivo monitorado



&nbsp;Forecast divergente alerta ativo



&nbsp;Telemetria emocional validada

