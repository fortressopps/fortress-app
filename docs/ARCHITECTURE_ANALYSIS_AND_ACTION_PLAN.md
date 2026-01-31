# Análise de Arquitetura e Plano de Ação — Fortress App v7.24

**Autor:** Arquiteto de Software Senior  
**Data:** 2025-01-31  
**Escopo:** Projeto completo (backend, frontend, DevOps, documentação)

---

## 1. Arquitetura Atual

### 1.1 Visão geral

O Fortress é um **monorepo npm workspaces** com dois pacotes: `frontend` (SPA React + Vite) e `backend` (API Node + Hono + Prisma). A documentação de referência está em `FORTRESS_DOCS_V7/` (Blueprint v7.24, PFS, runbooks). A arquitetura alvo é **hexagonal / DDD**, com camadas **app → domain → infra**; na prática, parte do código ainda não está alinhada a esse modelo.

### 1.2 Backend

| Camada / Conceito | Localização | Descrição |
|-------------------|-------------|-----------|
| **Entrypoint** | `backend/src/main.server.ts` | Cria app Hono, chama `bootstrap(app)`, sobe servidor na porta `process.env.PORT \|\| 3001`. **Não usa** `ENV` de `libs/env.ts` nem `gracefulShutdown`. |
| **Bootstrap** | `backend/src/server/bootstrap.ts` | Ordem: `initInfra()` → `applySecurity(app)` → `registerHealthRoutes(app)` → `registerModuleRoutes(app)`. |
| **Infra init** | `backend/src/libs/infra.init.ts` | Conecta Prisma; Redis comentado. |
| **Segurança** | `backend/src/libs/security.ts` | Middleware global com headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.). |
| **Rotas** | `backend/src/server/routes/` | `health.routes.ts`: `GET /health`. `index.routes.ts`: apenas `GET /` com mensagem; **nenhuma rota de módulo montada**. |
| **Módulos** | `backend/src/modules/` | **example**: `example.controller.ts` (Express-style, `prisma.item`, paths quebrados). **supermarket**: `domain/` (types, utils), `infra/repository.ts`; `index.ts` exporta controllers/services inexistentes; repositório usa modelos Prisma que **não existem** no schema. |
| **Shared** | `backend/src/shared/pagination/` | DTO/helper/pipe com imports para `utils/pagination` inexistente e dependências NestJS/class-validator não listadas no `package.json`. |
| **Libs** | `backend/src/libs/` | `prisma.ts`, `logger.ts` (export `Logger`), `env.ts` (Zod), `jwt.ts` (Express-style), `appError.ts`, `security.ts`, `uuid.ts`, `gracefulShutdown.ts` (importa `fortressLogger` que **não existe** em `logger.ts`). |
| **Middleware** | `backend/src/middleware/auth.ts` | Vazio (apenas comentário). |
| **Persistência** | `backend/prisma/schema.prisma` | PostgreSQL; único modelo: `User` (id, email, name, createdAt, updatedAt). |

**Stack efetiva:** Hono + @hono/node-server, Prisma, Pino, Zod, dotenv. Express, helmet, cors, cookie-parser, express-rate-limit, ioredis estão no `package.json` mas **não são usados** no fluxo principal (apenas `server.ts` Express não utilizado).

### 1.3 Frontend

| Camada / Conceito | Localização | Descrição |
|-------------------|-------------|-----------|
| **Entrypoint** | `frontend/src/main.jsx` | Renderiza `<Router />` (de `router/index.jsx`). |
| **Roteamento** | `frontend/src/router/index.jsx` | `BrowserRouter` + `AuthProvider`. Rotas: `/login` → Login; `/` → `Protected` → Dashboard; `*` → `App`. **Landing (HomePage)** está dentro de `App.jsx` e só é acessível quando `*` coincide; como `/` é Dashboard, a rota `/` interna de `App` **nunca** é atingida — landing inacessível. |
| **App (landing)** | `frontend/src/App.jsx` | Router interno: `/` → HomePage (Header, HeroSection, Benefits, Pricing, Footer), `/try` → TryFortress. Usado como fallback para `*`. |
| **Auth** | `frontend/src/context/AuthContext.jsx` | Estado user/loading; login, logout; refresh no mount; chama `/auth/refresh`, `/auth/login`, `/auth/logout`, `/users/me` — **nenhuma implementada no backend**. |
| **API** | `frontend/src/api/axiosClient.js` | BaseURL `VITE_API_URL \|\| 'http://localhost:4000'`; backend sobe em **3001** — mismatch. Interceptor 401 com refresh; Bearer token. |
| **Páginas** | `frontend/src/pages/` | Login (credenciais default), Dashboard (boas-vindas + logout). |
| **Componentes** | `frontend/src/components/` | Header, HeroSection, Benefits, Pricing, Footer, TryFortress, Dashboard, SupermarketMode (placeholder), Layout, Common/Button, etc. |

