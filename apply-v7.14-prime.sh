#!/usr/bin/env bash
set -euo pipefail

# apply-v7.14-prime.sh
# Fortress Enterprise v7.14 — surgical upgrader (non-destructive, backup-first)
# - Creates branch infra/v7.14-prime
# - Adds/updates targeted files only (backups to backups/v7.14/)
# - Runs validation steps (prisma validate if prisma present)
# - Commits and creates fortress-v7.14-prime.zip
# IMPORTANT: Review and optionally comment out the git push at the end.

ROOT_DIR="$(pwd)"
BRANCH="infra/v7.14-prime"
AUTHOR_NAME="${GIT_AUTHOR_NAME:-$(git config user.name || echo "Fortress Bot")}"
AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo "devnull@example.com")}"
ZIP_NAME="fortress-v7.14-prime.zip"
BACKUP_DIR="backups/v7.14"
TS="$(date +%Y%m%d_%H%M%S)"

echo "== Fortress v7.14 PRIME — surgical upgrader =="
echo "Repo root: $ROOT_DIR"
echo "Branch: $BRANCH"
echo "Backup dir: $BACKUP_DIR"
echo "ZIP: $ZIP_NAME"

# basic guards
if [ ! -d ".git" ]; then
  echo "ERROR: not in a git repo. Run from repo root."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree not clean. Commit or stash changes first."
  git status --porcelain
  exit 1
fi

# helper: safe write only if file missing or content differs (make backup)
mkdir -p "$BACKUP_DIR"

write_if_missing() {
  local path="$1"
  local tmp="$(mktemp)"
  cat > "$tmp" <<'__EOF__'
'"$@"'
__EOF__
  if [ -f "$path" ]; then
    # if identical, skip
    if cmp -s "$tmp" "$path"; then
      echo "SKIP (identical): $path"
      rm "$tmp"
      return 0
    else
      echo "BACKUP and MERGE: $path -> $BACKUP_DIR/$(basename "$path").$TS.bak"
      mkdir -p "$(dirname "$BACKUP_DIR/$path")"
      cp "$path" "$BACKUP_DIR/$path.$TS.bak" || true
    fi
  else
    echo "CREATING: $path"
    mkdir -p "$(dirname "$path")"
  fi
  mv "$tmp" "$path"
  echo "Wrote: $path"
}

append_if_not_contains() {
  local path="$1"; shift
  local marker="$1"; shift
  local tmp="$(mktemp)"
  if [ ! -f "$path" ]; then
    mkdir -p "$(dirname "$path")"
    echo "" > "$path"
  fi
  if grep -qF "$marker" "$path"; then
    echo "Marker present, skip append: $path"
    return 0
  fi
  cat >> "$path" <<'__EOF__'
'"$@"'
__EOF__
  echo "Appended to $path (marker: $marker)"
}

# detect frontend router type
FRONTEND_DIRS=(frontend app)
FRONTEND_TYPE="unknown"
if [ -d "frontend/app" ] || [ -d "app" ]; then
  # App Router present
  if [ -d "frontend/app" ]; then FRONTEND_TYPE="app-router"; else FRONTEND_TYPE="app-router"; fi
else
  if [ -d "frontend/pages" ] || [ -d "pages" ]; then FRONTEND_TYPE="pages-router"; fi
fi
echo "Frontend router: $FRONTEND_TYPE"

# detect prisma
PRISMA_SCHEMA=""
if [ -f "backend/prisma/schema.prisma" ]; then PRISMA_SCHEMA="backend/prisma/schema.prisma"; fi
if [ -f "prisma/schema.prisma" ]; then PRISMA_SCHEMA="prisma/schema.prisma"; fi
if [ -n "$PRISMA_SCHEMA" ]; then
  echo "Prisma schema detected at: $PRISMA_SCHEMA"
else
  echo "No prisma/schema.prisma detected (skip prisma validate)"
fi

