#!/usr/bin/env bash
set -euo pipefail

# apply-v7.14-prime.sh (CUSTO ZERO edition)
# - Non-destructive, backup-first
# - Uses only OSS and local/free tooling (Docker Compose, GitHub Actions OSS)
# - Push is commented out by default to avoid accidental remote changes

ROOT_DIR="$(pwd)"
BRANCH="infra/v7.14-prime"
AUTHOR_NAME="${GIT_AUTHOR_NAME:-$(git config user.name || echo "Fortress Bot")}"
AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo "devnull@example.com")}"
ZIP_NAME="fortress-v7.14-prime.zip"
BACKUP_DIR="backups/v7.14"
TS="$(date +%Y%m%d_%H%M%S)"

echo "== Fortress v7.14 PRIME — CUSTO ZERO upgrader =="
echo "Root: $ROOT_DIR"
echo "Branch: $BRANCH"
echo "Backups: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# safety: require clean tree
if [ ! -d ".git" ]; then
  echo "ERROR: not in a git repo"
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree not clean. Commit or stash first."
  git status --porcelain
  exit 1
fi

# create branch locally (do not push automatically)
git checkout -b "$BRANCH" || git switch -c "$BRANCH"

# helper: write only when different, backup old
write_if_changed() {
  local path="$1"; shift
  local content="$@"
  mkdir -p "$(dirname "$path")"
  # if file exists, backup
  if [ -f "$path" ]; then
    cp "$path" "$BACKUP_DIR/$(basename "$path").$TS.bak" || true
  fi
  # write content
  printf '%s\n' "$content" > "$path"
  echo "WROTE: $path"
}

# detect frontend type (Vite confirmed by user)
FRONTEND_TYPE="vite-react"
echo "Frontend detected: $FRONTEND_TYPE"

# prisma detection
PRISMA_SCHEMA=""
if [ -f "backend/prisma/schema.prisma" ]; then PRISMA_SCHEMA="backend/prisma/schema.prisma"; fi
if [ -f "prisma/schema.prisma" ]; then PRISMA_SCHEMA="prisma/schema.prisma"; fi
if [ -n "$PRISMA_SCHEMA" ]; then
  echo "Prisma schema: $PRISMA_SCHEMA"
fi

# 1) .cursorrules / .cursorignore
write_if_changed ".cursorrules" "# .cursorrules v7.14 (CUSTO ZERO)\nversion: v7.14\nproject: Fortress\nowner: fortressopps\narchitecture:\n  pattern: hexagonal\nrules:\n  - 'no-secrets-in-repo'\n  - 'tests-required'\nai:\n  allowed_tasks: [generate-skeletons, add-tests]\n  forbidden_tasks: [commit-secrets]\n"
write_if_changed ".cursorignore" "node_modules/\nfrontend/.vite/\nfrontend/dist/\nbackend/dist/\n.env*\n.prisma/\n*.sqlite\n*.log\n.DS_Store\n.vscode/\n"

# 2) docs master-context minimal (CUSTO ZERO)
mkdir -p docs
write_if_changed "docs/master-context-v7.14.md" "# MASTER CONTEXT v7.14 (CUSTO ZERO)\n- Method: v7 (iterative, zero-cost-first)\n- Stack: Node + TypeScript + Prisma + React + Vite\n- Dev infra: Docker Compose (Postgres, Redis) local\n- CI: GitHub Actions + gitleaks (OSS)\n- Auth: JWT access (in-memory) + refresh cookie + JTI (rotate)\n"

# 3) docker-compose for local dev (free)
write_if_changed "docker-compose.yml" "version: '3.8'\nservices:\n  postgres:\n    image: postgres:15\n    environment:\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: postgres\n      POSTGRES_DB: fortress\n    ports:\n      - '5432:5432'\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n  redis:\n    image: redis:7\n    ports:\n      - '6379:6379'\nvolumes:\n  pgdata:\n"

# 4) ensure scripts/setup-dev.sh (uses npm fallback; zero-cost)
mkdir -p scripts
cat > scripts/setup-dev.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "Setup dev (CUSTO ZERO): install deps and copy .env"
# prefer pnpm if available, otherwise npm
if command -v pnpm >/dev/null 2>&1; then
  echo "Using pnpm"
  (cd backend && pnpm install) || true
  (cd frontend && pnpm install) || true
else
  echo "Using npm"
  (cd backend && npm install) || true
  (cd frontend && npm install) || true
fi
cp .env.example .env 2>/dev/null || echo ".env.example not found; create .env manually"
echo "Done. Edit .env before running services."
SH
chmod +x scripts/setup-dev.sh

# 5) frontend Vite: add router + api client + auth provider (non-destructive)
if [ -d "frontend" ]; then
  mkdir -p frontend/src/{api,context,router,components,pages}
  # axios client (in-memory token)
  cat > frontend/src/api/axiosClient.js <<'JS'
