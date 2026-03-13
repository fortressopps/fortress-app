# Fortress App — v7.24

Plataforma de finanças pessoais com **backend modular** (Hono + Prisma) e **frontend SPA** (Vite + React) com design system dark.

## Stack (atual)

- **Backend**: Node + TypeScript, Hono, Prisma, Postgres
- **Auth**: JWT (access/refresh) + OAuth (Google/Microsoft via Passport)
- **Frontend**: React 18, React Router 7, Vite 4, Axios, Recharts, Lucide React

## Rotas do frontend

- Público: `/` (Landing), `/try`, `/login`, `/register`, `/oauth-callback`
- Protegido: `/dashboard`, `/goals`, `/supermarket`, `/intelligence`, `/settings`

## Desenvolvimento local (rápido)

### 1) Backend

Configure `backend/.env` com um Postgres acessível (Supabase recomendado com **Session Pooler**):

- Guia: `docs/SUPABASE_SETUP.md`

Depois:

```bash
cd backend
npm install
npx prisma migrate deploy
npm run dev
```

Backend por padrão em `http://localhost:3001` (health: `GET /health`).

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Por padrão usa o backend em `http://localhost:3001`. Para customizar:

```env
VITE_API_URL=http://localhost:3001
```

# 

# 📂 Estrutura Oficial do Repositório

# fortress-app/

# │

# ├── backend/

# │   ├── src/

# │   │   ├── server/     → bootstrap, routes (health, auth, goals, supermarket, oauth)

# │   │   ├── modules/    → domain + infra por feature (goals, supermarket)

# │   │   ├── libs/       → prisma, logger, env, jwt, password, security

# │   │   ├── middleware/ → auth (JWT)

# │   │   └── main.server.ts

# │   ├── prisma/

# │   ├── package.json

# │   └── tsconfig.json

# │

# ├── frontend/           → Vite + React SPA isolado

# │

# ├── infra/              → scripts, utilidades, automações

# ├── scripts/            → init-dev, doctor, maintenance

# ├── docs/               → documentação técnica

# └── .github/workflows/  → CI

# 

# 

# A regra é simples:

# 

# Cada feature tem uma pasta própria nas camadas app/domain/infra.

# 

# 🧠 Princípios de Arquitetura (Hexagonal)

# App Layer

# 

# Rotas

# 

# Controllers

# 

# Middlewares

# 

# DTOs \& Validation

# → Sem lógica de negócio.

# 

# Domain Layer

# 

# Entities

# 

# Value Objects

# 

# Services puros

# 

# Policies

# → Sem acesso a banco, cache, APIs externas.

# 

# Infra Layer

# 

# Prisma Client

# 

# Repositórios

# 

# Cache

# 

# Providers externos (email, auth, etc.)

# 

# Core Layer

# 

# Bootstrap

# 

# Application Kernel

# 

# Env validation

# 

# Logger

# 

# Cada camada só conhece a camada abaixo (app → domain → infra).

# 

# 🔐 Segurança (Método Fortress v7)

# 

# Validação obrigatória com Zod

# 

# Env Schema obrigatório

# 

# JWT com tokens separados e rotating refresh

# 

# Logger centralizado (pino)

# 

# Erros padronizados

# 

# Arquitetura sem pontos soltos

# 

# Zero arquivos .js no backend

# 

# Zero duplicações

# 

# 🗂️ Regras de Organização

# 

# Nomeação 100% padronizada

# 

# Uma pasta por feature

# 

# Zero código morto

# 

# Zero comentários desnecessários

# 

# Zero regras de negócio fora do domínio

# 

# Regras financeiras nunca ficam em controllers

# 

# 🛠️ Notas

- Para deploy e operação: `docs/DEPLOY.md`
- Para autenticação: `docs/AUTH_FLOW.md` e `docs/AUTH_SOCIAL_FLOW.md`

# 

# 🌐 Deploy / CI

# Frontend

# 

# Deploy automático pela Vercel

# 

# Pastas ignoradas pelo .vercelignore

# 

# Build isolado por vercel.json

# 

# Backend

# 

# Deploy separado (Railway, Render ou Docker)

# 

# Não passa pela Vercel

# 

# Independente do frontend

# 

# CI

# 

# GitHub Actions (build frontend)

# 

# Roda em qualquer branch e PR

# 

# 📌 Roadmap Rápido v7.24

# 

# &nbsp;Domain Kernel

# 

# &nbsp;Bounded Contexts

# 

# &nbsp;Módulo Supermarket reconstruído

# 

# &nbsp;Políticas financeiras sólidas

# 

# &nbsp;Pipeline de BI inicial

# 

# &nbsp;Observabilidade (pino → grafana future)

# 

# &nbsp;Sistema comportamental Fortress

# 

# 🧱 Mantra do Código Fortress

# 

# Se não for modular, previsível e seguro, não entra.

# Se precisa de explicação, está errado.

# A estrutura deve guiar o desenvolvedor — não o inverso.

# 

# 📘 Documentação Completa

# 

# A versão estendida está no arquivo:

# 

# docs/MASTER\_CONTEXT.md