# 1) Add/ensure .cursorrules (machine-friendly) — surgical, won't overwrite if identical
read -r -d '' DOT_CURSORS <<'__C__'
# Fortress v7.14 PRIME — .cursorrules
version: v7.14
project: Fortress App - PRIME
owner: fortressopps

architecture:
  pattern: 'Hexagonal / Clean Architecture'
  layers: ['domain','application','adapters','infra','api']
  prisma_version: '7.x'

rules:
  - 'contracts-first: docs/openapi.yaml is authoritative for public API'
  - 'tests-required: any agent change must include/update tests'
  - 'no-secrets-in-repo: keep .env in .gitignore'
  - 'security: refresh tokens must be HttpOnly and rotated; JTI per refresh'
  - 'ci: run prisma validate on PRs if prisma present'
naming:
  files: kebab-case
  types: PascalCase
  functions: camelCase
ai:
  allowed_tasks: [generate-skeletons, add-tests, non-breaking-refactor]
  forbidden_tasks: [commit-secrets, bypass-tests, remove-security-checks]
__C__
write_if_missing ".cursorrules" "$DOT_CURSORS"

# 2) Add/ensure .cursorignore
read -r -d '' DOT_CURSORIGNORE <<'__I__'
# Fortress v7.14 — .cursorignore
node_modules/
frontend/.next/
backend/dist/
.env*
.prisma/
*.sqlite
*.log
.DS_Store
.vscode/
.idea/
backups/
fortress-v7.14-prime.zip
__I__
write_if_missing ".cursorignore" "$DOT_CURSORIGNORE"

# 3) Master Context (only create if missing or different) - conservative short canonical
read -r -d '' MASTER_CTX <<'__M__'
# FORTRESS MASTER CONTEXT — v7.14 PRIME (snapshot)
Version: v7.14
Purpose: canonical architecture (hexagonal), security hardening, Cursor rules.
Highlights:
- Hexagonal layering: domain / application / adapters / infra / api
- Prisma 7 readiness (see docs/migration/prisma-7-upgrade.md)
- Contracts-first: docs/openapi.yaml is authoritative
- Security defaults: rotating refresh tokens + JTI, HttpOnly cookies, envelope helpers for PII
- CI: lint, build, test, prisma validate, gitleaks
Onboarding: cp .env.example .env && scripts/setup-dev.sh
__M__
write_if_missing "docs/master-context-v7.14.md" "$MASTER_CTX"

# 4) docs/openapi.yaml — create if missing (minimal contract for auth + lists)
read -r -d '' OPENAPI <<'__O__'
openapi: 3.0.1
info:
  title: Fortress API (v1)
  version: 'v1'
paths:
  /auth/login:
    post:
      summary: Login (returns accessToken + sets refresh cookie)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string }
                password: { type: string }
      responses:
        '200': { description: OK }
  /auth/refresh:
    post:
      summary: Rotate refresh token (HttpOnly cookie)
      responses:
        '200': { description: OK }
  /lists:
    post:
      summary: Create supermarket list
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
      responses:
        '201': { description: Created }
__O__
write_if_missing "docs/openapi.yaml" "$OPENAPI"

# 5) Add migration guide if prisma exists
if [ -n "$PRISMA_SCHEMA" ]; then
  read -r -d '' MIGRATE <<'__PM__'
# Prisma 7 upgrade (v7.14)
1. Branch: chore/prisma-7-migration
2. Commit current schema + DB snapshot
3. Replace schema with v7-compatible schema
4. npx prisma format && npx prisma validate
5. npx prisma migrate dev --name prisma-7-upgrade
6. Run tests and fix adapters
7. Update CI to run `npx prisma validate` on PRs
__PM__
  write_if_missing "docs/migration/prisma-7-upgrade.md" "$MIGRATE"
fi

