Data Model Specification v7.24

Fortress Enterprise Edition — DB Schema Oficial

Postgres + Redis (cache) + Blob Storage (OCR)

1\. OBJETIVO



Definir o modelo de dados completo para o Fortress:



estrutura persistente



formato das tabelas



relacionamentos e constraints



índices



regras de integridade



padrões de versão



esquemas auxiliares



Este documento é a referência absoluta para criação do schema SQL real.



2\. GUIDELINES GERAIS DO BANCO

2.1 Banco Principal



PostgreSQL 16



UTF-8



Timezone UTC



Valores monetários sempre em centavos (inteiro)



2.2 Nomeação



tabelas: snake\_case



colunas: snake\_case



chaves primárias: id



fk: <referencia>\_id



enums via CREATE TYPE



2.3 Normalização



Nível 3NF, exceto tabelas específicas de log/eventos.



2.4 Integridade



FK sempre com ON DELETE CASCADE quando fizer sentido



operações críticas via transações



3\. DIAGRAMA GLOBAL DO BANCO (TEXTO)

User

&nbsp;├── Purchase

&nbsp;│     └── PurchaseItem

&nbsp;├── ForecastMonth

&nbsp;├── ForecastWeek

&nbsp;├── Pattern

&nbsp;├── Recurrence

&nbsp;├── Insight

&nbsp;│     └── KernelDecision

&nbsp;└── Notification



4\. TABELAS — DEFINIÇÃO COMPLETA



Agora todas as tabelas com colunas, tipos e regras.



-----------------------------------------

4.1 USERS

-----------------------------------------

Tabela



users



Colunas

coluna	tipo	regras

id	uuid	pk

email	text	unique

password\_hash	text	bcrypt

plan	text	enum: sentinel/vanguard/legacy

sensitivity	int	1–3

reinforcement	bool	default true

notifications\_allowed	bool	default true

timezone	text	default 'UTC'

created\_at	timestamptz	default now()

updated\_at	timestamptz	

Índices



idx\_users\_email (unique)



idx\_users\_plan



-----------------------------------------

4.2 PURCHASES

-----------------------------------------

Tabela



purchases



Colunas

coluna	tipo	regras

id	uuid	pk

user\_id	uuid	fk → users(id)

total\_cents	int	>= 0

establishment	text	nullable

origin	text	enum: manual/ocr

status	text	enum: confirmed/draft

confidence	float8	nullable (0–1)

purchased\_at	timestamptz	data da compra

created\_at	timestamptz	registro

updated\_at	timestamptz	registro

Índices



idx\_purchases\_user\_id



idx\_purchases\_purchased\_at



idx\_purchases\_status



-----------------------------------------

4.3 PURCHASE\_ITEMS

-----------------------------------------

Tabela



purchase\_items



Colunas

coluna	tipo

id	uuid pk

purchase\_id	uuid fk → purchases(id)

name	text

category	text

price\_cents	int

quantity	float8

Índices



idx\_purchase\_items\_purchase\_id



-----------------------------------------

4.4 OCR\_RAW



Para armazenar imagens e texto brutos.



Tabela



ocr\_raw



coluna	tipo

id	uuid pk

user\_id	uuid fk

raw\_text	text

image\_blob\_path	text

confidence	float8

created\_at	timestamptz



Índices:

idx\_ocr\_raw\_user\_id



-----------------------------------------

4.5 FORECAST\_MONTH

-----------------------------------------

Tabela



forecast\_month



Colunas

coluna	tipo	descrição

id	uuid	pk

user\_id	uuid fk	

forecast\_total	int	em centavos

delta\_pct	float8	previsao vs real

confidence	float8	0–1

stability\_score	float8	

risk\_level	text	enum leve/moderado/significativo

generated\_at	timestamptz	

Índices



idx\_forecast\_month\_user\_id



idx\_forecast\_month\_generated\_at



-----------------------------------------

4.6 FORECAST\_WEEK

Tabela



forecast\_week



Colunas:

| coluna | tipo |

| user\_id | uuid fk |

| forecast\_total | int |

| confidence | float8 |

| delta\_pct | float8 |

| generated\_at | timestamptz |



-----------------------------------------

4.7 PATTERNS



Padrões detectados (ainda não confirmados como recorrência).



Tabela



patterns



coluna	tipo

id	uuid

user\_id	uuid

pattern\_type	text

pattern\_data	jsonb

confidence	float8

detected\_at	timestamptz



Índices:

