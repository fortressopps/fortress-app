DB Specification — Fortress v7



Documento técnico: especificação de banco de dados relacional (primário: PostgreSQL) para o projeto Fortress. Cobre modelagem lógica, esquemas DDL, exemplos Prisma, estratégias de migração, índices, particionamento, segurança, gestão de dados e práticas operacionais.



Objetivo: entregar um DB Spec pronto para implementação, testes e integração com arquitetura orientada a eventos.



Sumário



Visão geral e requisitos



Escolha tecnológica



Modelo conceitual (entidades principais)



Modelo lógico (tabelas)



Esquema Prisma (exemplo)



SQL DDL (Postgres) — tabelas e índices



Estratégia de migração e versionamento



Backup, RTO/RPO e retenção



Indices, particionamento e performance



Observabilidade e monitoramento de BD



Segurança, criptografia, PII/GDPR



Estratégia de dados para eventos e CDC



Testes, QA e dados sintéticos



Anexos: consultas úteis, ER textual, guidelines de naming



1 — Visão geral e requisitos



Requisitos funcionais relevantes ao DB:



Multi-tenant (por tenant ou por customer? suportar modelo híbrido)



Contas financeiras, transações e categorias



Integração com modo supermarket (produtos, estoque, carrinho, pedidos)



Alta integridade e auditoria (ledger-like para transações)



Compatibilidade para Event-Driven Architecture (publisher de eventos, CDC)



Armazenamento eficiente de dados analíticos (schema de fatos / estrelas ou lakes)



Requisitos de conformidade: GDPR, LGPD (retenção e anonimização)



Níveis de disponibilidade:



Produção: alta disponibilidade (replica read-only), backups diários/contíguos, RTO < 1h, RPO dependente do plano (1h para críticos).



2 — Escolha tecnológica



Banco primário: PostgreSQL (>=13 / 14 recomendado). Motivo: ACID, JSONB, extensões (pgcrypto, timescaledb opcional), ótima integração com Prisma.



Replica read-only: streaming replication (Postgres built-in).



CDC/Event streaming: Debezium + Kafka ou logical replication para enviar eventos.



Armazenamento analítico: Data Warehouse (Snowflake / BigQuery) ou um schema OLAP no Redshift/Postgres pluggable.



ORM recomendado: Prisma para Node/TypeScript (e.g. backend em TS).



3 — Modelo conceitual (principais entidades)



users — identidade, perfil e autenticação



tenants — multi-tenant container (se aplicável)



accounts — contas financeiras (wallets, bank accounts)



transactions — transações financeiras (ledger entries)



categories — categorias de gasto



merchants — comerciantes / lojas



receipts — comprovantes/faturas (links, OCR metadata)



products — catálogo (modo supermarket)



inventory — estoques (por location)



carts — carrinhos temporários



orders — pedidos (checkout)



audit\_logs — logs de auditoria (mudanças críticas)



events\_outbox — tabela outbox para EDA/CDC



analytics\_\* — tabelas/ETL (fatos e dimensões)



attachments — arquivos binários (s3 refs)



4 — Modelo lógico (tabelas e campos-chave)



Abaixo as tabelas essenciais com campos chave e comentários resumidos.



tenants



id UUID PK



name varchar



plan varchar



created\_at timestamptz



config jsonb



users



id UUID PK



tenant\_id FK -> tenants.id



email varchar unique nullable



phone varchar unique nullable



password\_hash text (armazenar no vault se possível)



profile jsonb



created\_at, last\_login\_at



is\_active bool



accounts



id UUID PK



tenant\_id FK



user\_id FK (nullable — contas corporativas)



type enum ('wallet','bank','credit','savings',...)



currency char(3)



balance numeric(20,6) (mantido por ledger)



metadata jsonb



created\_at, updated\_at



transactions (ledger)



id UUID PK



tenant\_id FK



account\_id FK



counterparty\_account\_id FK nullable



type enum ('debit','credit','transfer','fee',...)



amount numeric(20,6) NOT NULL CHECK (amount >= 0)



currency char(3)



status enum ('pending','posted','failed','reversed')



occurred\_at timestamptz



