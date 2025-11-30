Glossário \& Data Dictionary

Fortress v7.24 — Enterprise Edition

Versão completa, expandida, para uso por Engenharia, Produto, UX, IA e Cursor

1\. PROPÓSITO DO DOCUMENTO



Este documento define:



O vocabulário oficial do ecossistema Fortress.



A semântica funcional dos termos usados por Produto, UX, Engenharia e IA.



O dicionário de dados conceitual, antes de se converter em modelos técnicos.



A mapa de entidades internas, seus significados e suas relações lógicas.



As restrições de linguagem para manter consistência entre módulos (Data, Insights, Kernel, Forecast, Supermarket, Notificações).



Este documento é referência absoluta.

Nada deve contradizê-lo — qualquer divergência deve ser corrigida para preservar a coerência v7.24.



2\. GLOSSÁRIO GERAL (VOCABULÁRIO OFICIAL)



Termos ordenados alfabeticamente.



2.1 A

Abertura (do Dia)



Momento em que o Daily Console exibe a leitura inicial do dia, incluindo:



resumo



insight relevante



ritmo atual



projeções



Agregação (Aggregation)



Processo de consolidação de micro variações e múltiplos eventos em um único insight ou registro de impacto.



Anomalia



Variação brusca, inesperada ou probabilisticamente improvável.

Nunca é descrita como “erro”, “problema” ou “alerta”.



Anti-ruído



Conjunto de regras do Kernel para evitar excesso de notificações, repetição textual e hiperatividade interpretativa.



2.2 B

Baseline



Referência histórica usada para avaliar comportamento atual.



Brain Event



Evento consumido pelo Financial Brain contendo dados estruturados (compra, projeção, padrão, item interpretado etc.).



2.3 C

Categoria (Supermarket)



Classificação conceitual de itens adquiridos (ex.: Hortifruti, Proteínas, Limpeza).



Confidence



Valor entre 0 e 1 indicando confiabilidade de OCR, previsão, insight ou classificação automática.



CoolDown



Intervalo mínimo necessário entre insights/notificações similares para evitar ruído cognitivo.



2.4 D

Daily Console



Tela central de leitura da vida financeira do usuário.

Contém: insights, resumos, ritmo, projeções.



Desvio



Diferença percentual entre o previsto e o realizado.



Draft (OCR)



Compra interpretada automaticamente mas ainda não confirmada pelo usuário.



2.5 E

Entrada (Evento de Entrada)



Qualquer ação que altera o estado financeiro do usuário (compra, edição, retorno de OCR).



Estabilidade



Medida de consistência temporal.

Quanto menor a volatilidade, maior a estabilidade.



2.6 F

Financial Brain



Motor cognitivo principal que calcula padrões, previsões, tendências, impactos e ritmo.



Forecast



Componente responsável pela previsão mensal, semanal e estabilidade futura.



2.7 G

Gasto Médio Diário



Métrica central da leitura de ritmo.



Goals



Módulo responsável por metas e compromissos.



2.8 H

Histórico



Conjunto de dados financeiros do usuário (30/90/ilimitado conforme plano).



2.9 I

Impacto



Mudança provocada por um evento no total previsto do mês.



Insight



Interpretação cognitiva produzida pelo Brain e moldada pelo Kernel.

Regra central: observação → contexto → movimento.



2.10 J



Sem termos oficiais no momento.



2.11 K

Kernel Comportamental (4C)



Camada responsável por:



relevância



suavidade



prioridade



cooldown



reforço positivo



anti-ruído



idempotência



permissão de notificação



2.12 L

Lista Inteligente



Lista gerada automaticamente pelo Supermarket com base em histórico, sazonalidade e frequência.



Linguagem Cognitiva



Forma padrão de comunicação do Fortress:



suave



descritiva



neutra



explicativa



nunca instrutiva



2.13 M

MA3 / MA10



Médias móveis de 3 e 10 dias usadas para tendências curtas e longas.