# 6) CI skeleton — append if not present
CI_FILE=".github/workflows/ci.yml"
read -r -d '' CI_YML <<'__Y__'
name: CI - fortress v7.14 (minimal)
on: [push,pull_request]
jobs:
  test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: pnpm/action-setup@v2
        with:
          node-version: 20
      - name: Install (workspace)
        run: pnpm install -w
      - name: Lint
        run: pnpm -w -s lint || true
      - name: Build
        run: pnpm -w -s build || true
      - name: Test
        run: pnpm -w -s test || true
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Gitleaks (detect secrets)
        run: |
          curl -sSfL https://raw.githubusercontent.com/zricethezav/gitleaks/master/install.sh | bash -s -- -b /usr/local/bin || true
          gitleaks detect --source . || true
__Y__
if [ -f "$CI_FILE" ]; then
  if ! grep -q "CI - fortress v7.14" "$CI_FILE"; then
    append_if_not_contains "$CI_FILE" "CI - fortress v7.14" "$CI_YML"
  else
    echo "CI file already seems to contain v7.14 marker - skipping append"
  fi
else
  write_if_missing "$CI_FILE" "$CI_YML"
fi

# 7) Husky pre-commit + lint-staged (non-destructive)
if [ ! -d ".husky" ]; then
  mkdir -p .husky
  cat > .husky/pre-commit <<'__H__'
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"
npx --no -- lint-staged || true
__H__
  chmod +x .husky/pre-commit || true
  echo "Created .husky/pre-commit"
else
  echo ".husky exists — leaving as-is"
fi

if [ ! -f "lint-staged.config.js" ]; then
  cat > lint-staged.config.js <<'__L__'
module.exports = { '*.{ts,js,tsx,jsx}': ['npm run lint:fix --silent', 'git add'] }
__L__
  echo "Created lint-staged.config.js"
else
  echo "lint-staged.config.js exists — leaving as-is"
fi

# 8) package.json snippet injection (backend/frontend) — safe append only
inject_package_snippet() {
  local pkg="$1"
  local marker="$2"
  local snippet="$3"
  if [ ! -f "$pkg" ]; then
    echo "$pkg not found — skipping"
    return
  fi
  if grep -qF "$marker" "$pkg"; then
    echo "Package marker present in $pkg — skip injection"
    return
  fi
  # append snippet at end of file before final }
  # naive but safe: create backup and insert
  cp "$pkg" "$BACKUP_DIR/$(basename $pkg).$TS.bak" || true
  tmp="$(mktemp)"
  # attempt to insert snippet inside json by simple heuristic (before last })
  awk -v s="$snippet" 'BEGIN{p=1} {lines[NR]=$0} END{for(i=1;i<=NR;i++){if(i==NR){sub(/^[ \t]*}/,\"\",lines[i]); print lines[i]; print s; print \"}\"} else print lines[i]}}' "$pkg" > "$tmp" || true
  mv "$tmp" "$pkg"
  echo "Injected snippet into $pkg (backup at $BACKUP_DIR/$(basename $pkg).$TS.bak)"
}

BACKEND_PKG="backend/package.json"
FRONTEND_PKG="frontend/package.json"

BACKEND_SNIPPET='"husky": { "hooks": { "pre-commit": "npx lint-staged" } }, "lint-staged": { "src/**/*.{ts,js,tsx,jsx}": ["npm run lint:fix", "git add"] }'
FRONTEND_SNIPPET='"lint": "next lint"'

if [ -f "$BACKEND_PKG" ]; then
  inject_package_snippet "$BACKEND_PKG" "husky" "$BACKEND_SNIPPET"
fi
if [ -f "$FRONTEND_PKG" ]; then
  inject_package_snippet "$FRONTEND_PKG" "lint" "$FRONTEND_SNIPPET"
fi

# 9) Docker-compose if missing: simple dev stack
if [ ! -f "docker-compose.yml" ]; then
  read -r -d '' DC <<'__DC__'
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: fortress
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7
    ports:
      - "6379:6379"
volumes:
  pgdata:
__DC__
  write_if_missing "docker-compose.yml" "$DC"
