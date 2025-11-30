Error Handling \& Recovery Playbook v7.24

Fortress Enterprise Edition

Guia Oficial de Tratamento de Erros, Recuperação, Quedas Cognitivas e Continuidade do Sistema

1\. PROPÓSITO DO DOCUMENTO



Este Playbook define:



como erros devem ser detectados



como o sistema deve reagir



como se recupera sem impactar o usuário



como evitar quedas cognitivas



como prevenir divergências entre Forecast, Brain, Kernel e Insights



como logs, métricas e alarmes são gerados



como a experiência emocional do usuário se mantém intacta mesmo em falhas



Este documento é obrigatório para:



Engenharia



Produto



Time de Dados



DevOps / SRE



IA (Cursor / ChatGPT)



Notificação / Mobile



2\. CLASSIFICAÇÃO OFICIAL DE ERROS



Todos os erros do Fortress v7.24 são classificados em:



Categoria	Nome	Impacto	Exemplos

E1	Input \& Data Errors	Baixo	OCR ruim, draft inválido

E2	Domain Consistency Errors	Médio	projeção incoerente

E3	Engine Errors (Brain/Forecast)	Alto	falha no cálculo

E4	Kernel Errors (4C)	Alto	relevância não calculada

E5	Notification Errors	Médio/Alto	push não enviado

E6	Persistence Errors	Crítico	inserts falham

E7	Event Pipeline Errors	Alto	eventos duplicados

E8	Cognitive Drift Errors	Crítico	insights incoerentes

E9	Security \& Privacy Errors	Crítico	dados vazam

E10	User-Facing Errors	Baixo/Moderado	UX falhou

3\. ESTRUTURA OFICIAL DE UM ERRO (INTERNO)



Todos os erros devem seguir o formato:



{

&nbsp; "errorId": "uuid",

&nbsp; "timestamp": "2025-11-29T13:20:00Z",

&nbsp; "category": "E3",

&nbsp; "type": "FORECAST\_MODEL\_ERROR",

&nbsp; "stage": "forecast.monthly",

&nbsp; "severity": "high",

&nbsp; "context": {

&nbsp;   "userId": "uuid",

&nbsp;   "purchaseId": "uuid?",

&nbsp;   "forecastModelVersion": "7.24.12"

&nbsp; },

&nbsp; "stack": "opcional",

&nbsp; "actionTaken": "rollback + retry\_3s"

}



4\. PLAYBOOK POR CATEGORIA



A seguir estão todos os tipos de erro e como o sistema deve reagir.



Este é o core do documento.



-----------------------------------------

4.1 E1 — Input \& Data Errors

(OCR, drafts, campos inválidos)

-----------------------------------------

Exemplos



OCR com confidence baixo



draft incompleto



items sem categoria



purchase com total incoerente



Ações oficiais



Não gerar insights vinculados a estes eventos



Não atualizar Forecast



Registrar evento ocr.confidence.low ou purchase.invalid



Notificação ao usuário deve ser suave e indireta, ex.:



“Parece que alguns dados ficaram pouco nítidos. Você pode revisar quando quiser.”



Nunca usar palavras duras como “erro”, “falha”, “não consegui”.



-----------------------------------------

4.2 E2 — Domain Consistency Errors

(dados inconsistentes entre módulos)

-----------------------------------------

Exemplos



soma de itens ≠ total da compra



projeção semanal fora do esperado



padrão gerado com poucas evidências



Ações oficiais



Brain ignora evento atual



Forecast recalcula baseado nos últimos valores válidos



Insights suprimem variáveis instáveis



Kernel bloqueia notificações derivadas



Registrar evento system.domain\_inconsistency



-----------------------------------------

4.3 E3 — Engine Errors (Brain / Forecast)

-----------------------------------------

Exemplos



média móvel inválida



divisão por zero



modelo sem base de dados



recálculo infinito (loop cognitivo)



Ações oficiais



Rollback da transação