reference varchar (external id)



description text



category\_id FK nullable



receipt\_id FK nullable



metadata jsonb



created\_at, updated\_at



Nota: O registro de débito/crédito deve sempre ser imutável — usar insert-only + status. Versões reversão através de contra-transações.



categories



id UUID PK



tenant\_id



name



parent\_id FK nullable



rules jsonb (automatizações)



created\_at



merchants



id UUID PK



name, merchant\_code



category, metadata



created\_at



receipts



id UUID PK



tenant\_id, user\_id



transaction\_id FK nullable



amount, currency



ocr\_data jsonb



image\_s3\_key varchar



created\_at



Supermarket-specific



products



id UUID PK



sku varchar unique



name, description



brand



category\_id



price numeric(12,2)



tax\_code varchar



attributes jsonb



created\_at, updated\_at



inventory



id UUID PK



product\_id FK



location\_id FK



quantity integer



reserved integer



reorder\_threshold integer



last\_restock\_at timestamptz



carts



id UUID PK



user\_id, tenant\_id



items jsonb (or normalized cart\_items)



expires\_at



created\_at



orders



id UUID PK



tenant\_id, user\_id



cart\_id FK



status enum ('created','paid','shipped','delivered','cancelled')



total\_amount, currency



shipping\_address jsonb



payment\_reference varchar



created\_at, updated\_at



audit\_logs



id UUID



tenant\_id



entity varchar



entity\_id UUID



action varchar



user\_id UUID nullable



diff jsonb



created\_at



events\_outbox



id bigserial PK



tenant\_id



aggregate varchar



aggregate\_id uuid



event\_type varchar



payload jsonb



status enum ('pending','sent','failed')



attempts int



created\_at, sent\_at



5 — Exemplo de esquema Prisma (trechos)

// schema.prisma (exemplo resumido)

generator client {

&nbsp; provider = "prisma-client-js"

}



datasource db {

&nbsp; provider = "postgresql"

&nbsp; url      = env("DATABASE\_URL")

}



model Tenant {

&nbsp; id        String   @id @default(uuid())

&nbsp; name      String

&nbsp; plan      String

&nbsp; config    Json?

&nbsp; users     User\[]

&nbsp; createdAt DateTime @default(now())

}



model User {

&nbsp; id          String   @id @default(uuid())

&nbsp; tenantId    String

&nbsp; tenant      Tenant   @relation(fields: \[tenantId], references: \[id])

&nbsp; email       String?  @unique

&nbsp; phone       String?  @unique

&nbsp; passwordHash String?

&nbsp; profile     Json?

&nbsp; isActive    Boolean  @default(true)

&nbsp; createdAt   DateTime @default(now())

&nbsp; accounts    Account\[]

}



model Account {

&nbsp; id         String   @id @default(uuid())

&nbsp; tenantId   String

&nbsp; userId     String?

&nbsp; type       String

&nbsp; currency   String

&nbsp; balance    Decimal  @default(0)

&nbsp; metadata   Json?

&nbsp; createdAt  DateTime @default(now())



&nbsp; user       User?    @relation(fields: \[userId], references: \[id])

}





Complete conforme modelos lógicos acima. Use Decimal (Prisma) para valores financeiros e configure @@index e @unique conforme necessidade.



6 — SQL DDL (Postgres) — snippets essenciais

Extensions recomendadas

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- opcional: timescaledb, pg\_partman



Tabela tenants

CREATE TABLE tenants (

&nbsp; id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; name text NOT NULL,

&nbsp; plan text,

&nbsp; config jsonb,

&nbsp; created\_at timestamptz DEFAULT now()

);



Tabela users

CREATE TABLE users (

&nbsp; id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; tenant\_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

&nbsp; email text,

&nbsp; phone text,

&nbsp; password\_hash text,

&nbsp; profile jsonb,

&nbsp; is\_active boolean DEFAULT true,

&nbsp; created\_at timestamptz DEFAULT now(),

&nbsp; last\_login\_at timestamptz

);

CREATE UNIQUE INDEX ux\_users\_tenant\_email ON users (tenant\_id, lower(email)) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX ux\_users\_tenant\_phone ON users (tenant\_id, phone) WHERE phone IS NOT NULL;



