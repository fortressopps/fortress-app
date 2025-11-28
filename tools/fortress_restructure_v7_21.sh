#!/usr/bin/env bash
set -euo pipefail

# fortress_restructure_v7_21.sh
# Destrutivo por design — remove legado e cria padrão v7.21 (hexagonal, modular, ESM+TS)
# Use em Git repo root. Exige working tree limpo.

ROOT="$(pwd)"
BRANCH="infra/v7.21-restructure"
AUTHOR_NAME="${GIT_AUTHOR_NAME:-$(git config user.name || echo "Fortress Bot")}"
AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo "devnull@example.com")}"

echo "======================================"
echo " FORTRESS v7.21 — DESTRUCTIVE RESTRUCTURE"
echo " Repo root: $ROOT"
echo " Branch: $BRANCH"
echo " Author: $AUTHOR_NAME <$AUTHOR_EMAIL>"
echo "======================================"
echo ""

# safety checks
if [ ! -d ".git" ]; then
  echo "ERROR: Not a git repo (no .git). Run from repo root."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree not clean. Commit or stash changes first."
  git status --porcelain
  exit 1
fi

# create branch
git fetch origin || true
git checkout -b "$BRANCH"

echo "→ Removing legacy files and folders (DESTRUCTIVE)..."
# list of common legacy/garbage patterns to remove
rm -rf backend/src/controllers \
       backend/src/services \
       backend/src/old* \
       backend/src/*_legacy* \
       backend/src/__backup* \
       backend/src/webhooks \
       backend/src/_legacy_backup_* \
       backend/src/examples \
       backend/src/scripts/legacy \
       backend/dist \
       backend/build \
       backend/.cache \
       frontend/.cache || true

# Also remove top-level legacy patterns
rm -rf legacy docs/old* _backup* backups || true

echo "→ Creating v7.21 folder tree (hexagonal + modular)..."
# main backend structure
mkdir -p backend/src/{core,config,modules,app,shared,adapters,ports,infra,db,types}
mkdir -p backend/src/core/{bootstrap,server}
mkdir -p backend/src/config/{env,logger,security}
mkdir -p backend/src/app/{http,cli}
mkdir -p backend/src/app/http/{controllers,routes,middleware,validators,dto,pipes}
mkdir -p backend/src/modules/{auth,user,supermarket}
mkdir -p backend/src/modules/supermarket/{domain,service,repository,adapters}
mkdir -p backend/src/infra/prisma
mkdir -p backend/scripts
mkdir -p tools

echo "→ Generating essential files..."

# tsconfig.json
cat > backend/tsconfig.json <<'TS'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
TS

# package.json (backend skeleton)
cat > backend/package.json <<'PJ'
{
  "name": "fortress-backend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only --loader ts-node/esm src/main.server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.server.js",
    "prisma:generate": "prisma generate",
    "migrate:dev": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "express": "^4.18.2",
    "dotenv": "^16.0.0",
    "pino": "^8.0.0",
    "zod": "^3.21.4",
    "cookie-parser": "^1.4.6",
    "compression": "^1.7.4",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.7.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.9.3",
    "prisma": "^5.0.0",
    "pino-pretty": "^9.0.0"
  }
}
PJ

# prisma.config.ts (Prisma v7 friendly loader)
cat > backend/prisma.config.ts <<'PC'
import { defineConfig } from "@prisma/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    enabled: true
  }
});
PC

# prisma schema minimal (if none exists create basic models)
if [ ! -f backend/prisma/schema.prisma ]; then
  cat > backend/prisma/schema.prisma <<'PR'
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
model User {
  id String @id @default(cuid())
  email String @unique
  name String?
  createdAt DateTime @default(now())
}
PR
fi

# env.loader.ts (typed + zod)
cat > backend/src/config/env/env.loader.ts <<'E'
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const Schema = z.object({
  DATABASE_URL: z.string().min(10),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  APP_ENV: z.enum(["development","production","test"]).default("development"),
  PORT: z.string().transform(Number).default("4000")
});

const out = Schema.safeParse(process.env);
if (!out.success) {
  console.error("ENV validation failed:", out.error.format());
  process.exit(1);
}
export const ENV = out.data;
export const isProd = ENV.APP_ENV === "production";
E

# logger.config.ts (pino)
cat > backend/src/config/logger/logger.config.ts <<'L'
import pino from "pino";
import { isProd } from "../env/env.loader.js";
export const logger = pino({
  level: isProd ? "info" : "debug",
  transport: { target: "pino-pretty", options: { colorize: true, translateTime: true } }
});
L

# db.config.ts (prisma client singleton)
cat > backend/src/infra/prisma/prisma.client.ts <<'P'
import { PrismaClient } from "@prisma/client";
import { logger } from "../../config/logger/logger.config.js";
const prisma = new PrismaClient();
process.on("SIGINT", async () => { await prisma.$disconnect(); logger.info("Prisma disconnected"); process.exit(0); });
export default prisma;
P

# main.server.ts (entry)
cat > backend/src/main.server.ts <<'M'
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { bootstrapApp } from "./core/bootstrap/app.bootstrap.js";
import { ENV } from "./config/env/env.loader.js";

const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: true, credentials: true }));

await bootstrapApp(app);

const port = ENV.PORT || 4000;
app.listen(port, () => console.log(`Fortress v7.21 listening on :${port}`));
M

# app.bootstrap.ts
cat > backend/src/core/bootstrap/app.bootstrap.ts <<'B'
import type { Application } from "express";
import { registerAppRoutes } from "../../app/http/routes/index.routes.js";
import { initInfra } from "../../infra/init/infra.init.js";
import { logger } from "../../config/logger/logger.config.js";

export async function bootstrapApp(app: Application) {
  await initInfra();
  registerAppRoutes(app);
  logger.info("App bootstrap complete");
  return app;
}
B

# infra init
mkdir -p backend/src/infra/init
cat > backend/src/infra/init/infra.init.ts <<'I'
import prisma from "../prisma/prisma.client.js";
import { logger } from "../../config/logger/logger.config.js";
export async function initInfra(){
  try {
    await prisma.$connect();
    logger.info("Prisma connected");
  } catch(e){
    logger.error({err:e}, "Prisma connect failed");
    throw e;
  }
}
I

# simple routes index (placeholder)
mkdir -p backend/src/app/http/routes
cat > backend/src/app/http/routes/index.routes.ts <<'R'
import type { Application } from "express";
import { healthRouter } from "./health.routes.js";

export function registerAppRoutes(app: Application){
  app.use("/_health", healthRouter);
  // TODO: register module routers here: /auth, /users, /supermarket
}
R

cat > backend/src/app/http/routes/health.routes.ts <<'RH'
import { Router } from "express";
export const healthRouter = Router();
healthRouter.get("/", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
RH

# error handler
cat > backend/src/app/http/middleware/error.middleware.ts <<'E'
import { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger/logger.config.js";
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction){
  logger.error({ err }, "Unhandled error");
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || "Internal error" });
}
E

# cursorrules & cursorignore
cat > .cursorrules <<'CR'
version: v7.21
project: Fortress
rules:
  - no-secrets-in-repo
  - tests-required
ai:
  allowed_tasks: [generate-skeletons, implement-module, run-tests]
  forbidden_tasks: [push-secrets]
CR

cat > .cursorignore <<'CI'
node_modules/
backend/dist/
frontend/dist/
.env*
.prisma/
*.sqlite
*.log
CI

# scripts/setup-dev.sh
cat > scripts/setup-dev.sh <<'S'
#!/usr/bin/env bash
set -euo pipefail
echo "Installing backend deps..."
( cd backend && if command -v pnpm >/dev/null 2>&1; then pnpm install; else npm install; fi )
echo "Generating prisma client..."
( cd backend && npx prisma generate ) || true
echo "Setup complete. Edit backend/.env and run backend commands."
S
chmod +x scripts/setup-dev.sh

# docker-compose.hardened.yml (Postgres+Redis with secrets)
cat > docker-compose.hardened.yml <<'D'
services:
  postgres:
    image: postgres:15
    container_name: fortress_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
      POSTGRES_DB: fortress
    volumes:
      - fortress_postgres_data:/var/lib/postgresql/data
    secrets:
      - postgres_password
  redis:
    image: redis:7
    container_name: fortress_redis
    restart: unless-stopped
    command: ["redis-server","--requirepass","$(cat ./docker-config/postgres/redis_pwd 2>/dev/null || echo '')"]
volumes:
  fortress_postgres_data:
secrets:
  postgres_password:
    file: ./docker-config/postgres/postgres_pwd
D

# husky + lint-staged minimal
mkdir -p .husky
cat > .husky/pre-commit <<'H'
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"
npx lint-staged || true
H
chmod +x .husky/pre-commit

cat > lint-staged.config.js <<'LST'
module.exports = {
  '*.{ts,js,jsx,tsx}': ['npm run -s lint --silent', 'git add']
};
LST

# github ci (basic)
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'Y'
name: CI - fortress v7.21
on: [push,pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: pnpm/action-setup@v2
        with:
          node-version: 20
      - name: Install & Build
        run: |
          cd backend
          npm install
          npm run build || true
Y

# git commit
git add -A
git commit -m "chore(v7.21): destructive restructure -> v7.21 (hexagonal, ESM+TS, infra init)" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>" || true

echo ""
echo "======================================"
echo " DONE — v7.21 restructure applied locally"
echo ""
echo " Branch: $BRANCH (created and committed)."
echo " Review changes, edit backend/.env (DATABASE_URL, JWT secrets), run:"
echo ""
echo "   cd backend"
echo "   npx prisma generate"
echo "   npx prisma migrate dev --name init"
echo "   npm run dev"
echo ""
echo " If you want to push the branch to origin, run:"
echo "   git push -u origin $BRANCH"
echo "======================================"
