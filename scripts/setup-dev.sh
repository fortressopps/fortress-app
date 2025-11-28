#!/usr/bin/env bash
set -euo pipefail
echo "Installing backend deps..."
( cd backend && if command -v pnpm >/dev/null 2>&1; then pnpm install; else npm install; fi )
echo "Generating prisma client..."
( cd backend && npx prisma generate ) || true
echo "Setup complete. Edit backend/.env and run backend commands."