Retry exponencial: 1s, 3s, 9s



Se falhar 3 vezes → fallback:



Forecast volta ao estado anterior



Insights não são gerados



Registrar evento: forecast.engine.failed ou brain.engine.failed



Observação crítica



Nunca entregar ao usuário uma mensagem baseada em dados instáveis.



-----------------------------------------

4.4 E4 — Kernel Errors (4C)

-----------------------------------------

Exemplos



variação de relevância negativa



falha ao calcular suavidade



cooldown inválido



falha ao aplicar regras de tom



Ações oficiais



Insight é marcado como suppressed



Kernel gera fallback:



{ "permitted": false, "reason": "kernel\_error" }





Notificações não são enviadas



Registrar evento kernel.error



-----------------------------------------

4.5 E5 — Notification Errors

-----------------------------------------

Exemplos



push provider offline



jornada de envio interrompida



texto final não renderizou



falha ao aplicar reforço



Ações oficiais



Retry automático: 3x em 10 minutos



Caso falhe: registrar notification.delivery\_failed



Não reenviar a mesma notificação dias depois (evitar ruído)



-----------------------------------------

4.6 E6 — Persistence Errors

-----------------------------------------

Os mais críticos do sistema.

Exemplos



falha ao salvar purchase



falha ao gravar insight



duplicidade de evento



inconsistência no event\_log



Ações oficiais



Transação deve ser abortada



Usuário deve ver mensagem neutra:



“A operação não foi concluída, mas você pode tentar novamente quando quiser.”



Deve haver auditoria automática



Alarme SRE nível crítico



-----------------------------------------

4.7 E7 — Event Pipeline Errors

-----------------------------------------

Exemplos



evento duplicado



evento fora de ordem



evento perdido



Ações oficiais



Idempotência obrigatória (Documento 6)



Fila DLQ (dead-letter queue)



Reprocessamento assíncrono



-----------------------------------------

4.8 E8 — Cognitive Drift Errors

(o pior tipo de erro — “desalinhamento cognitivo”)

-----------------------------------------

Exemplos



insights incoerentes



forecast contraditório



kernel exagerado ou repetitivo



percepção de “bipolaridade” no app



mensagens fora do tom



Ações oficiais



Suspender insights por 6 horas



Kernel entra em modo seguro:



suavidade nível 5



nenhuma notificação urgente



preferência por resumos, não interpretações



Registrar evento:

system.cognitive\_drift\_detected



Job executa recálculo completo:



forecast



padrões



metas



ritmo



Caso ocorra mais de 3x/mês → alerta cognitivo (interno)



-----------------------------------------

4.9 E9 — Security \& Privacy Errors

-----------------------------------------

Exemplos



tentativa de acesso a dados de outro usuário



vazamento de payload



evento sensível exposto em logs



timezone contendo string maliciosa



Ações oficiais



Bloquear ação imediatamente



Registrar evento crítico



Revogar tokens ativos



Em alguns casos → apagar objeto do banco



Aplicar política de “mínimo impacto”:



insights são limpos



previsões recalibradas



-----------------------------------------

4.10 E10 — User-Facing Errors

(Erros exibidos ao usuário)

-----------------------------------------



Regra de ouro:

O app nunca usa a palavra "erro".



Mensagens permitidas



“Não foi possível completar agora.”



“Parece que algo ficou instável por um momento.”



“Você pode tentar novamente quando quiser.”



Mensagens proibidas



“Falha fatal”



“Erro interno”



“Operação inválida”



5\. ESTRATÉGIAS OFICIAIS DE RECUPERAÇÃO

5.1 Retry Policies



Forecast: 3 tentativas (1s / 3s / 9s)



Notification: 3 tentativas em 10 minutos



Brain: recalcular imediatamente + fallback



5.2 Fallbacks (por módulo)

Forecast fallback



usar última previsão válida



não mostrar tendência derivada



Insights fallback



mostrar apenas resumos