**Stack:** React 18, React Router 7, Vite 4. Sem biblioteca de UI; CSS por componente. Sem axios no `package.json` (possível dependência transitiva ou omitida).

### 1.4 DevOps e deploy

- **CI:** `.github/workflows/ci.yml` — apenas build do frontend (Node 20, `npm install` + `npm run build` no `frontend/`). Backend explicitamente ignorado.
- **Deploy:** `vercel.json` — `framework: "nextjs"` (app é Vite+React); build do frontend; backend não deployado pela Vercel.
- **Scripts:** `scripts/` (init-dev, setup-dev, doctor). Husky pre-commit + lint-staged.

### 1.5 Documentação

- `FORTRESS_DOCS_V7/` — Blueprint, data model, DB spec, event catalog, observability, runbooks, PFS (Supermarket, Notificações, etc.), security, method guide.
- `README.md` — Visão v7.23→v7.24, estrutura alvo (app/domain/infra), princípios hexagonais; parte da estrutura descrita não coincide com a pasta atual (ex.: app/domain/core/infra).

### 1.6 Diagrama de dependências (resumo)

```
[main.server.ts] → bootstrap → initInfra (Prisma) + security + health.routes + index.routes
[index.routes]   → GET / only; no module routes
[Frontend]      → AuthContext → axiosClient → VITE_API_URL:4000 → (no backend auth routes)
[Router]        → / → Dashboard, * → App (/, /try) → Landing unreachable at /
```

---

## 2. Gaps técnicos

### 2.1 Críticos (bloqueiam uso em produção)

| Gap | Arquivos envolvidos | Descrição |
|-----|---------------------|-----------|
| **Auth backend inexistente** | `frontend/src/context/AuthContext.jsx`, `frontend/src/api/axiosClient.js` | Frontend chama `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /users/me`. Nenhuma rota implementada em `backend/src/server/routes/` ou em módulos. Login/refresh sempre falham. |
| **Porta API incorreta** | `frontend/src/api/axiosClient.js` | Default `http://localhost:4000`; backend em `backend/src/main.server.ts` usa porta **3001**. |
| **Schema Prisma vs módulo Supermarket** | `backend/prisma/schema.prisma`, `backend/src/modules/supermarket/infra/supermarket.repository.ts`, `backend/src/modules/supermarket/domain/supermarket.types.ts` | Schema só tem `User`. Repositório e types usam `SupermarketList`, `SupermarketItem`, `SupermarketCategory` — não existem. Build/run quebrados se o módulo for importado. |
| **Landing inacessível** | `frontend/src/router/index.jsx`, `frontend/src/App.jsx` | Rota `/` no router principal é Dashboard. HomePage (HeroSection, Benefits, Pricing) está em `App` com path `/` interno; esse `/` nunca é alcançado. |
| **Supermarket index quebrado** | `backend/src/modules/supermarket/index.ts` | `export * from "@/controllers/supermarketController"` e `"@/services/supermarketService"` — arquivos/pastas inexistentes; `tsconfig.json` não define alias `@/`. |

### 2.2 Altos (código quebrado ou inconsistente)

| Gap | Arquivos envolvidos | Descrição |
|-----|---------------------|-----------|
| **Pagination shared** | `backend/src/shared/pagination/pagination.helper.ts`, `pagination.dto.ts`, `pagination.pipe.ts`, `backend/test/pagination.spec.ts` | Helper importa `../../../../utils/pagination`; DTO/Pipe importam `../../../utils/pagination` e usam NestJS/class-validator. Arquivo `utils/pagination` não existe; dependências não estão no `package.json`. Teste importa `../utils/pagination`. |
| **Example controller** | `backend/src/modules/example/example.controller.ts` | Assinatura Express (req, res); import `../../common/utils/pagination.helper.js`; usa `prisma.item`. Path e modelo incorretos; não integrado ao Hono. |
| **Supermarket utils** | `backend/src/modules/supermarket/domain/supermarket.utils.ts` | Imports `@/utils/appError` e `@/utils/logger`; projeto usa `libs/appError.ts` e `libs/logger.ts`; sem alias `@/` no tsconfig. |
| **Logger vs fortressLogger** | `backend/src/libs/logger.ts`, `backend/src/libs/gracefulShutdown.ts` | `logger.ts` exporta `Logger`; `gracefulShutdown.ts` importa `fortressLogger` — nome inexistente; `gracefulShutdown` não é chamado em `main.server.ts`. |
| **Middleware auth vazio** | `backend/src/middleware/auth.ts` | Apenas comentário; nenhuma proteção de rotas. |

