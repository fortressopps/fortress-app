# Supabase + Prisma — Setup e correções (P1001 / Pooler)

Se você ver `P1001: Can't reach database server`, na prática isso costuma ser **rede/IPv4** + necessidade de **Pooler**, ou projeto pausado.

## 1. Resume Supabase project (free tier)

Free tier projects pause after 7 days of inactivity. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → Settings → General → **Restore project**.

## 2. Fix DATABASE_URL with SSL

Supabase requires SSL. Add `?sslmode=require` to your connection string:

```env
# Wrong (no SSL):
DATABASE_URL="postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres"

# Correct:
DATABASE_URL="postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres?sslmode=require"
```

## 3. Use Session Pooler (recommended)

No Supabase Dashboard: **Connect** → Method **Session pooler**.

Importante:
- Em redes IPv4, a **Direct connection** pode falhar com “Not IPv4 compatible”.
- No **Pooler**, o usuário costuma ser **`postgres.<project_ref>`** (ex.: `postgres.sicqecnidjcjxhlmkdcg`), não apenas `postgres`.

```env
# Exemplo (ajuste host/porta conforme o Connect do seu projeto)
DATABASE_URL="postgresql://postgres.<project_ref>:password@aws-0-xx.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true"
```

### Erro comum: “FATAL: Tenant or user not found”

Isso acontece quando você usa `postgres` em vez de `postgres.<project_ref>` no pooler.

## 4. Local development (bypass Supabase)

**Se o Supabase não funcionar, use Postgres local:**

```bash
# Subir Postgres local
docker compose -f docker-compose.dev.yml up -d

# Rodar migrations
cd backend && npx prisma migrate deploy
```

Em `backend/.env`, use:

```env
DATABASE_URL="postgresql://fortress_app:local@localhost:5432/fortress"
```

Depois: `npm run dev`
