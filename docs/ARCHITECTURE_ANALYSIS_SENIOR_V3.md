# Análise de Arquitetura — Fortress App v7.24 (Visão Arquiteto Sênior)

**Papel:** Arquiteto de Software Sênior  
**Data:** 2026-02-01  
**Escopo:** Projeto completo (backend, frontend, DevOps, documentação, código-fonte)

---

## 1. Visão executiva

O **Fortress** é uma plataforma de finanças pessoais em formato **monorepo** (npm workspaces) com **frontend** (React + Vite) e **backend** (Node + Hono + Prisma). A documentação de referência (Blueprint v7.24, PFS, runbooks) está em `FORTRESS_DOCS_V7/`. A arquitetura alvo é **hexagonal/DDD**; o backend já segue camadas (server → routes → modules com domain/infra) e o frontend separa router, context, pages, components e api.

**Pontos fortes:** Documentação rica, schema Prisma completo (User, Supermarket, Goals), auth (login/refresh/logout/me) e módulo Supermarket implementados, CI com frontend e backend, ENV validado com Zod, graceful shutdown, middleware de auth JWT.

**Riscos críticos:** Senha armazenada em texto plano no registro; `loginSchema` indefinido (login quebra em runtime); uso de `user` antes da criação no registro; rotas Goals não montadas; uso de `require()` no router do frontend (incompatível com ESM/Vite); import de `Hono` ausente em `index.routes.ts`; middleware Express (rate-limit) em app Hono (incompatibilidade).

---

## 2. Stack e dependências

### 2.1 Backend

| Tecnologia | Uso | Observação |
|------------|-----|------------|
| **Hono** | App HTTP, rotas, middleware | Stack principal. |
| **@hono/node-server** | Servidor Node | `serve()` em main.server.ts. |
| **Prisma** | ORM, PostgreSQL | Schema com User, SupermarketList, SupermarketItem, Goal. |
| **Zod** | Validação de ENV e payloads | env.ts, auth e supermarket routes. |
| **pino** | Logs | Usado em auth.routes; logger central em libs/logger. |
| **jsonwebtoken** | JWT access/refresh | libs/jwt.ts. |
| **nodemailer** | Email (verificação) | auth.routes. |
| **dotenv** | Carregamento de .env | libs/env.ts. |
| **uuid** | Identificadores | Em uso em libs. |
| **express**, **express-rate-limit**, **helmet**, **cors**, **cookie-parser**, **compression**, **ioredis** | Declarados no package.json | **Não usados** no fluxo principal (Hono + security.ts). Aumentam superfície e ruído. |
| **passport**, **passport-google-oauth20**, **passport-microsoft** | OAuth | Usados ou preparados em oauth.routes. |

### 2.2 Frontend

| Tecnologia | Uso | Observação |
|------------|-----|------------|
| **React 18** | UI | |
| **Vite 4** | Build e dev server | README menciona Next.js; realidade é Vite. |
| **React Router 7** | Roteamento | Rotas: /, /login, /register, /app, /goals, /try, /verify-email, /oauth-callback. |
| **axios** | Cliente HTTP | Usado em api/axiosClient.js; **não declarado** em frontend/package.json (risco de dependência implícita). |

### 2.3 DevOps

- **CI:** GitHub Actions (ci.yml) — jobs `build-frontend` e `build-backend` (Node 20, install, build; backend também roda `npm test`).
- **Deploy:** Vercel (vercel.json com `framework: null` e buildCommand customizado); backend fora da Vercel.
- **Qualidade:** Husky pre-commit + lint-staged (lint em *.ts,*.js,*.jsx,*.tsx).

---

## 3. Arquitetura do backend

### 3.1 Fluxo de entrada

```
main.server.ts
  → bootstrap(app)
      → initInfra()        // Prisma, etc.
      → applySecurity(app)  // CORS, headers
      → registerHealthRoutes(app)
      → registerModuleRoutes(app)
  → serve({ fetch: app.fetch, port: ENV.PORT })
  → gracefulShutdown(server)
```

- **ENV:** Validado com Zod em `libs/env.ts` (DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET, SESSION_SECRET, APP_ENV, PORT).
- **Porta:** 3001 (default). Frontend já usa `VITE_API_URL || 'http://localhost:3001'`.

### 3.2 Rotas montadas

| Prefixo | Arquivo | Conteúdo |
|--------|---------|----------|
| `/` | auth.routes.ts | POST /auth/register, GET /auth/verify-email, POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /users/me |
| `/` | oauth.routes.ts | Rotas OAuth (Google/Microsoft) |
| `/supermarket` | supermarket.routes.ts | CRUD listas e itens (protegido por auth middleware) |
| `/` | GET / | Mensagem "Fortress API v7.24" |

