# Frontend UI Guide (v7.24)

Este guia documenta o frontend reconstruído (UI + rotas + design system).

## Design system

- **Background**: `#0a0a0a`
- **Cards**: `#111111` com borda `#1a1a1a`
- **Accent primário**: `#22c55e`
- **Accent secundário (hover)**: `#16a34a`
- **Texto primário**: `#ffffff`
- **Texto secundário**: `#6b7280`
- **Fonte**: Inter (Google Fonts)
- **Raios**: cards `12px`, botões `8px`
- **Sidebar**: fixa esquerda `64px`, `#0d0d0d`, ícones apenas

Fonte de verdade: `frontend/src/index.css` e `frontend/src/layouts/MainLayout.css`.

## Layout

### MainLayout

- Sidebar fixa (desktop) com navegação por ícones:
  - Home → `/dashboard`
  - Target → `/goals`
  - ShoppingCart → `/supermarket`
  - BarChart → `/intelligence`
  - Settings → `/settings`
- Estado ativo: “pill” verde no ícone
- Navbar superior:
  - Logo `FORTRESS` à esquerda
  - Ícones à direita (search, bell, avatar)
- Conteúdo: padding 24px

### Responsivo

- Desktop: sidebar fixa à esquerda (64px)
- Mobile: sidebar colapsa e navegação vira bottom nav

## Rotas

### Públicas

- `/` — Landing (Hero, Features, Pricing, Footer)
- `/try` — Demo
- `/login` — Login + OAuth (Google/Microsoft)
- `/register` — Registro + OAuth
- `/oauth-callback` — Recebe `token` e redireciona para `/dashboard`

### Protegidas (auth)

- `/dashboard` — cards + gráfico (Recharts) + “insights”
- `/goals` — CRUD de metas
- `/supermarket` — listas
- `/supermarket/:listId` — detalhe da lista (itens + receipt processing)
- `/intelligence` — placeholder + kernel state (API)
- `/settings` — placeholder

## Integração com backend

- Base URL do backend:
  - padrão: `http://localhost:3001`
  - override: `VITE_API_URL`
- Auth:
  - refresh: `POST /auth/refresh` (cookie)
  - me: `GET /users/me` (Bearer)
  - oauth callback: backend redireciona para `${FRONTEND_URL}/oauth-callback?token=...`