idx\_patterns\_user\_id



-----------------------------------------

4.8 RECURRENCES



Recorrências confirmadas (3+ repetições)



Tabela



recurrences



| coluna | tipo |

| id | uuid |

| user\_id | uuid |

| recurrence\_type | text |

| recurrence\_data | jsonb |

| strength | float8 |

| confirmed\_at | timestamptz |



-----------------------------------------

4.9 INSIGHTS



Objeto cognitivo 4E



Tabela



insights



coluna	tipo

id	uuid

user\_id	uuid

tipo	text

familia	text

nivel	int

interpretacao	text

dados	text

impacto\_pct	float8

relevancia	float8

derived\_from\_event	text

created\_at	timestamptz



Índices:

idx\_insights\_user\_id

idx\_insights\_created\_at



-----------------------------------------

4.10 KERNEL\_DECISIONS



Decisões do Kernel 4C.



Tabela



kernel\_decisions



coluna	tipo

id	uuid

insight\_id	uuid fk → insights(id)

permitted	bool

cooldown\_min	int

final\_relevance	float8

reinforcement\_allowed	bool

tone	text

reasoning	jsonb

created\_at	timestamptz



Índices: idx\_kernel\_insight\_id



-----------------------------------------

4.11 NOTIFICATIONS

Tabela



notifications



coluna	tipo

id	uuid

user\_id	uuid

insight\_id	uuid fk (nullable)

mensagem	text

tipo	text

familia	text

read	bool default false

sent\_at	timestamptz



Índices:

idx\_notifications\_user\_id

idx\_notifications\_sent\_at



-----------------------------------------

4.12 EVENT\_LOG



Log completo dos eventos (Categoria 6).



Tabela



event\_log



coluna	tipo

id	uuid

name	text

payload	jsonb

origin	text

created\_at	timestamptz

-----------------------------------------

4.13 GOALS (METAS)

Tabela



goals



coluna	tipo

id	uuid

user\_id	uuid

name	text

value\_cents	int

periodicity	text

progress\_pct	float8

created\_at	timestamptz

-----------------------------------------

4.14 SMARTLISTS (LISTA INTELIGENTE)

Tabela



smartlists



coluna	tipo

id	uuid

user\_id	uuid

items	jsonb

generated\_at	timestamptz

rationale	text

-----------------------------------------

4.15 USER\_PREFERENCES



(Separado para simplificar APIs)



coluna	tipo

user\_id	uuid pk

sensitivity	int

reinforcement	bool

notifications\_allowed	bool

categories\_muted	jsonb

timezone	text

-----------------------------------------

4.16 CLEANUP\_LOG



Tarefas de manutenção



cleanup\_log

\- id uuid

\- type text

\- executed\_at timestamptz

\- affected\_rows int



5\. ENUMS OFICIAIS

purchase\_origin



manual



ocr



purchase\_status



confirmed



draft



risk\_level



leve



moderado



significativo



goal\_periodicity



monthly



weekly



6\. RELACIONAMENTOS (DETALHADOS)

users 1 ───< purchases

purchases 1 ───< purchase\_items

users 1 ───< insights

insights 1 ───< kernel\_decisions

users 1 ───< notifications

users 1 ───< forecast\_month

users 1 ───< forecast\_week

users 1 ───< patterns

users 1 ───< recurrences

users 1 ───< smartlists

users 1 ───< goals

users 1 ─── user\_preferences (1:1)



7\. ÍNDICES E PERFORMANCE

7.1 Índices críticos



purchases(user\_id, purchased\_at)



insights(user\_id, created\_at)



kernel\_decisions(insight\_id)



notifications(user\_id, sent\_at)



7.2 Partial Indexes

CREATE INDEX idx\_notifications\_unread

ON notifications (user\_id)

WHERE read = false;



8\. ESTRUTURA PARA EVENT-DRIVEN



Todos eventos devem ser armazenados em event\_log.



Formato:



{

&nbsp; "name": "purchase.created",

&nbsp; "payload": {...},

&nbsp; "origin": "supermarket",

&nbsp; "created\_at": "2025-11-29T..."

}



9\. RETENÇÃO E LIMPEZA

9.1 Manter por:



insights: 12 meses



notificações: 6 meses



raw OCR: 30 dias



event\_log: 90 dias



10\. REGRAS DE MIGRAÇÃO



sempre criar migrations incrementais



nunca renomear colunas existentes



alterar enums via ALTER TYPE ADD VALUE