ocultar análises de movimento



Kernel fallback



suavidade 5



relevância mínima



cooldown dobrado



Notification fallback



não enviar mensagem redundante



6\. LOGS E AUDITORIA

6.1 Cada erro gera:



errorId



categoria



stack trace (se técnica)



contexto



impacto



ação automática



6.2 Logs não podem conter:



valores absolutos de dinheiro



nome de estabelecimento



itens detalhados



Para segurança emocional e privacidade.



7\. METRICAS DE SAÚDE (KPIs DE ERROS)

As principais métricas que monitoram falhas:

Métrica	Significado

forecast\_error\_rate	% de falhas no Forecast

kernel\_suppression\_rate	% de insights descartados

insight\_incoherence\_metric	erros cognitivos

notification\_drop\_rate	falha de push

ocr\_low\_confidence\_pct	entradas ruins

cognitive\_drift\_events	crises cognitivas



8\. CHECKLIST OFICIAL DE RESILIÊNCIA



Antes de liberar qualquer release, verificar:



&nbsp;Eventos idempotentes (Doc 6)



&nbsp;Forecast sem loops



&nbsp;Kernel sem repetição textual



&nbsp;Insights coerentes por 30 dias de dados sintéticos



&nbsp;Notificações sem duplicações



&nbsp;Erros seguros e suaves no app



&nbsp;Logs sem PII



9\. MAPA DE FLUXOS OFICIAIS DE ERRO



Fluxos formais usados por engenharia, dados, SRE e IA.



9.1 Fluxo Universal de Erro Interno

Evento → Validação → Classificação (E1–E10)

&nbsp;       ↓

Ação Automática (retry / fallback / suppress)

&nbsp;       ↓

Registro (event\_log)

&nbsp;       ↓

Atualização de métricas

&nbsp;       ↓

Possível impacto no usuário (soft-only)





Princípios:



nenhum módulo pode propagar erro sem classificação



nenhum módulo pode gerar insight após erro



Forecast nunca continua com dado instável



Kernel nunca envia notificação após falha



Logs sempre devem existir (exceto erros de privacidade)



9.2 Fluxo de Recuperação Cognitiva (Cognitive Drift)



O mais importante do sistema.



detected\_drift → suspende insights (6h)

&nbsp;              → Kernel modo seguro

&nbsp;              → Forecast recalc full

&nbsp;              → Brain reseta variáveis internas

&nbsp;              → Avaliação de coerência

&nbsp;              → Se OK → libera Insights/Kernel





Critérios de liberação:



forecast\_error\_rate < 1%



kernel\_suppression\_rate < 5%



nenhuma notificação gerada no modo seguro



10\. MATRIZ DE DECISÃO DE SEVERIDADE



Nem todo erro dentro da mesma categoria tem o mesmo impacto.



Severidade	Quando usar	Exemplo

low	erro tratável sem impacto	OCR fraco

medium	inconsistência parcial	domínio instável

high	modelo falhou	forecast loop

critical	risco de perda de dados ou privacidade	persistence / segurança



Regra oficial:



critical → interrompe o pipeline imediatamente



high → fallback automático



medium → supressão parcial



low → operação continua, apenas com log



11\. TABELA DE AÇÕES PROIBIDAS



Itens que nenhum módulo pode fazer, nunca:



❌ Proibido



Reenviar notificação após falha (ruído emocional)



Exibir mensagens duras como “erro”, “falha”, “problema técnico”



Salvar eventos parcialmente válidos



Atualizar Forecast com evidências fracas



Gerar insight baseado em dado instável



Registrar logs contendo:



valores absolutos de dinheiro



nomes de estabelecimentos



itens



Expor stack trace ao usuário



Realizar “auto-correções agressivas” (mudança de categoria, metas ou padrões sem evidência)



✔️ Permitido



Reprocessamento assíncrono



Fallback silencioso



Supressão inteligente



Recalcular Forecast no background