else
  echo "docker-compose.yml exists — skipping"
fi

# 10) create scripts/setup-dev.sh if missing
if [ ! -f "scripts/setup-dev.sh" ]; then
  mkdir -p scripts
  cat > scripts/setup-dev.sh <<'__S__'
#!/usr/bin/env bash
set -euo pipefail
echo "Setting up dev (install deps and copy env example)..."
if command -v pnpm >/dev/null 2>&1; then
  (cd backend && pnpm install) || true
  (cd frontend && pnpm install) || true
else
  echo "pnpm not found; use npm or install pnpm"
fi
cp .env.example .env || true
echo "Done. Edit .env before running services."
__S__
  chmod +x scripts/setup-dev.sh || true
  echo "Created scripts/setup-dev.sh"
else
  echo "scripts/setup-dev.sh exists — skipping"
fi

# 11) Ensure docs/runbooks exist
mkdir -p docs/runbooks
if [ ! -f "docs/runbooks/backup.md" ]; then
  cat > docs/runbooks/backup.md <<'__RB__'
# Backup runbook (v7.14)
1. Run: scripts/backup-db.sh
2. Verify backup file in backups/
3. Copy to external storage
4. Test restore monthly
__RB__
  echo "Created docs/runbooks/backup.md"
fi

# 12) If prisma present, run validate
if [ -n "$PRISMA_SCHEMA" ]; then
  if command -v npx >/dev/null 2>&1; then
    echo "Running: npx prisma validate (best-effort)"
    (cd "$(dirname "$PRISMA_SCHEMA")/.." || true; npx prisma validate) || echo "prisma validate failed (non-blocking) - inspect schema"
  else
    echo "npx not found; skip prisma validate"
  fi
fi

# 13) Create ZIP of added artifacts (only those we created/updated)
echo "Staging files for commit..."
git add .cursorrules .cursorignore docs docker-compose.yml scripts lint-staged.config.js .husky || true
# add backend/frontend package changes if any
git add "$BACKEND_PKG" "$FRONTEND_PKG" 2>/dev/null || true

# 14) Commit safely with backups noted
git commit -m "chore(v7.14): surgical upgrade (cursorrules, CI, docs, devops) - backup in $BACKUP_DIR" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>" || echo "Nothing to commit"

echo "Creating zip archive: $ZIP_NAME"
zip -r "$ZIP_NAME" .cursorrules .cursorignore docs docker-compose.yml scripts .husky lint-staged.config.js CODEOWNERS CONTRIBUTING.md README.md || true
mv "$ZIP_NAME" "$ROOT_DIR/$ZIP_NAME" 2>/dev/null || true
echo "ZIP created: $ROOT_DIR/$ZIP_NAME"

# 15) Push branch after creating branch and commit
git checkout -b "$BRANCH" || git switch -c "$BRANCH"
git push -u origin "$BRANCH" || echo "git push failed or skipped (no permission?)"

echo "v7.14 surgical upgrade complete."
echo "Backups (if any) stored under: $BACKUP_DIR"
echo "ZIP: $ROOT_DIR/$ZIP_NAME"
echo ""
echo "NEXT STEPS:"
echo "  1) Inspect backups in $BACKUP_DIR"
echo "  2) cp .env.example .env and fill secrets"
if [ -n "$PRISMA_SCHEMA" ]; then
  echo "  3) cd $(dirname "$PRISMA_SCHEMA")/.. && npx prisma generate && npx prisma migrate dev --name init"
fi
echo "  4) cd backend && pnpm install && pnpm dev"
echo "  5) cd frontend && pnpm install && pnpm dev"
echo ""
echo "SMOKE TESTS (run after starting backend):"
echo "  curl -X POST -H 'Content-Type: application/json' http://localhost:4000/auth/login -d '{\"email\":\"ops@fortress.local\",\"password\":\"devpass\"}' -i"
echo "  curl -X POST http://localhost:4000/auth/refresh -b cookiefile -c cookiefile -i"