**Problema:** `index.routes.ts` usa tipo `Hono` em `registerModuleRoutes(app: Hono)` mas **não importa** `Hono` — pode falhar em tipo/build conforme tsconfig.

**Problema:** `goals.routes.ts` existe e está implementado (GoalsService, CRUD de metas), mas **não é montado** em `index.routes.ts`. Rotas de Goals não estão expostas na API.

### 3.3 Módulos e camadas

- **server/routes:** HTTP: health, auth, oauth, supermarket, index (agregador).
- **middleware/auth.ts:** Lê Bearer JWT, valida com `verifyAccessToken`, carrega user no Prisma, `c.set('user', user)`.
- **modules/supermarket:** domain (types, utils), infra (repository), supermarket.routes.ts (Hono + Zod + auth).
- **modules/goals:** domain (goal.entity), infra (goals.repository), service (goals.service), server/routes/goals.routes.ts — **não montado**.
- **libs:** prisma, logger, env, jwt, password, appError, security, uuid, gracefulShutdown, infra.init.

A separação domain/infra está clara em goals e supermarket; as rotas HTTP ficam em server/routes ou no próprio módulo (supermarket).

### 3.4 Persistência (Prisma)

- **User:** id, email, password?, name, emailVerified, emailVerificationToken, emailVerificationExpires, createdAt, updatedAt.
- **SupermarketList**, **SupermarketItem**, enum **SupermarketCategory** — alinhados ao módulo Supermarket.
- **Goal**, enum **GoalPeriodicity** — alinhados ao módulo Goals.

Schema coerente com os domínios implementados.

---

## 4. Arquitetura do frontend

### 4.1 Roteamento

- `/` → App (landing: HeroSection, Benefits, Pricing, etc.).
- `/login` → Login.
- `/register` → `require('../pages/Register').default` ⚠️
- `/verify-email` → `require('../pages/VerifyEmail').default` ⚠️
- `/oauth-callback` → `require('../pages/OAuthCallback').default` ⚠️
- `/app` → Protected → Dashboard.
- `/goals` → Protected → Goals.
- `/try` → App (TryFortress).

**Problema:** Em ambiente ESM (Vite), `require()` não existe no bundle do browser. As rotas `/register`, `/verify-email` e `/oauth-callback` podem lançar `ReferenceError: require is not defined` ao serem acessadas. Deve-se usar `import` estático ou `React.lazy(() => import(...))`.

### 4.2 Auth e API

- **AuthContext:** user, loading, login, logout; no mount chama `/auth/refresh` e, se houver token, `/users/me`.
- **axiosClient:** baseURL 3001, interceptor 401 com retry via `/auth/refresh`, Bearer no header, withCredentials.

Alinhado ao backend (login, refresh, me, logout).

---

## 5. Bugs e inconsistências críticas

### 5.1 Segurança e correção (backend)

| # | Arquivo | Problema | Ação recomendada |
|---|---------|----------|-------------------|
| 1 | auth.routes.ts (register) | Senha gravada em **texto plano** em `prisma.user.create({ data: { ..., password } })`. Existe `hashPassword` em libs/password mas não é usada. | Antes do create, fazer `password: hashPassword(password)`. |
| 2 | auth.routes.ts (register) | `logger.info({ userId: user.id, email }, ...)` na linha 71 usa `user` **antes** de `user` ser criado (linha 74). | Mover o log para depois do create; usar `user.id` do resultado. |
| 3 | auth.routes.ts (login) | `loginSchema` é usado em `parsed = loginSchema.safeParse(body)` mas **não está definido** em lugar nenhum do arquivo. | Definir `loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })` (ou equivalente) junto de registerSchema. |
| 4 | auth.routes.ts (login) | Linhas 112–113: `logger.info({ userId: user.id, user.email })` no bloco de login são restos de outro contexto e referem `user` antes de existir no fluxo. | Remover ou mover para onde faça sentido (ex.: após obter user do Prisma). |

### 5.2 Integração e tipos (backend)

| # | Arquivo | Problema | Ação recomendada |
|---|---------|----------|-------------------|
| 5 | index.routes.ts | Função `registerModuleRoutes(app: Hono)` usa tipo `Hono` sem import. | Adicionar `import type { Hono } from "hono";` (ou `import { Hono } from "hono";`). |
| 6 | index.routes.ts | Rotas de **Goals** não são montadas. | Importar goals router e fazer `app.route("/goals", goalsRoutes)` (ou prefixo desejado). Ajustar goals.routes para usar auth middleware em vez de `x-user-id` se for o caso. |
| 7 | auth.routes.ts | Uso de **express-rate-limit** com `authRoutes.use("/auth/register", limiter)`. Hono não usa req/res do Express; o middleware pode não funcionar. | Usar middleware de rate-limit compatível com Hono ou implementar limite simples (ex.: por IP em memória ou Redis) no estilo Hono. |
| 8 | auth.routes.ts | Imports duplicados e ordem confusa (Hono duas vezes, prisma e logger no meio do arquivo). | Unificar imports no topo; remover duplicatas. |