12\. TEMPLATES OFICIAIS DE LOGS POR CATEGORIA



Faltava especificação detalhada.



12.1 Log E1 — Input \& Data

event: "input.low\_confidence"

source: "ocr"

confidence: 0.42

action: "ignored + soft\_notify"



12.2 Log E3 — Engine

event: "forecast.engine.failed"

attempt: 2

retry\_next: "3s"

model\_version: "7.24.12"

fallback\_used: false



12.3 Log E8 — Cognitive Drift

event: "system.cognitive\_drift\_detected"

incoherence\_metric: 0.73

insights\_suspended: "6h"

mode: "kernel\_safe\_mode"



12.4 Log E9 — Security

event: "security.violation"

type: "cross-user-access"

token\_revoked: true

object\_removed: false



13\. TESTES OFICIAIS DE RESILIÊNCIA



Para QA, SRE, engenharia, IA e automações do Cursor.



13.1 Testes para Forecast



input instável



variáveis zeradas



loop forçado



perda de evento no pipeline



multi-retry simultâneo



13.2 Testes para Kernel



relevância negativa



dois insights competindo pelo mesmo slot



tom quebrado



repetição fraseada



notificações paralelas



13.3 Testes para Notifications



provider offline



payload inválido



tempo de envio expirado



duplicidade de trigger



13.4 Testes Cognitivos



Simulação de:



drift leve



drift moderado



drift severo



forecast contraditório



insight confuso



kernel agressivo



user emotional shielding test



14\. PROTOCOLO DE COOPERAÇÃO ENTRE MÓDULOS



(estava faltando totalmente)



14.1 Brain → Forecast



Se o Brain falhar:



Forecast pausa



ignora o último snapshot



usa o estado anterior



14.2 Forecast → Kernel



Se Forecast estiver instável:



Kernel entra em modo safe



suprime insights interpretativos



só permite resumos



14.3 Kernel → Notifications



Se Kernel gerar insight suppressed:



notificações são automaticamente bloqueadas



14.4 EventBus → Todos os Módulos



Se o EventBus detectar duplicidade:



todos os módulos recebem event.duplicate\_detected



reprocessamento parcial é obrigatório



15\. MAPA DE RECUPERAÇÃO COMPLETA



Fluxo usado em incidentes reais.



erro crítico → congelar writes

&nbsp;           → revogar tokens (se segurança)

&nbsp;           → auditoria automática

&nbsp;           → reprocessamento DLQ

&nbsp;           → reconstrução de Forecast

&nbsp;           → reconstrução de padrões

&nbsp;           → reconstrução de metas

&nbsp;           → avaliação neural

&nbsp;           → normalização do Kernel

&nbsp;           → liberar Insights



16\. ZONAS DE RISCO E ALERTAS DO SISTEMA



Faltava especificar.



Zona	Significado	Ação

estabilidade	tudo ok	normal

risco leve	aumento de inconsistências	revisar Forecast

risco médio	suppressions acima do normal	Kernel safe mode

risco alto	drift detectado	suspender insights

crítico	perda de dados ou privacidade	protocolo completo

17\. GLOSSÁRIO TÉCNICO



Essencial para onboarding e IA.



Cognitive Drift



Desalinhamento entre Forecast, Brain, Kernel ou Insights.



Kernel Safe Mode



Modo de máxima suavidade, nenhuma interpretação profunda, foco em resumos.



Suppressed Insight



Insight bloqueado por inconsistência técnica.



Fallback Forecast



Uso da última previsão válida sem projeções derivadas.



Low-Confidence Input



Entrada que não pode alimentar o modelo.



18\. REFERÊNCIAS CRUZADAS OBRIGATÓRIAS



Para manter coerência:



Documento 4C — Regras do Kernel



Documento 6 — Idempotência e EDA



Documento 7 — DB Spec



Documento 8 — API Contract



Documento 9 — Observability \& SRE



Documento Master Context Técnico v7.24

