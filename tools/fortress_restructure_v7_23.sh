#!/usr/bin/env bash
set -euo pipefail

# tools/fortress_restructure_v7_23.sh
# Usage:
#   DRY_RUN=1 ./tools/fortress_restructure_v7_23.sh   # show only
#   DRY_RUN=0 ./tools/fortress_restructure_v7_23.sh   # execute destructive actions

ROOT_DIR="$(pwd)"
BRANCH="infra/v7.23-restructure"
AUTHOR_NAME="${GIT_AUTHOR_NAME:-$(git config user.name || echo "fortressopps")}"
AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo "fortressopps@example.com")}"
MANIFEST="removed_files_v7.23.txt"
DRY_RUN="${DRY_RUN:-1}"

echo "======================================"
echo " FORTRESS v7.23 — DESTRUCTIVE RESTRUCTURE"
echo " Repo root: $ROOT_DIR"
echo " Branch: $BRANCH"
echo " DRY_RUN: $DRY_RUN (1=show, 0=execute)"
echo "======================================"
echo

# 1) Ensure git repo
if [ ! -d ".git" ]; then
  echo "ERROR: Not a git repository. Run from repo root."
  exit 1
fi

# 2) Ensure clean working tree
if [ -n "$(git status --porcelain)" ] && [ "$DRY_RUN" = "0" ]; then
  echo "ERROR: Working tree not clean. Commit or stash changes first."
  git status --porcelain
  exit 1
fi

# 3) Create branch (dry-run will show command)
if [ "$DRY_RUN" = "1" ]; then
  echo "[DRY RUN] git checkout -b $BRANCH"
else
  git fetch origin || true
  git checkout -b "$BRANCH"
fi

# 4) Define removal patterns
REMOVE_TRACKED_PATTERNS=(
  "docker-compose*.yml"
  "docker-compose.yml"
  "docker-compose.*.yml"
  "docker-config"
  "backups"
  "backup*"
  "_legacy_*"
  "_backup_*"
  "dist"
  "build"
  "out"
  "node_modules"
  "secrets"
  "server.ts"
  "*.old"
  "*.bak"
  "*.tmp"
  "*.log"
  ".DS_Store"
  "coverage"
  ".cache"
  "fortress-*.zip"
  "apply-*.sh"
)

# Also remove common legacy CI/husky files if present
LEGACY_FILES=(
  ".github/workflows/ci-legacy.yml"
  ".github/workflows/old-ci.yml"
  ".husky/old-hook"
  "tools/old_*"
)

# 5) Create new folder tree
NEW_DIRS=(
  "frontend"
  "backend"
  "infra"
  "scripts"
  "docs"
  ".github/workflows"
)

# 6) Prepare manifest
echo "Manifest of removed files for v7.23 (generated: $(date --iso-8601=seconds))" > "$MANIFEST"
echo "DO NOT COMMIT SECRETS. This file lists removed paths." >> "$MANIFEST"
echo "" >> "$MANIFEST"

# Helper: dry/exec remove
dry_exec() {
  if [ "$DRY_RUN" = "1" ]; then
    echo "[DRY RUN] $*"
  else
    echo "[EXEC] $*"
    eval "$@"
  fi
}

# Collect files that match patterns (tracked + untracked)
echo "Scanning for files/dirs to remove..."
FOUND_TO_REMOVE=()

for pat in "${REMOVE_TRACKED_PATTERNS[@]}"; do
  # find matches (both tracked and untracked)
  while IFS= read -r -d $'\0' f; do
    FOUND_TO_REMOVE+=("$f")
  done < <(find . -path './.git' -prune -o -iname "$pat" -print0 2>/dev/null || true)
done

for f in "${LEGACY_FILES[@]}"; do
  if [ -e "$f" ]; then
    FOUND_TO_REMOVE+=("$f")
  fi
done

# deduplicate
IFS=$'\n' read -r -d '' -a FOUND_TO_REMOVE < <(printf "%s\n" "${FOUND_TO_REMOVE[@]}" | awk '!seen[$0]++' && printf '\0')

if [ "${#FOUND_TO_REMOVE[@]}" -eq 0 ]; then
  echo "No matching legacy files found for removal."
else
  echo "Found ${#FOUND_TO_REMOVE[@]} paths to remove."
  printf "%s\n" "${FOUND_TO_REMOVE[@]}" | sed 's/^/  - /'
fi

# 7) Remove files (git tracked with git rm, untracked with rm -rf)
for p in "${FOUND_TO_REMOVE[@]}"; do
  # normalize path
  pnorm="${p#./}"
  echo "$pnorm" >> "$MANIFEST"
  if git ls-files --error-unmatch "$pnorm" >/dev/null 2>&1; then
    dry_exec git rm -rf --ignore-unmatch -- "$pnorm" || true
  else
    dry_exec rm -rf -- "$pnorm" || true
  fi
done

# 8) Remove secrets dir if exists (secure, no backup)
if [ -d "secrets" ]; then
  echo "secrets/" >> "$MANIFEST"
  dry_exec rm -rf -- "secrets"
fi

