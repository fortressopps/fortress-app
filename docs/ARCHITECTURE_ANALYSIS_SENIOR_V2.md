# Análise de Arquitetura — Fortress App v7.24 (pós Fases 1–3)

**Papel:** Arquiteto de Software Sênior  
**Data:** 2025-01-31  
**Escopo:** Estado atual do repositório após execução das Fases 1, 2 e 3 do plano de ação

---

## 1. Arquitetura atual (atualizada)

### 1.1 Visão geral

O Fortress é um **monorepo npm workspaces** com dois pacotes:

- **`frontend/`** — SPA React 18 + Vite 4 + React Router 7. Deploy na Vercel.
- **`backend/`** — API Node (ESM) com Hono 4 + Prisma (PostgreSQL). Porta 3001.

A documentação de referência está em **`FORTRESS_DOCS_V7/`** (Blueprint v7.24, PFS, runbooks). A arquitetura alvo é **hexagonal / DDD**; o backend já segue camadas **server → routes → modules (domain + infra)** e o frontend separa **router → context → pages → components → api**.

### 1.2 Backend — estado atual

| Camada / Conceito | Localização | Descrição |
|-------------------|-------------|-----------|
| **Entrypoint** | `backend/src/main.server.ts` | Cria app Hono, chama `bootstrap(app)`, sobe servidor com `serve()` na porta **ENV.PORT**, registra **gracefulShutdown(server)**. |
| **Bootstrap** | `backend/src/server/bootstrap.ts` | Ordem: `initInfra()` → `applySecurity(app)` → `registerHealthRoutes(app)` → `registerModuleRoutes(app)`. |
| **Infra init** | `backend/src/libs/infra.init.ts` | Conecta Prisma; Redis comentado. |
| **Segurança** | `backend/src/libs/security.ts` | CORS (origem permitida), headers (X-Content-Type-Options, X-Frame-Options, CSP em produção), tratamento de OPTIONS. |
| **Rotas** | `backend/src/server/routes/` | **health.routes.ts**: `GET /health`. **auth.routes.ts**: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /users/me`. **index.routes.ts**: monta auth em `/`, supermarket em `/supermarket`, `GET /` com mensagem. |
| **Auth** | `backend/src/server/routes/auth.routes.ts` | Login (email/senha, pbkdf2), refresh (cookie `fortress_refresh`), logout, me (Bearer). JWT access 15m, refresh 7d. |
| **Supermarket** | `backend/src/modules/supermarket/` | **domain**: types, utils (CSV, pagination, currency). **infra**: repository (listas/itens, CRUD, transações). **supermarket.routes.ts**: rotas HTTP protegidas por auth (lists, items). **index.ts**: re-export domain + infra. |
| **Middleware** | `backend/src/middleware/auth.ts` | Verifica Bearer JWT, carrega user no Prisma, define `c.set('user', user)` para rotas protegidas. |
| **Pagination** | `backend/src/utils/pagination.ts`, `backend/src/shared/pagination/pagination.helper.ts` | Utils: `getPaginationParams`, `toSkipTake`, `getPaginationMetaWithOptions`. Helper: `applyPaginationPrisma` para modelos Prisma. |
| **Example** | `backend/src/modules/example/index.ts` | Placeholder (sem controller Express). |
| **Libs** | `backend/src/libs/` | prisma, logger, env (Zod), jwt (Hono/ENV), password (pbkdf2), appError (tipado), security, uuid, gracefulShutdown (Logger, CloseableServer). |
| **Persistência** | `backend/prisma/schema.prisma` | **User** (id, email, password?, name). **SupermarketList** (id, userId, name, budget?). **SupermarketItem** (id, listId, name, category, estimatedPrice, actualPrice?, quantity?, purchased?). **SupermarketCategory** (enum). Migrações: init, add_user_password, add_supermarket. |

**Stack efetiva:** Hono, @hono/node-server, Prisma, Pino, Zod, dotenv, jsonwebtoken, uuid. **Não utilizados no fluxo principal:** express, helmet, cors, cookie-parser, express-rate-limit, ioredis, compression (listados em `package.json`).

### 1.3 Frontend — estado atual

| Camada / Conceito | Localização | Descrição |
|-------------------|-------------|-----------|
| **Entrypoint** | `frontend/src/main.jsx` | Renderiza `<Router />` (de `router/index.jsx`). |
| **Roteamento** | `frontend/src/router/index.jsx` | **`/login`** → Login. **`/app`** → Protected → Dashboard. **`/try`** → App (TryFortress). **`/`** → App (landing: HomePage). Landing acessível em `/`. |
| **App (landing)** | `frontend/src/App.jsx` | Router interno: `/` → HomePage (Header, HeroSection, Benefits, Pricing, Footer), `/try` → TryFortress. |
| **Auth** | `frontend/src/context/AuthContext.jsx` | user, loading, login, logout; refresh no mount; chama `/auth/refresh`, `/auth/login`, `/users/me`. Backend implementado. |
| **API** | `frontend/src/api/axiosClient.js` | BaseURL **VITE_API_URL \|\| 'http://localhost:3001'**. Interceptor 401 com refresh; Bearer token; withCredentials. |
| **Páginas** | `frontend/src/pages/` | Login (redireciona para `/app`), Dashboard (boas-vindas + logout). |
| **Componentes** | `frontend/src/components/` | Header, HeroSection, Benefits, Pricing, Footer, TryFortress, SupermarketMode (placeholder), Layout, Common/Button, etc. |

**Stack:** React 18, React Router 7, Vite 4, axios (usado em `axiosClient.js`; **não listado** em `frontend/package.json` — dependência implícita ou omitida).

### 1.4 DevOps e deploy

- **CI:** `.github/workflows/ci.yml` — apenas **build do frontend** (Node 20). Backend não é buildado nem testado no CI.
- **Deploy:** `vercel.json` — `framework: "nextjs"` (inconsistente: app é Vite+React); build do frontend; backend fora da Vercel.
- **Testes backend:** Vitest; `backend/test/pagination.spec.ts` (5 testes); `npm test` no backend.
- **Scripts:** `scripts/` (init-dev, setup-dev, doctor). Husky pre-commit + lint-staged.

---

## 2. Conquistas (Fases 1–3)

| Fase | Entregas |
|------|----------|
| **1** | Auth API (login, refresh, me, logout); JWT adaptado ao Hono e ENV; roteamento frontend corrigido (/ = landing, /app = Dashboard); API URL default 3001; CORS; migração e seed (User.password); ENV e gracefulShutdown em main.server. |
| **2** | Schema Supermarket (SupermarketList, SupermarketItem, enum); rotas HTTP Supermarket protegidas por auth; middleware auth; gracefulShutdown com Logger; supermarket index e utils corrigidos. |
| **3** | Pagination unificada em `src/utils/pagination.ts`; helper corrigido; remoção de DTO/Pipe NestJS e de server.ts Express; example reduzido a placeholder; tsconfig sem excludes de código ativo; testes pagination passando. |

---

## 3. Gaps e riscos restantes

### 3.1 Médios

| Gap | Onde | Impacto |
|-----|------|---------|
| **CI sem backend** | `.github/workflows/ci.yml` | Backend pode quebrar em PR sem feedback; testes e build do backend não rodam no pipeline. |
| **axios não declarado no frontend** | `frontend/package.json` | `axios` é usado em `axiosClient.js` mas não aparece em dependencies; risco de build/install inconsistente. |
| **vercel.json com framework Next.js** | `vercel.json` | App é Vite+React; pode confundir ferramentas ou comportamentos de deploy. |
| **Dependências backend não usadas** | `backend/package.json` | express, helmet, cors, cookie-parser, express-rate-limit, ioredis, compression não são usados; aumenta superfície e ruído. |
| **Credenciais default no Login** | `frontend/src/pages/Login.jsx` | Valores iniciais `ops@fortress.local` / `devpass`; risco se expostos em produção. |
| **Tratamento de erro no login** | `frontend/src/pages/Login.jsx` | Uso de `alert('Credenciais inválidas')`; experiência ruim e pouco acessível. |

### 3.2 Baixos / melhoria contínua

| Gap | Onde | Impacto |
|-----|------|---------|
| **SupermarketMode / TryFortress** | `frontend/src/components/` | SupermarketMode é placeholder; TryFortress não chama API Supermarket; funcionalidade de listas não exposta na UI. |
| **Sem rota de registro** | Backend + frontend | Apenas login; criação de usuário depende de seed ou outro canal. |
| **Sem rate limit na API** | Backend | express-rate-limit está no package mas não aplicado; risco de abuso em endpoints públicos. |
| **Config Clerk não utilizada** | `backend/src/config/clerk.ts` | Código morto ou preparação para auth alternativa. |
| **Backups e arquivos .backup** | `frontend/src/components/` | Header.jsx.backup, HeroSection.jsx.backup; poluição no repositório. |
| **Nome do workflow CI** | `.github/workflows/ci.yml` | Ainda referencia "v7.22". |

---

## 4. Próximas prioridades sugeridas

### 4.1 Fase 4 (estabilização e DevOps)

| # | Ação | Arquivos / área | Prioridade |
|---|------|------------------|------------|
| 1 | Incluir backend no CI (install, prisma generate, build, test) | `.github/workflows/ci.yml` | Alta |
| 2 | Declarar `axios` em `frontend/package.json` | `frontend/package.json` | Alta |
| 3 | Ajustar `vercel.json` (remover ou corrigir framework) | `vercel.json` | Média |
| 4 | Melhorar Login: estado de erro na UI, credenciais default só em dev | `frontend/src/pages/Login.jsx` | Média |
| 5 | Remover ou documentar dependências não usadas no backend | `backend/package.json` | Baixa |

### 4.2 Fase 5 (produto e segurança)

| # | Ação | Prioridade |
|---|------|------------|
| 1 | Conectar TryFortress/SupermarketMode à API Supermarket (listas, itens) | Alta |
| 2 | Rota de registro (POST /auth/register) + validação e hash de senha | Média |
| 3 | Rate limit em rotas públicas (login, refresh) | Média |
| 4 | Remover arquivos .backup e atualizar nome do workflow CI | Baixa |

### 4.3 Alinhamento ao Blueprint v7.24

- Observabilidade: logs estruturados (Pino já em uso); métricas e health avançado (readiness com Prisma/Redis).
- Notificações / Insights (PFS 4D, 4E): após Supermarket e auth estáveis.
- Revisão de módulos por bounded context (DDD) e contratos de API (FORTRESS_DOCS_V7).

---

## 5. Recomendações de código e processo

### 5.1 Backend

- **Path aliases:** Manter imports relativos ou introduzir `paths` no `tsconfig` (ex.: `@/libs/*`, `@/utils/*`) para consistência; hoje não há alias.
- **Tratamento de erros:** Padronizar respostas de erro (ex.: `{ error: string, code?: string }`) e usar `AppError` onde fizer sentido; algumas rotas já retornam `{ error: "..." }`.
- **Validação:** Manter Zod em body/query nas rotas; evitar lógica de negócio em handlers (delegar a domain/services quando crescer).
- **Testes:** Aumentar cobertura (auth routes, supermarket routes, middleware); manter pagination como base.

### 5.2 Frontend

- **Estado de erro no login:** Substituir `alert` por estado local (ex.: `errorMessage`) e exibir na UI; desabilitar botão durante submit.
- **Credenciais default:** Usar apenas quando `import.meta.env.DEV === true` ou remover em produção.
- **Tipagem:** Avaliar migração gradual para TypeScript (começar por `api/`, `context/`, `router/`).
- **Supermarket na UI:** Criar página/fluxo que liste e edite listas/itens via API existente.

### 5.3 DevOps e qualidade

- **CI:** Job de backend com `npm ci`, `npx prisma generate`, `npm run build`, `npm test`; falhar o pipeline se testes falharem.
- **Ambiente:** Manter `.env.example` (ou documentação) para backend e frontend (ex.: `VITE_API_URL`); não versionar `.env`.
- **Dependências:** Revisar `backend/package.json` e remover pacotes não utilizados; reduzir vulnerabilidades e ruído.

---

## 6. Diagrama de contexto atual (resumo)

```
[Browser]
    │
    ├── /          → Landing (HomePage)
    ├── /login     → Login
    ├── /app       → Dashboard (protegido)
    └── /try       → TryFortress
    │
    ▼
[Frontend - Vite:3000]
    │  AuthContext → axiosClient (Bearer, refresh)
    ▼
[Backend - Hono:3001]
    │
    ├── GET  /health
    ├── GET  /
    ├── POST /auth/login, /auth/refresh, /auth/logout
    ├── GET  /users/me
    └── /supermarket/* (auth) → lists, items
    │
    ▼
[Prisma → PostgreSQL]
    User, SupermarketList, SupermarketItem
```

---

## 7. Referência rápida de arquivos

| Área | Caminhos principais |
|------|---------------------|
| Backend entry | `backend/src/main.server.ts` |
| Bootstrap | `backend/src/server/bootstrap.ts` |
| Auth API | `backend/src/server/routes/auth.routes.ts` |
| Supermarket API | `backend/src/modules/supermarket/supermarket.routes.ts` |
| Auth middleware | `backend/src/middleware/auth.ts` |
| Pagination | `backend/src/utils/pagination.ts`, `backend/src/shared/pagination/pagination.helper.ts` |
| Schema | `backend/prisma/schema.prisma` |
| Frontend router | `frontend/src/router/index.jsx` |
| Auth context | `frontend/src/context/AuthContext.jsx` |
| API client | `frontend/src/api/axiosClient.js` |
| CI | `.github/workflows/ci.yml` |
| Docs | `FORTRESS_DOCS_V7/`, `docs/ARCHITECTURE_ANALYSIS_AND_ACTION_PLAN.md` |

---

**Conclusão:** O projeto está em estado estável após as Fases 1–3: auth e Supermarket funcionais, pagination unificada, código morto removido. Os próximos passos naturais são **Fase 4** (CI backend, axios, vercel, Login) e **Fase 5** (UI Supermarket, registro, rate limit), alinhados ao Blueprint e ao roadmap v7.24.
