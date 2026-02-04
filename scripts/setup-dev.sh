#!/usr/bin/env bash
set -euo pipefail
echo "Installing backend deps..."
( cd backend && if command -v pnpm >/dev/null 2>&1; then pnpm install; else npm install; fi )
if [ ! -f backend/.env ]; then
  echo "Creating backend/.env from .env.example..."
  cp backend/.env.example backend/.env
  python - <<'PY'
import pathlib
import re
import secrets

path = pathlib.Path("backend/.env")
text = path.read_text()

values = {
    "DATABASE_URL": "postgresql://fortress_app:fortress@localhost:5432/fortress?schema=public",
    "REDIS_URL": "redis://localhost:6379",
    "JWT_SECRET": secrets.token_urlsafe(48),
    "SESSION_SECRET": secrets.token_urlsafe(48),
    "REFRESH_TOKEN_SECRET": secrets.token_urlsafe(48),
}

for key, value in values.items():
    pattern = re.compile(rf"^{key}=.*$", re.MULTILINE)
    replacement = f'{key}="{value}"'
    if pattern.search(text):
        text = pattern.sub(replacement, text)
    else:
        text += f"\n{replacement}\n"

path.write_text(text)
PY
else
  echo "backend/.env already exists. Skipping generation."
fi
echo "Generating prisma client..."
( cd backend && npx prisma generate ) || true
echo "Setup complete. Edit backend/.env and run backend commands."