Tabela accounts

CREATE TABLE accounts (

&nbsp; id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; tenant\_id uuid NOT NULL REFERENCES tenants(id),

&nbsp; user\_id uuid REFERENCES users(id),

&nbsp; type text NOT NULL,

&nbsp; currency char(3) NOT NULL,

&nbsp; balance numeric(20,6) NOT NULL DEFAULT 0,

&nbsp; metadata jsonb,

&nbsp; created\_at timestamptz DEFAULT now(),

&nbsp; updated\_at timestamptz DEFAULT now()

);

CREATE INDEX ix\_accounts\_tenant\_type ON accounts(tenant\_id, type);



Tabela transactions (ledger)

CREATE TABLE transactions (

&nbsp; id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; tenant\_id uuid NOT NULL REFERENCES tenants(id),

&nbsp; account\_id uuid NOT NULL REFERENCES accounts(id),

&nbsp; counterparty\_account\_id uuid,

&nbsp; type text NOT NULL,

&nbsp; amount numeric(20,6) NOT NULL CHECK (amount >= 0),

&nbsp; currency char(3) NOT NULL,

&nbsp; status text NOT NULL DEFAULT 'pending',

&nbsp; occurred\_at timestamptz NOT NULL DEFAULT now(),

&nbsp; reference text,

&nbsp; description text,

&nbsp; category\_id uuid,

&nbsp; receipt\_id uuid,

&nbsp; metadata jsonb,

&nbsp; created\_at timestamptz DEFAULT now(),

&nbsp; updated\_at timestamptz DEFAULT now()

);

CREATE INDEX ix\_transactions\_account\_occurred ON transactions (account\_id, occurred\_at DESC);

CREATE INDEX ix\_transactions\_tenant\_occurred ON transactions (tenant\_id, occurred\_at DESC);



Outbox (event-driven)

CREATE TABLE events\_outbox (

&nbsp; id bigserial PRIMARY KEY,

&nbsp; tenant\_id uuid,

&nbsp; aggregate text,

&nbsp; aggregate\_id uuid,

&nbsp; event\_type text NOT NULL,

&nbsp; payload jsonb NOT NULL,

&nbsp; status text DEFAULT 'pending',

&nbsp; attempts int DEFAULT 0,

&nbsp; created\_at timestamptz DEFAULT now(),

&nbsp; sent\_at timestamptz

);

CREATE INDEX ix\_outbox\_status ON events\_outbox (status, created\_at);





Adapte tipos ENUMs como CREATE TYPE tx\_status AS ENUM ('pending','posted','failed','reversed'); se preferir maior rigidez.



7 — Estratégia de migração e versionamento



Ferramenta: Use prisma migrate para desenvolvimento; gerencie migrações SQL revisadas para produção. Alternativa: sqitch ou flyway.



Processo:



Criar migration no branch feature.



Revisão de DBA/peer.



Testes de migração em staging com snapshot de dados.



Aplicar em produção em janela (rolling) ou com feature flags.



Dicas:



Evitar ALTER COLUMN TYPE bloqueante; usar técnica de ADD COLUMN + backfill + swap.



Para grandes migrações, usar pg\_repack e criar colunas novas em paralelo.



8 — Backup, RTO/RPO, retenção



Backups: snapshots diários (full), WAL continuous (Point-in-time recovery) — armazenados fora da região (S3/GCS com lifecycle).



RTO/RPO: configurar conforme SLAs; por exemplo RTO 1h e RPO 15min para dados críticos.



Retenção: logs audit e outbox: manter ao menos 1 ano; dados sensíveis: política GDPR (direito ao esquecimento) — anonimize ou delete mediante request.



Testes: drills de restauração trimestrais.



9 — Índices, particionamento e performance



Índices recomendados:



transactions (account\_id, occurred\_at DESC)



transactions (tenant\_id, occurred\_at)



users (tenant\_id, lower(email)) unique



events\_outbox (status, created\_at)



Particionamento:



Particionar transactions por range de occurred\_at (mensal/trimestral) para manter performance e permitir pruning.