### 2.3 Médios (dívida técnica e risco)

| Gap | Arquivos envolvidos | Descrição |
|-----|---------------------|-----------|
| **Código morto / duplicado** | `backend/src/server/server.ts` | Express com `/health`; app real é Hono em `main.server.ts`. |
| **JWT em estilo Express** | `backend/src/libs/jwt.ts` | Usa `res.cookie`, `user._id`, `process.env` direto; não integrado ao Hono nem ao `ENV` validado. |
| **Credenciais default no Login** | `frontend/src/pages/Login.jsx` | Estado inicial `ops@fortress.local` / `devpass` — risco se exposto em produção. |
| **Vercel framework** | `vercel.json` | `"framework": "nextjs"` com app Vite+React. |
| **ENV no main** | `backend/src/main.server.ts` | Usa `process.env.PORT` em vez de `ENV.PORT` de `libs/env.ts`. |

---

## 3. Próximas features prioritárias

Priorização alinhada à documentação (PFS Supermarket, auth, observabilidade) e à remoção de bloqueios.

| Prioridade | Feature | Justificativa | Arquivos / ações |
|------------|---------|----------------|-----------------|
| **P0** | **Auth API (login, refresh, me)** | Desbloqueia Dashboard e fluxo logado. | Novo módulo ou rotas em `server/routes/`; usar `libs/jwt.ts` adaptado ao Hono; `libs/env.ts` para secrets. |
| **P0** | **Corrigir roteamento frontend** | Tornar landing acessível e separar app autenticada. | `frontend/src/router/index.jsx`: e.g. `/` → landing (App/HomePage), `/app` ou `/dashboard` → Protected Dashboard; ou mover landing para rota explícita. |
| **P0** | **Alinhar URL da API** | Garantir que front e back conversem em dev. | `frontend/src/api/axiosClient.js`: default 3001 ou documentar `VITE_API_URL`; `.env.example` no frontend. |
| **P1** | **Schema + rotas Supermarket** | PFS 4B e repositório já escritos; falta persistência e HTTP. | `backend/prisma/schema.prisma`: modelos SupermarketList, SupermarketItem, enum SupermarketCategory; migração; rotas Hono em `modules/supermarket/` (adapters/http); corrigir `index.ts` e imports em `supermarket.utils.ts`. |
| **P1** | **Middleware auth e proteção de rotas** | Garantir que apenas usuários autenticados acessem recursos. | `backend/src/middleware/auth.ts`: validar JWT e anexar user ao context Hono; aplicar em rotas de módulos. |
| **P2** | **TryFortress + SupermarketMode funcionais** | Conectar UI à API Supermarket (listas/itens). | `frontend/src/components/TryFortress/TryFortress.jsx`, `SupermarketMode/SupermarketMode.jsx`: chamadas ao backend; rota `/try/supermarket` ou modal. |
| **P2** | **Readiness / observabilidade** | Blueprint v7 e operação. | `backend/src/server/routes/health.routes.ts`: e.g. `GET /ready` (Prisma + opcional Redis); logs estruturados (já Pino); métricas opcionais. |
| **P3** | **CI backend** | Garantir que backend compila e testes passam. | `.github/workflows/ci.yml`: job build + lint + testes do backend. |
| **P3** | **Notificações / Insights (PFS 4D, 4E)** | Conforme roadmap v7.24. | Novos módulos domain + infra + rotas; após Supermarket e auth estáveis. |

---

## 4. Recomendações de melhoria de código

### 4.1 Backend

- **Unificar entrada e env:** Em `main.server.ts` usar `ENV` de `libs/env.ts` para porta e config; registrar `gracefulShutdown` com o servidor Hono (e corrigir import para `Logger` em `gracefulShutdown.ts`).  
  Arquivos: `backend/src/main.server.ts`, `backend/src/libs/gracefulShutdown.ts`, `backend/src/libs/logger.ts`.

- **Path aliases:** Em `backend/tsconfig.json` adicionar `"paths": { "@/*": ["./src/*"] }` e `"baseUrl": "."`. Corrigir imports em `supermarket/index.ts` e `supermarket.utils.ts` para usar `@/libs/...` ou remover re-export quebrado até os adapters existirem.  
  Arquivos: `backend/tsconfig.json`, `backend/src/modules/supermarket/index.ts`, `backend/src/modules/supermarket/domain/supermarket.utils.ts`.