Movimento



Direção interpretada: subida leve, subida moderada, queda leve, estável etc.



2.14 N

Natural Flow



Conjunto de regras temporais e comportamentais para tornar insights naturais para o usuário.



Notificação



Mensagem enviada ao usuário após passar pelo Kernel e Compositor de Linguagem.



2.15 O

Observação



Primeiro componente da gramática cognitiva.

Descreve o fato visto nos dados.



OCR



Processamento de imagem para extrair texto de recibos.



2.16 P

Padrão



Comportamento repetido no tempo (semanal, bissemanal, mensal).



Pipeline Cognitivo



Sequência: Evento → Brain → Forecast → Insight → Kernel → Notificação.



Plano (Tier)



Sentinel / Vanguard / Legacy.



2.17 Q

Quantidade de Evidências



Número de repetições necessárias para confirmação de padrão.



2.18 R

Recorrência



Repetição identificada como consistente pelo Brain.



Reforço Positivo



Mensagem sutil adicionada ao final de textos positivos.



2.19 S

Suavidade



Escala 1–5 aplicada pelo Kernel para modular o tom da mensagem.



Supermarket



Módulo responsável por registrar compras e interpretar comportamento de consumo.



2.20 T

Tendência



Movimento consistente calculado com base em médias móveis e ritmo.



Tone Styleguide



Conjunto de regras de tom que evitam julgamento, urgência e incômodo.



2.21 U

Uncertainty Window



Intervalo de confiança de projeções e previsões.



2.22 V

Volatilidade



Medida estatística sobre dispersão de gastos em relação ao padrão.



2.23 W-Z



Sem termos oficiais adicionais neste release.



3\. DICIONÁRIO DE DADOS (CONCEITUAL)



IMPORTANTE:

Este NÃO é o modelo técnico/tabelas.

É o modelo semântico, usado para IA, Produto, UX e estrutura lógica de domínio.

A DB Spec virá como documento próprio (mais adiante na ordem).



3.1 ENTIDADE: User



Representa a pessoa que utiliza o sistema.



Atributos conceituais

Campo	Tipo	Descrição

id	UUID	Identificador único

plano	enum	Sentinel / Vanguard / Legacy

preferencias	objeto	tipos de insight, sensibilidade, reforço

timezone	string	Fuso para geração de mensagens

onboardingStatus	enum	etapas completadas

Regras importantes



plano define acesso a histórico e frequência de notificações.



preferências influenciam suavidade e reforço positivo.



3.2 ENTIDADE: Purchase (Compra)



Registro central do módulo Supermarket.



Atributos



| Campo | Tipo | Descrição |

| total | integer (cents) | Valor em centavos |

| data | datetime UTC | Data base |

| estabelecimento | string? | Opcional |

| itens | array<PurchaseItem> | Lista de itens |

| categoriaPrincipal | string | Derivada |

| origem | enum | manual / OCR |

| status | enum | confirmado / draft |

| confidence | float | Em compras via OCR |



Regras



valores sempre em centavos



draft só vira definitivo após aprovação



3.3 ENTIDADE: PurchaseItem



| Campo | Tipo | Descrição |

| nome | string | Nome identificado ou normalizado |

| categoria | string | Ex.: Hortifruti |

| quantidade | float | Opcional |

| preco | integer | Em centavos |

| flags | objeto | Fitness, recorrência, essencial etc. |



3.4 ENTIDADE: Forecast



Objeto composto (mensal + semanal + estabilidade + risco).



Estrutura conceitual



| Campo | Tipo | Descrição |

| mensal.forecast | float | Valor previsto total |

| mensal.desvioPct | float | Desvio percentual |

| mensal.confianca | float | 0–1 |

| semanal.previsao | float | Semana |

| estabilidade.score | float | 0–1 |

| risco.nivel | enum | leve / moderado / significativo |



3.5 ENTIDADE: Insight (objeto cognitivo)



Alinhado ao 4E.