Alternativa: particionamento por tenant\_id se tenants muito grandes isoladamente.



Vacuum \& Autovacuum:



Ajustar autovacuum para tabelas de alto volume (transactions, events\_outbox).



Writes de alto volume:



Batch inserts para transactions e outbox via COPY ou bulk APIs.



Evite transações longas. Para ledger, preferir insert-only e consistência eventual para cálculos de saldo (reconciliar com jobs).



10 — Observabilidade e monitoramento de BD



Métricas a coletar: connections, cache hit ratio, slow queries, locks, replication lag, autovacuum runs, long transactions, disk usage.



Ferramentas: pg\_stat\_statements, Datadog/Prometheus + Grafana, pgwatch2.



Alertas: queries > X ms, replication lag > Y s, free disk < 15%, too many connections.



11 — Segurança, criptografia, PII/GDPR



Acesso: least privilege, roles DB separados (app\_read, app\_write, admin).



Criptografia: dados em trânsito (TLS), em repouso (disk encryption). Para PII sensível (document IDs, SSNs) usar pgcrypto para criptografia at-rest campo-a-campo ou usar vault.



Hashing de senhas: bcrypt/argon2 fora do DB (app), somente store hash.



Masking/Redaction: views com columns mascarados para acesso de suporte.



Logging: auditoria de tabela audit\_logs para ações CRUD críticas.



Data deletion: implementar soft-delete + purge pipeline para conformidade.



12 — Estratégia de dados para eventos e CDC



Outbox Pattern: escrever eventos na tabela events\_outbox na mesma transação da mutação; worker consome e publica no broker (Kafka/Rabbit).



CDC: usar Debezium (logical replication) para sincronizar mudanças ao data pipeline.



Formato de eventos: JSON Schema para payloads; incluir event\_id, aggregate, aggregate\_id, occurred\_at, tenant\_id, version.



Idempotência: eventos contendo unique event\_id para deduplicação.



13 — Testes, QA e dados sintéticos



Seeds: criar seeds/ com factories para popular DB em dev/staging.



Synthetic Data Pack: (ver documento separado) — incluir realistic fixtures: transactions history, product catalogs, inventory scenarios, user churn, fraud patterns.



Test strategy: unit tests (prisma client mocks), integration tests (testcontainers ou ephemeral DB), migration tests (apply/rollback).



14 — Anexos e exemplos práticos

Exemplo de consulta: saldo por conta

SELECT account\_id,

&nbsp;      SUM(CASE WHEN type='credit' THEN amount ELSE -amount END) AS delta

FROM transactions

WHERE account\_id = $1

&nbsp; AND status = 'posted'

GROUP BY account\_id;



Exemplo: reconciliar balance (batch)



Calcular sum(posted credits) - sum(posted debits) por account.



Atualizar accounts.balance com o valor recalculado via job idempotente reconcile\_accounts.



ER textual (resumo)



tenants (1) <-> (N) users



users (1) <-> (N) accounts



accounts (1) <-> (N) transactions



transactions (N) -> optional -> receipts



products (1) <-> (N) inventory entries



orders referenciam carts e users



Guidelines de Naming (convenção)



Tabela: snake\_case\_plural => transactions, event\_outbox



PK: id (UUID) — função geradora gen\_random\_uuid()



FK: <entity>\_id — indexar colunas FK se frequentemente consultadas



Index: ix\_<table>\_<cols>; Unique index: ux\_<table>\_<cols>



Migrations: YYYYMMDDHHMM\_description.sql ou V{numero}\_\_description.sql (Flyway style)



Files schema: schema.prisma, SQL exports schema.sql, seeds seed.\*



Checklist de entrega / Implementação



&nbsp;Criar schema no repository: db/schema.prisma + db/migrations/\*



&nbsp;Implementar outbox e consumer para eventos



&nbsp;Criar jobs: reconcile balances, prune old transactions, archive partitions



&nbsp;Configurar backups/PITR e testar restores



&nbsp;Monitoramento: pg\_stat\_statements + dashboards



&nbsp;Seed + synthetic dataset para QA



&nbsp;Policies de segurança e roles