### 5.3 Frontend

| # | Arquivo | Problema | Ação recomendada |
|---|---------|----------|-------------------|
| 9 | router/index.jsx | Uso de `require('../pages/Register').default` (e idem para VerifyEmail, OAuthCallback). Em Vite/ESM, `require` não existe no cliente. | Substituir por `import Register from '../pages/Register'` (e equivalentes) ou por `React.lazy(() => import('../pages/Register'))` com `<Suspense>`. |
| 10 | package.json (frontend) | **axios** é usado em api/axiosClient.js mas não está em dependencies. | Adicionar `"axios": "^1.x"` (ou versão alinhada) em dependencies. |

---

## 6. Dívida técnica e melhorias

### 6.1 Backend

- **Dependências não usadas:** Remover ou usar express, helmet, cors, cookie-parser, express-rate-limit, compression, ioredis (ou documentar uso futuro).
- **goals.routes:** Usa `x-user-id` em vez de JWT; GoalsService espera userId. Alinhar à estratégia de auth (Bearer + middleware) como no Supermarket.
- **Config Clerk:** `backend/src/config/clerk.ts` — confirmar se é código morto ou parte de roadmap; caso morto, remover ou documentar.
- **Arquivos .backup:** Ex.: Header.jsx.backup, HeroSection.jsx.backup no frontend; remover do repositório ou ignorar.
- **README:** Ainda menciona Next.js e estrutura app/domain/core/infra; ajustar para Vite e para a estrutura real (server/routes, modules, libs).

### 6.2 Frontend

- **Login:** Remover credenciais default em produção (ops@fortress.local / devpass); substituir `alert('Credenciais inválidas')` por estado de erro na UI.
- **SupermarketMode / TryFortress:** Conectar à API Supermarket (listas/itens) para tornar a funcionalidade utilizável.
- **vercel.json:** Já está com `framework: null`; comentário que menciona Next.js pode ser atualizado para Vite.

### 6.3 DevOps e documentação

- **CI:** Já cobre frontend e backend (build + testes backend). Manter e, se desejado, adicionar lint (ex.: eslint) no pipeline.
- **Documentação:** Manter FORTRESS_DOCS_V7 e docs/ (ARCHITECTURE_ANALYSIS_AND_ACTION_PLAN, ARCHITECTURE_ANALYSIS_SENIOR_V2) alinhadas a esta análise (v3) e às decisões de correção.

---

## 7. Diagrama de dependências (resumo)

```
[main.server.ts]
  → bootstrap → initInfra (Prisma) + applySecurity + health.routes + registerModuleRoutes
[registerModuleRoutes]
  → authRoutes @ /
  → supermarketRoutes @ /supermarket
  → oauthRoutes @ /
  → GET /
  (goals.routes não montado)

[Frontend]
  → AuthContext → axiosClient (3001) → /auth/login | /auth/refresh | /users/me
  → Router: / → App, /app → Dashboard, /goals → Goals, /register | /verify-email | /oauth-callback → require() ⚠️
```

---

## 8. Priorização de ações

### P0 (bloqueadores / segurança)

1. **Registro:** Hash da senha com `hashPassword()` antes de persistir.
2. **Login:** Definir `loginSchema` e remover logs incorretos que usam `user` antes da definição.
3. **Registro:** Corrigir ordem do log (usar `user` só após o create).
4. **Frontend router:** Substituir `require()` por import estático ou lazy para Register, VerifyEmail, OAuthCallback.

### P1 (funcionalidade e consistência)

5. Montar **goals.routes** em index.routes e alinhar Goals à auth (Bearer + middleware).
6. Adicionar **import de Hono** em index.routes.ts.
7. Declarar **axios** no package.json do frontend.
8. Rate-limit: trocar express-rate-limit por solução compatível com Hono ou remover até haver alternativa.

### P2 (dívida e clareza)

9. Limpar imports e duplicatas em auth.routes.ts.
10. Revisar dependências backend não usadas e README/vercel.json.
11. Remover ou documentar config Clerk e arquivos .backup.

---

## 9. Conclusão

O projeto tem base sólida: documentação v7, schema Prisma completo, auth (login/refresh/me/logout), módulo Supermarket com domain/infra e rotas protegidas, CI com frontend e backend, ENV e shutdown bem tratados. Os problemas mais graves são: **senha em texto plano no registro**, **login quebrado por falta de loginSchema**, **uso de `user` antes da criação no registro** e **uso de `require()` no router do frontend**. Corrigindo os itens P0 e P1, a aplicação fica em condições muito melhores para uso e evolução, mantendo a direção hexagonal/DDD e a qualidade de código desejada pela documentação Fortress v7.24.
