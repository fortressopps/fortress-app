# Fortress App — v7.23 → v7.24

# Plataforma financeira com arquitetura empresarial, modular e previsível

# 

# A Fortress é uma plataforma criada para reestruturar a relação psicológica das pessoas com o dinheiro, usando tecnologia inteligente, automação e uma arquitetura limpa e fortificada.

# 

# O objetivo é transformar finanças pessoais em algo leve, seguro e previsível, com decisões guiadas por estrutura — não por improviso.

# 

# 🚀 Visão Geral

# 

# Após o ciclo v7.21 → v7.23, o repositório passou por uma reconstrução total:

# 

# ✔ Arquitetura Hexagonal real

# 

# ✔ Backend modular com Domain Layer isolado

# 

# ✔ ESM + TypeScript em todos os pontos

# 

# ✔ Regras de segurança reforçadas

# 

# ✔ CI/CD simplificado

# 

# ✔ Frontend e backend completamente isolados

# 

# ✔ Estrutura consolidada e revisada

# 

# ✔ Repositório limpo, sem legados

# 

# A versão v7.24 evoluirá para:

# 

# Domain Kernel

# 

# Bounded Contexts reais

# 

# Regras financeiras sólidas

# 

# Módulos comportamentais

# 

# Observabilidade

# 

# Foundation do Fortress BI Core

# 

# 📂 Estrutura Oficial do Repositório

# fortress-app/

# │

# ├── backend/

# │   ├── src/

# │   │   ├── app/        → http, controllers, middleware

# │   │   ├── domain/     → regras de negócio puras

# │   │   ├── core/       → bootstrap / kernel

# │   │   ├── infra/      → prisma, repositórios, providers

# │   │   └── main.server.ts

# │   ├── prisma/

# │   ├── package.json

# │   └── tsconfig.json

# │

# ├── frontend/           → Next.js app isolado

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

# 🛠️ Desenvolvimento Local

# 1\. Instale dependências

# cd backend

# npm install

# npm run dev

# 

# 2\. Gere o Prisma Client

# npx prisma generate

# 

# 3\. Crie migrações

# npx prisma migrate dev --name init

# 

# 4\. Frontend: API URL (opcional)

# O frontend usa a API em http://localhost:3001 por padrão. Para outro host/porta, crie no frontend um arquivo .env com:

# VITE_API_URL=http://localhost:3001

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