- **Pagination:** Criar `backend/src/shared/pagination/utils.ts` (ou `backend/src/utils/pagination.ts`) com `getPaginationParams`, `getPaginationMetaWithOptions`, `toSkipTake`; fazer `pagination.helper.ts` e o teste importarem daí. Remover ou substituir DTO/Pipe NestJS por validação Zod se o backend for 100% Hono.  
  Arquivos: `backend/src/shared/pagination/*`, `backend/test/pagination.spec.ts`.

- **Example module:** Remover `example.controller.ts` ou reescrever para Hono (context `c`), usar `shared/pagination` corrigido e modelo existente (ex.: `User`) para listagem; não usar `prisma.item`.  
  Arquivo: `backend/src/modules/example/example.controller.ts`.

- **JWT e auth:** Adaptar `libs/jwt.ts` para Hono: receber/retornar tokens via body/headers (e opcionalmente cookies); usar `ENV.JWT_SECRET`; não assumir `res` Express nem `user._id` (usar `user.id` do Prisma).  
  Arquivo: `backend/src/libs/jwt.ts`.

- **Remover código morto:** Excluir ou deixar de importar `backend/src/server/server.ts` se não houver plano de uso do Express.  
  Arquivo: `backend/src/server/server.ts`.

- **AppError tipado:** Converter `libs/appError.ts` para TypeScript com tipos explícitos e alinhar ao uso em `supermarket.utils.ts`.  
  Arquivo: `backend/src/libs/appError.ts`.

### 4.2 Frontend

- **Roteamento:** Definir claramente “marketing” vs “app”: e.g. `/` = landing, `/login` = Login, `/app` (ou `/dashboard`) = Dashboard protegida, `/try` = TryFortress. Evitar rota `*` que renderiza um Router com `/` interno; usar uma única árvore de rotas coerente.  
  Arquivos: `frontend/src/router/index.jsx`, `frontend/src/App.jsx`, `frontend/src/main.jsx` (se necessário).

- **Tratamento de erro no login:** Substituir `alert('fail')` por estado de erro e mensagem na UI.  
  Arquivo: `frontend/src/pages/Login.jsx`.

- **Credenciais default:** Manter apenas em desenvolvimento (e.g. `import.meta.env.DEV`) ou remover; nunca em produção.  
  Arquivo: `frontend/src/pages/Login.jsx`.

- **Variáveis de ambiente:** Documentar `VITE_API_URL` no README ou `.env.example` do frontend; garantir valor default 3001 em dev.  
  Arquivos: `frontend/.env.example` (se existir), `README.md`, `frontend/src/api/axiosClient.js`.

### 4.3 DevOps e config

- **CI:** Incluir job para backend: install, `prisma generate`, build, testes (e.g. `pagination.spec.ts` após correção).  
  Arquivo: `.github/workflows/ci.yml`.

- **Vercel:** Ajustar `vercel.json` para refletir stack (ex.: não declarar Next.js se for apenas Vite; ou manter apenas build command).  
  Arquivo: `vercel.json`.

- **Dependências:** Remover do `backend/package.json` pacotes não utilizados (express, helmet, cors, cookie-parser, express-rate-limit, etc.) ou documentar uso futuro; adicionar `class-validator`/`class-transformer` apenas se manter DTOs com essa stack.  
  Arquivo: `backend/package.json`.

---

## 5. Plano de ação com estimativas

Estimativas em **dias úteis (d)** para um dev familiarizado com o projeto; podem ser paralelizadas onde indicado.

### Fase 1 — Desbloqueio (P0)

| # | Ação | Arquivos principais | Est. |
|---|------|---------------------|------|
| 1.1 | Implementar rotas auth: POST /auth/login, POST /auth/refresh, GET /users/me (e opcional POST /auth/logout) | `backend/src/server/routes/` ou `backend/src/modules/auth/`, `libs/jwt.ts` | 2 d |
| 1.2 | Ajustar JWT para Hono (sem Express res) e usar ENV | `backend/src/libs/jwt.ts` | 0.5 d |
| 1.3 | Corrigir roteamento: `/` = landing, `/app` ou `/dashboard` = Dashboard protegida | `frontend/src/router/index.jsx`, `App.jsx` | 0.5 d |
| 1.4 | Default da API para porta 3001 e documentar VITE_API_URL | `frontend/src/api/axiosClient.js`, README ou .env.example | 0.25 d |

**Subtotal Fase 1:** ~3,25 d.

### Fase 2 — Consistência e Supermarket (P1)