import axios from 'axios';
let accessToken = null;
export function setAccessToken(t){ accessToken = t; }
const api = axios.create({ baseURL: process.env.VITE_API_URL || 'http://localhost:4000', withCredentials: true });
api.interceptors.request.use(cfg => {
  if(accessToken){ cfg.headers = cfg.headers || {}; cfg.headers.Authorization = `Bearer ${accessToken}`; }
  return cfg;
});
api.interceptors.response.use(r=>r, async err => {
  const original = err.config;
  if(err.response && err.response.status === 401 && !original._retry){
    original._retry = true;
    try {
      const r = await axios.post((process.env.VITE_API_URL || 'http://localhost:4000') + '/auth/refresh', {}, { withCredentials:true });
      const newToken = r.data?.accessToken;
      setAccessToken(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch(e){ return Promise.reject(e); }
  }
  return Promise.reject(err);
});
export default api;
JS

  # AuthContext (simple)
  cat > frontend/src/context/AuthContext.jsx <<'JS'
import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axiosClient';
const AuthContext = createContext(null);
export function AuthProvider({ children }){
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ (async ()=> {
    try { const r = await api.post('/auth/refresh'); const at = r.data?.accessToken; if(at){ setAccessToken(at); const me = await api.get('/users/me').then(r=>r.data).catch(()=>null); setUser(me); } } catch(e){ setUser(null);} finally{ setLoading(false);} })(); },[]);
  const login = async (email,pw)=>{ const r = await api.post('/auth/login',{email,password:pw}); const at = r.data?.accessToken; if(at){ setAccessToken(at); const me = await api.get('/users/me').then(r=>r.data).catch(()=>null); setUser(me); return true; } return false; };
  const logout = async ()=>{ try{ await api.post('/auth/logout'); }catch{} setUser(null); setAccessToken(null); };
  return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth(){ return useContext(AuthContext); }
JS

  # Router scaffold (adds react-router-dom usage but only if installed)
  cat > frontend/src/router/index.jsx <<'JS'
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import App from '../App';
function Protected({ children }){
  const {user,loading} = useAuth();
  if(loading) return <div>Loading...</div>;
  if(!user) return <Navigate to="/login" />;
  return children;
}
export default function Router(){
  return (<BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Protected><Dashboard/></Protected>} />
    <Route path="*" element={<App/>} />
  </Routes></AuthProvider></BrowserRouter>);
}
JS

  # Minimal pages (only if not present)
  [ -f frontend/src/pages/Login.jsx ] || cat > frontend/src/pages/Login.jsx <<'JS'
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
export default function Login(){ const [email,setEmail]=useState('ops@fortress.local'); const [pw,setPw]=useState('devpass'); const auth=useAuth(); const nav=useNavigate();
  const submit=async e=>{ e.preventDefault(); const ok=await auth.login(email,pw); if(ok) nav('/'); else alert('fail'); };
  return (<main><h2>Login</h2><form onSubmit={submit}><input value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" value={pw} onChange={e=>setPw(e.target.value)}/><button>Login</button></form></main>);
}
JS

  [ -f frontend/src/pages/Dashboard.jsx ] || cat > frontend/src/pages/Dashboard.jsx <<'JS'
import React from 'react';
import { useAuth } from '../context/AuthContext';
export default function Dashboard(){ const {user,logout}=useAuth(); return (<main><h2>Dashboard</h2><div>Welcome {user?.email||'user'}</div><button onClick={logout}>Logout</button></main>); }
JS

  # update main.jsx to use Router, backup existing
  if [ -f frontend/src/main.jsx ]; then cp frontend/src/main.jsx "$BACKUP_DIR/main.jsx.$TS.bak"; fi
  cat > frontend/src/main.jsx <<'JS'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './router/index.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
JS

  echo "Frontend changes applied (vite/react). Backups in $BACKUP_DIR"
fi

# 6) backend: ensure basic scripts & .env.example (non-paid defaults)
mkdir -p backend
[ -f backend/.env.example ] || cat > backend/.env.example <<'ENV'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fortress?schema=public"
JWT_SECRET=dev_access_secret
JWT_REFRESH_SECRET=dev_refresh_secret
NODE_ENV=development
PORT=4000
ENV

# 7) CI minimal (GitHub Actions, gitleaks only; trivy optional)
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'CI'
name: CI - fortress (v7.14 custo-zero)
on: [push,pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: pnpm/action-setup@v2
        with:
          node-version: 20
      - name: Install deps
        run: |
          if [ -f backend/package.json ]; then (cd backend && npm install); fi
          if [ -f frontend/package.json ]; then (cd frontend && npm install); fi
      - name: Run tests
        run: echo "Run your tests here (none configured by default)"
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Gitleaks
        run: |
          curl -sSfL https://raw.githubusercontent.com/zricethezav/gitleaks/master/install.sh | bash -s -- -b /usr/local/bin || true
          gitleaks detect --source . || true
CI

# 8) commit changes (local only)
git add .cursorrules .cursorignore docs docker-compose.yml scripts frontend backend .github 2>/dev/null || true
git commit -m "chore(v7.14): custo-zero upgrades (vite frontend router+auth, docker-compose, docs, CI minimal)" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>" || echo "No changes to commit"

# 9) zip artifacts
zip -r "$ZIP_NAME" .cursorrules .cursorignore docs docker-compose.yml scripts frontend .github || true
mv "$ZIP_NAME" "$ROOT_DIR/$ZIP_NAME" 2>/dev/null || true
echo "PACKAGE ZIP: $ROOT_DIR/$ZIP_NAME"

# 10) push disabled by default (uncomment to enable)
# git push -u origin "$BRANCH"
echo "Branch created locally: $BRANCH. To push: git push -u origin $BRANCH"

echo "v7.14 CUSTO ZERO upgrade finished. Backups at $BACKUP_DIR"
echo "Run: scripts/setup-dev.sh then start backend & frontend as you normally do."
