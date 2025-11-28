#!/usr/bin/env bash
set -euo pipefail
echo "Bootstrapping Fortress v7.23 local dev..."
echo "1) Create .env from .env.example and fill secrets."
echo "2) Start infra (docker compose) if using docker."
echo "3) cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init"
echo "4) cd frontend && npm install && npm run dev"