| # | Ação | Arquivos principais | Est. |
|---|------|---------------------|------|
| 2.1 | Adicionar modelos Supermarket ao Prisma + migração | `backend/prisma/schema.prisma`, nova migration | 1 d |
| 2.2 | Corrigir `supermarket/index.ts` (remover exports quebrados ou criar controllers/services e usar paths corretos) | `backend/src/modules/supermarket/index.ts` | 0.5 d |
| 2.3 | Corrigir imports em `supermarket.utils.ts` (libs/appError, libs/logger) e alias @ no tsconfig | `backend/tsconfig.json`, `supermarket/domain/supermarket.utils.ts` | 0.25 d |
| 2.4 | Implementar rotas HTTP Supermarket (listas, itens) e montar em index.routes | `backend/src/modules/supermarket/`, `server/routes/index.routes.ts` | 1.5 d |
| 2.5 | Implementar middleware auth e proteger rotas de módulos | `backend/src/middleware/auth.ts`, rotas | 0.5 d |
| 2.6 | Corrigir gracefulShutdown (Logger) e integrar em main.server + ENV para porta | `backend/src/libs/gracefulShutdown.ts`, `main.server.ts` | 0.25 d |

**Subtotal Fase 2:** ~4 d.

### Fase 3 — Pagination, example e limpeza (P1/P2)

| # | Ação | Arquivos principais | Est. |
|---|------|---------------------|------|
| 3.1 | Criar utils de pagination e corrigir helper/dto/pipe e teste | `backend/src/shared/pagination/`, `backend/test/pagination.spec.ts` | 1 d |
| 3.2 | Remover ou reescrever example.controller para Hono | `backend/src/modules/example/example.controller.ts` | 0.5 d |
| 3.3 | Remover server.ts Express ou documentar como não usado | `backend/src/server/server.ts` | 0.25 d |
| 3.4 | Tipar AppError e usar ENV em main.server | `backend/src/libs/appError.ts`, `main.server.ts` | 0.25 d |

**Subtotal Fase 3:** ~2 d.

### Fase 4 — Frontend e DevOps (P2/P3)

| # | Ação | Arquivos principais | Est. |
|---|------|---------------------|------|
| 4.1 | Conectar TryFortress/SupermarketMode à API Supermarket | `frontend/src/components/TryFortress/TryFortress.jsx`, `SupermarketMode/SupermarketMode.jsx` | 1 d |
| 4.2 | Melhorar Login (erro na UI, credenciais só em dev) | `frontend/src/pages/Login.jsx` | 0.25 d |
| 4.3 | CI backend (build + testes) | `.github/workflows/ci.yml` | 0.5 d |
| 4.4 | Ajustar vercel.json e dependências backend | `vercel.json`, `backend/package.json` | 0.25 d |

**Subtotal Fase 4:** ~2 d.

### Resumo do plano

| Fase | Foco | Estimativa |
|------|------|------------|
| 1 | Desbloqueio (auth, rota, API URL) | ~3,25 d |
| 2 | Supermarket (schema, rotas, auth middleware, gracefulShutdown) | ~4 d |
| 3 | Pagination, example, limpeza | ~2 d |
| 4 | Frontend funcional e DevOps | ~2 d |
| **Total** | | **~11,25 d** |

Recomendação: executar Fase 1 primeiro (entrega login + landing acessível + API alinhada); em seguida Fase 2 para habilitar o módulo Supermarket e proteção de rotas; Fases 3 e 4 podem ser parcialmente paralelas (ex.: 3.1 + 4.1).

---

## Referência rápida de arquivos

| Área | Caminhos |
|------|----------|
| Backend entry | `backend/src/main.server.ts` |
| Bootstrap | `backend/src/server/bootstrap.ts` |
| Rotas | `backend/src/server/routes/health.routes.ts`, `index.routes.ts` |
| Schema | `backend/prisma/schema.prisma` |
| Módulo Supermarket | `backend/src/modules/supermarket/` (domain, infra, index.ts) |
| Pagination | `backend/src/shared/pagination/`, `backend/test/pagination.spec.ts` |
| Libs | `backend/src/libs/` (env, logger, jwt, prisma, security, appError, gracefulShutdown) |
| Frontend router | `frontend/src/router/index.jsx`, `frontend/src/App.jsx` |
| Auth frontend | `frontend/src/context/AuthContext.jsx`, `frontend/src/api/axiosClient.js` |
| CI | `.github/workflows/ci.yml` |
| Docs | `FORTRESS_DOCS_V7/architecture/architecture_blueprint_v_7.md`, `FORTRESS_DOCS_V7/master_index_v_7.md` |