| Campo | Tipo | Descrição |

| tipo | string | A1, B2, C1 etc. |

| familia | string | Impacto, Tendência etc. |

| nivel | int | 1–5 suavidade |

| interpretacao | string | Texto |

| tendencia | string | subida leve etc. |

| impacto | float | % |

| relevancia | float | 0–100 |

| dados | string | Dados usados |

| timestamp | datetime | UTC |



3.6 ENTIDADE: KernelDecision



| Campo | Tipo | Descrição |

| permitted | boolean | Se pode notificar |

| relevancia | float | 0–100 |

| suavidade | int | 1–5 |

| cooldownMinimo | int | horas |

| reforcoPermitido | bool | true/false |

| explicacao | objeto | metadados |



3.7 ENTIDADE: Notification



| Campo | Tipo | Descrição |

| mensagem | string | Texto final |

| tipo | string | B2, F1 etc. |

| familia | string | tendência/estabilidade |

| reforco | bool | se inclui camada extra |

| prioridade | float | peso de exibição |

| timestamp | datetime | horário real |

| origemInsight | Insight.id | referência |



3.8 ENTIDADE: Event (conceitual)



Detalhado no documento 6, mas listado aqui por coerência.



| Campo | Tipo | Descrição |

| nome | string | nome único |

| payload | objeto | conteúdo |

| origem | string | módulo |

| destino | string | consumidor |

| categoria | enum | compra / projeção / comportamento / kernel |



3.9 ENTIDADE: Lista Inteligente



| Campo | Tipo | Descrição |

| itens | array<string> | nomes |

| geracao | enum | manual/automática |

| justificativa | string | por que um item entrou |

| prioridade | int | ordenação |



3.10 ENTIDADE: Meta (Goal)



| Campo | Tipo | Descrição |

| nome | string | Nome da meta |

| valor | float | objetivo |

| periodicidade | enum | mensal, semanal |

| progresso | float | % atingido |

| impactoAtual | float | impacto no mês |



4\. RELAÇÕES ENTRE ENTIDADES

User → Purchase



1:N (um usuário possui várias compras)



Purchase → PurchaseItem



1:N



Purchase → Insight



Uma compra pode gerar insights → não obrigatório.



Purchase → Forecast



Toda compra recalcula parte do forecast.



Forecast → Insight



Previsões alimentam famílias B, C, E, F.



Insight → KernelDecision



Cada insight passa por uma decisão do Kernel.



KernelDecision → Notification



Uma decisão pode ou não gerar uma notificação.



5\. GLOSSÁRIO DE VERBOS OFICIAIS DO DOMÍNIO



Os verbos abaixo são os únicos permitidos em documentação e UX:



Detectar



Usado para padrões, tendências, recorrências.



Interpretar



Ação central do Financial Brain.



Projetar



Produzir previsão futura.



Recalcular



Sempre que algo muda no mês.



Consolidar



Agrupar micro variações.



Classificar



Atribuir categoria a itens.



Confirmar



Aprovar OCR.



Contextualizar



Explicar magnitude.



Descrever



Usado para insights e mensagens leves.



Sugerir suavemente



Permitido apenas quando impacto é leve e opcional.



6\. CONSTRAINTS DE LINGUAGEM (para IA e UX Writing)

Proibido



você gastou demais



alerta



urgente



cuidado



perigo



deveria



não faça



evite



recomendação explícita



tons moralizantes



Permitido



ritmo



movimento



padrão



tendência



estabilidade



comportamento



contexto



dentro do esperado



leve



sutil



7\. APÊNDICE — TAXONOMIA OFICIAL DE CATEGORIAS DO FORTRESS



(Extraído do PFS 4B, consolidado)



Alimentação



Hortifruti



Proteínas



Laticínios



Padaria



Congelados



Lanches



Bebidas



Casa e Rotina



Limpeza



Higiene



Drogaria



Pets



Casa



Outros



Fitness



Uncategorized

