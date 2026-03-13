# Fortress Frontend (Vite + React)

Frontend SPA do Fortress, reconstruído com um design system dark e layout com sidebar + navbar.

## Stack

- React 18 + React Router 7
- Vite 4
- Recharts (gráficos)
- Lucide React (ícones)
- Axios (via `src/api/axiosClient.js`)

## Design System

- Background: `#0a0a0a`
- Cards: `#111111` com borda `#1a1a1a`
- Accent: `#22c55e` (primary) / `#16a34a` (hover)
- Tipografia: Inter (Google Fonts)

Definido em `src/index.css`.

## Rotas

- `/` (Landing)
- `/try` (Demo)
- `/login`, `/register`
- `/oauth-callback` (callback OAuth)
- Protegidas: `/dashboard`, `/goals`, `/supermarket`, `/intelligence`, `/settings`

## Rodar local

```bash
npm install
npm run dev
```

Por padrão o backend é `http://localhost:3001`. Para customizar:

```env
VITE_API_URL=http://localhost:3001
```
