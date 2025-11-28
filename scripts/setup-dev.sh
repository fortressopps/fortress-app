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