# 9) Create new directory tree
echo
echo "Creating new directory tree..."
for d in "${NEW_DIRS[@]}"; do
  dry_exec mkdir -p "$d"
done

# 10) Create standardized files (.gitignore, .env.example, README.md)
GITIGNORE_CONTENT="
# Node
node_modules/
dist/
build/
out/
coverage/

# OS
.DS_Store
Thumbs.db

# Secrets and config
.env
secrets/
docker-config/
docker-compose*.yml
backups/
backup*/
_backup_*/

# Editor
.vscode/
.idea/
"

ENV_EXAMPLE_CONTENT="# .env.example - fortress v7.23
# Database
DATABASE_URL=postgresql://fortress_app:CHANGEME@localhost:5432/fortress?schema=public

# Redis
REDIS_URL=redis://:CHANGEME@localhost:6379

# JWT
JWT_SECRET=CHANGEME
REFRESH_TOKEN_SECRET=CHANGEME

# App
APP_ENV=development
PORT=3001
"

README_MINIMAL="# Fortress App — v7.23 (consolidated)
This repository was restructured to Fortress method v7.23 (hexagonal, modular).
Folders:
- frontend/
- backend/
- infra/
- scripts/
- docs/

Important:
- Replace secrets in environment variables. Do NOT commit real secrets.
- See scripts/init-dev.sh to bootstrap local dev.

"

# Add files
echo
echo "Writing standard files (.gitignore, .env.example, README.md)..."
if [ "$DRY_RUN" = "1" ]; then
  echo "[DRY RUN] Create .gitignore with content:"
  echo "$GITIGNORE_CONTENT"
  echo "[DRY RUN] Create .env.example with content:"
  echo "$ENV_EXAMPLE_CONTENT"
  echo "[DRY RUN] Create README.md with content:"
  echo "$README_MINIMAL"
else
  printf "%s" "$GITIGNORE_CONTENT" > .gitignore
  printf "%s" "$ENV_EXAMPLE_CONTENT" > .env.example
  printf "%s" "$README_MINIMAL" > README.md
  git add .gitignore .env.example README.md || true
fi

# 11) Normalize package.json locations: do not modify contents, but ensure root package.json exists
if [ ! -f "package.json" ]; then
  echo "Root package.json not found — creating minimal placeholder."
  if [ "$DRY_RUN" = "1" ]; then
    echo "[DRY RUN] Create package.json (placeholder)"
  else
    cat > package.json <<'EOF'
{
  "name": "fortress-root",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "bootstrap": "echo bootstrap scripts here"
  }
}
EOF
    git add package.json || true
  fi
fi

# 12) Create utility scripts (init-dev.sh, doctor.sh)
if [ "$DRY_RUN" = "1" ]; then
  echo "[DRY RUN] create scripts/init-dev.sh and scripts/doctor.sh"
else
  cat > scripts/init-dev.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "Bootstrapping Fortress v7.23 local dev..."
echo "1) Create .env from .env.example and fill secrets."
echo "2) Start infra (docker compose) if using docker."
echo "3) cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init"
echo "4) cd frontend && npm install && npm run dev"
EOF
  chmod +x scripts/init-dev.sh

  cat > scripts/doctor.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "Repo health check v7.23"
echo "- Node version: $(node -v || echo 'node missing')"
echo "- Git branch: $(git branch --show-current || echo 'no git')"
echo "- Docker: $(docker --version 2>/dev/null || echo 'docker missing')"
EOF
  chmod +x scripts/doctor.sh
  git add scripts/init-dev.sh scripts/doctor.sh || true
fi

# 13) Stage & commit changes (if not dry-run)
if [ "$DRY_RUN" = "1" ]; then
  echo
  echo "[DRY RUN] Summary:"
  echo "  - Branch to create: $BRANCH"
  echo "  - Manifest file: $MANIFEST (contains list of removed paths)"
  echo "  - When ready to run destructively: DRY_RUN=0 ./tools/fortress_restructure_v7_23.sh"
  echo
  echo "Preview of manifest (top 50 lines):"
  head -n 50 "$MANIFEST" || true
  exit 0
else
  # ensure manifest is added
  git add "$MANIFEST" || true
  git commit -m "chore(v7.23): destructive restructure -> v7.23 (hexagonal, consolidated)" --author="$AUTHOR_NAME <$AUTHOR_EMAIL>" || true
  git tag -a "v7.23" -m "v7.23 restructure" || true

  echo
  echo "DONE: v7.23 restructure applied locally on branch $BRANCH"
  echo "Manifest of removed paths saved to $MANIFEST"
  echo "Commit created and tag v7.23 added."

  # final push prompt (do not auto-push without final confirmation)
  echo
  read -p "Push branch '$BRANCH' and tag 'v7.23' to origin now? (y/N) " yn
  if [[ "$yn" =~ ^[Yy]$ ]]; then
    git push -u origin "$BRANCH"
    git push origin "v7.23"
    echo "Pushed branch and tag."
  else
    echo "Push skipped. Run 'git push -u origin $BRANCH' and 'git push origin v7.23' when ready."
  fi
fi

# end script
