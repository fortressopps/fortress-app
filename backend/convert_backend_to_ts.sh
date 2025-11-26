#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------
# Script: convert_backend_to_ts.sh
# Objetivo: Converter a estrutura backend JS -> TypeScript (boilerplate)
# Uso: run from backend/ (~/fortress-app/backend)
# ---------------------------------------------------------------------

echo "🚀 Iniciando conversão JS -> TypeScript (enterprise-ready)"
ROOT="$(pwd)"
SRC="src"
ROUTES_DIR="${SRC}/routes"
LIB_DIR="${SRC}/../lib"   # assume backend/lib está em backend/lib ou backend/src/../lib

TSCONFIG='tsconfig.json'
BACKUP_SUFFIX="_pre-ts-$(date +%Y%m%d%H%M%S)"

# 1) Criar tsconfig.json (se não existir)
if [ ! -f "${TSCONFIG}" ]; then
  cat > "${TSCONFIG}" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "resolveJsonModule": true,
    "allowJs": false,
    "noEmit": false,
    "baseUrl": ".",
    "paths": {
      "@lib/*": ["lib/*"],
      "@routes/*": ["src/routes/*"]
    }
  },
  "include": ["src/**/*.ts", "lib/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
JSON
  echo "✅ tsconfig.json criado."
else
  echo "ℹ️ tsconfig.json já existe — pulando criação."
fi

# 2) Instalar dependências dev (TypeScript + tipos) - apenas print, user runs install
echo
echo "📦 Próximo passo: instale dependências dev via npm/yarn/pnpm:"
echo "npm install -D typescript ts-node @types/node @types/express @types/cors @types/pg"
echo "ou: pnpm add -D typescript ts-node @types/node @types/express @types/cors @types/pg"
echo

# 3) Converter arquivos .js criados nas rotas para .ts
if [ ! -d "${ROUTES_DIR}" ]; then
  echo "❗ Diretório ${ROUTES_DIR} não encontrado. Saindo."
  exit 1
fi

echo "📁 Fazendo backup das rotas atuais em: ${ROUTES_DIR}${BACKUP_SUFFIX}"
mv "${ROUTES_DIR}" "${ROUTES_DIR}${BACKUP_SUFFIX}"

# Recriar routes e converter arquivos
mkdir -p "${ROUTES_DIR}"
for d in $(ls "${ROUTES_DIR}${BACKUP_SUFFIX}" 2>/dev/null || true); do
  # se for arquivo legacy (backup), pular (eles estão em backup)
  if [ -d "${ROUTES_DIR}${BACKUP_SUFFIX}/${d}" ]; then
    mkdir -p "${ROUTES_DIR}/${d}"

    # Se existir controller.js -> criar controller.ts com tipagens básicas
    if [ -f "${ROUTES_DIR}${BACKUP_SUFFIX}/${d}/controller.js" ]; then
      cat > "${ROUTES_DIR}/${d}/controller.ts" <<EOF
/* Auto-converted controller for route: ${d} */
import { Request, Response, NextFunction } from "express";
import * as Service from "./service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    const userId = (req as any).user?.id || null;
    const result = await Service.list({ page, pageSize, userId });
    return res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Service.getById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const userId = (req as any).user?.id || null;
    const created = await Service.create(payload, { userId });
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await Service.update(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await Service.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
EOF
      echo "Converted ${d}/controller.js -> ${d}/controller.ts"
    fi

    # service
    if [ -f "${ROUTES_DIR}${BACKUP_SUFFIX}/${d}/service.js" ]; then
      # keep table mapping heuristic
      TABLE="${d}"
      case "${d}" in
        accounts) TABLE="accounts" ;;
        transactions) TABLE="transactions" ;;
        supermarket) TABLE="supermarket_lists" ;;
        budget) TABLE="budgets" ;;
        analytics) TABLE="transactions" ;;
        investments) TABLE="investments" ;;
        bills) TABLE="bills" ;;
        auth) TABLE="users" ;;
        user) TABLE="users" ;;
        *) TABLE="${d}s" ;;
      esac

      cat > "${ROUTES_DIR}/${d}/service.ts" <<EOF
/* Auto-converted service for route: ${d} */
import supabaseWrapper from "../../lib/supabase";
const { supabaseAdmin, dbQuery, applyPagination, buildMeta } = supabaseWrapper;

export async function list({
  page = 1,
  pageSize = 20,
  userId = null,
}: {
  page?: number;
  pageSize?: number;
  userId?: string | null;
}) {
  const { from, to } = applyPagination(page, pageSize);
  const table = "${TABLE}";

  const res: any = await dbQuery(
    supabaseAdmin,
    (c) =>
      c
        .from(table)
        .select("*", { count: "exact" })
        .range(from, to)
        .order("date", { ascending: false }),
    { retry: 2, timeout: 9000, audit: true }
  );

  const total = res?.count ?? 0;
  const meta = buildMeta(total, page, pageSize);

  return { data: res?.data || [], meta };
}

export async function getById(id: string) {
  const table = "${TABLE}";
  const res: any = await dbQuery(supabaseAdmin, (c) => c.from(table).select("*").eq("id", id).single());
  return res?.data || null;
}

export async function create(payload: any, opts: { userId?: string | null } = {}) {
  const table = "${TABLE}";
  const res: any = await dbQuery(supabaseAdmin, (c) => c.from(table).insert([payload]).select().single());
  return res?.data;
}

export async function update(id: string, payload: any) {
  const table = "${TABLE}";
  const res: any = await dbQuery(supabaseAdmin, (c) => c.from(table).update(payload).eq("id", id).select().single());
  return res?.data;
}

export async function remove(id: string) {
  const table = "${TABLE}";
  await dbQuery(supabaseAdmin, (c) => c.from(table).delete().eq("id", id));
  return true;
}
EOF
      echo "Converted ${d}/service.js -> ${d}/service.ts"
    fi

    # index
    if [ -f "${ROUTES_DIR}${BACKUP_SUFFIX}/${d}/index.js" ]; then
      cat > "${ROUTES_DIR}/${d}/index.ts" <<EOF
/* Router index for ${d} */
import { Router } from "express";
import * as Controller from "./controller";

const router = Router();

router.get("/", Controller.list);
router.post("/", Controller.create);

router.get("/:id", Controller.getById);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;
EOF
      echo "Converted ${d}/index.js -> ${d}/index.ts"
    fi
  fi
done

# 4) Gerar aggregator de rotas src/routes/index.ts
AGG="${ROUTES_DIR}/index.ts"
cat > "${AGG}" <<'EOF'
/**
 * Aggregator de rotas (TypeScript)
 */
import { Router } from "express";
EOF

for d in $(ls "${ROUTES_DIR}" | grep -v "_legacy_backup" || true); do
  if [ -d "${ROUTES_DIR}/${d}" ]; then
    echo "import ${d}Router from './${d}/index';" >> "${AGG}"
  fi
done

cat >> "${AGG}" <<'EOF'

const router = Router();
EOF

for d in $(ls "${ROUTES_DIR}" | grep -v "_legacy_backup" || true); do
  if [ -d "${ROUTES_DIR}/${d}" ]; then
    echo "router.use('/${d}', ${d}Router);" >> "${AGG}"
  fi
done

cat >> "${AGG}" <<'EOF'

export default router;
EOF

echo "✅ Aggregator src/routes/index.ts gerado."

# 5) Gerar backend/lib/supabase.ts (enterprise) — cria backup se já existir
LIB_FILE="../lib/supabase.ts"
if [ -f "../lib/supabase.js" ]; then
  echo "🔁 Backup do supabase.js -> ../lib/supabase.js.bak"
  cp ../lib/supabase.js ../lib/supabase.js.bak
fi

cat > ../lib/supabase.ts <<'TS'
/* ---------------------------------------------------------------------------
   SUPABASE ENTERPRISE CLIENT – Fortress-app (TypeScript)
   Substitua/adicione as variáveis de ambiente SUPABASE_URL, SUPABASE_ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY no seu .env ou infraestrutura.
   --------------------------------------------------------------------------- */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type LogLevel = "debug" | "info" | "warn" | "error";

interface DBError {
  message: string;
  details?: any;
  hint?: string;
  code?: string;
}

interface QueryOptions {
  retry?: number;
  timeout?: number;
  audit?: boolean;
}

interface AuditPayload {
  operation: string;
  table: string;
  timestamp: string;
  userId?: string;
  extra?: any;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[ENV ERROR] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_ANON_KEY = requireEnv("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const DEBUG_DB = process.env.DEBUG_DB === "true";

function log(level: LogLevel, message: string, extra: any = {}) {
  const logEntry = {
    level,
    message,
    extra,
    timestamp: new Date().toISOString(),
  };
  if (level === "error") {
    console.error(logEntry);
  } else {
    console.log(logEntry);
  }
}

function audit(entry: AuditPayload) {
  log("info", "[AUDIT] operação BD registrada", entry);
}

export const supabasePublic: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: any;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Query timeout after ${ms}ms`));
    }, ms);
  });

  return Promise.race([
    promise.then((result) => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeout,
  ]);
}

export async function dbQuery<T>(
  client: SupabaseClient,
  queryFn: (c: SupabaseClient) => Promise<{ data: T | null; error: DBError | null }>,
  options: QueryOptions = {}
): Promise<T> {
  const { retry = 1, timeout = 8000, audit: auditFlag = false } = options;

  let attempt = 0;
  let lastError: any;

  while (attempt <= retry) {
    try {
      if (DEBUG_DB) log("debug", `Executando query tentativa #${attempt + 1}`);

      const result = await promiseTimeout(queryFn(client), timeout);

      if ((result as any).error) {
        throw (result as any).error;
      }

      if (auditFlag) {
        audit({
          operation: "query",
          table: "unknown",
          timestamp: new Date().toISOString(),
        });
      }

      return (result as any).data as T;
    } catch (err: any) {
      lastError = err;
      attempt++;

      log("warn", "[DB WARNING] Tentativa falhou", {
        attempt,
        error: err?.message,
      });

      if (attempt > retry) break;
    }
  }

  log("error", "[DB ERROR] Todas tentativas falharam", { error: lastError });

  throw new Error(
    `[DB ERROR] Query falhou após ${retry + 1} tentativas → ${String(lastError?.message)}`
  );
}

export function applyPagination(page = 1, pageSize = 20): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function buildMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function safeSelect<T>(table: string, { page = 1, pageSize = 20 } = {}) {
  const { from, to } = applyPagination(page, pageSize);

  const data: any = await dbQuery(
    supabaseAdmin,
    (c) => c.from(table).select("*", { count: "exact" }).range(from, to),
    {
      retry: 2,
      timeout: 9000,
      audit: true,
    }
  );

  return {
    data: data?.data ?? [],
    meta: buildMeta(data?.count ?? 0, page, pageSize),
  };
}

export async function safeInsert<T>(table: string, payload: any): Promise<T> {
  return dbQuery(
    supabaseAdmin,
    (c) => c.from(table).insert(payload).select().single(),
    { retry: 1, audit: true }
  );
}

export async function safeUpdate<T>(table: string, id: string | number, payload: any): Promise<T> {
  return dbQuery(
    supabaseAdmin,
    (c) => c.from(table).update(payload).eq("id", id).select().single(),
    { retry: 1, audit: true }
  );
}

export async function safeDelete(table: string, id: string | number): Promise<boolean> {
  await dbQuery(supabaseAdmin, (c) => c.from(table).delete().eq("id", id), { retry: 1, audit: true });
  return true;
}

export async function dbHealthCheck() {
  try {
    await supabasePublic.from("health_check").select("*").limit(1);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export default {
  supabasePublic,
  supabaseAdmin,
  dbQuery,
  safeSelect,
  safeInsert,
  safeUpdate,
  safeDelete,
  buildMeta,
  applyPagination,
  dbHealthCheck,
} as const;
TS
echo "✅ backend/lib/supabase.ts gerado."

# 6) Ajustes de package.json (scripts TS)
if [ -f "package.json" ]; then
  echo "🔁 Atualizando package.json scripts para suporte TS (faz backup antes)"
  cp package.json package.json.bak
  node -e "
  const fs=require('fs');
  const p=JSON.parse(fs.readFileSync('package.json','utf8'));
  p.scripts = p.scripts || {};
  p.scripts['build']='tsc';
  p.scripts['dev']='ts-node -r tsconfig-paths/register src/index.ts';
  p.scripts['start']='node dist/index.js';
  fs.writeFileSync('package.json', JSON.stringify(p,null,2));
  console.log('package.json atualizado (backup: package.json.bak)');
  "
else
  echo "⚠️ package.json não encontrado. Pule para ajustar manualmente."
fi

echo
echo "🎯 Conclusão: arquivos TypeScript gerados. Siga os próximos passos impressos abaixo."
echo "— Para instalar dependências dev: npm install -D typescript ts-node @types/node @types/express @types/cors @types/pg tsconfig-paths"
echo "— Verifique e ajuste imports relativos se necessário."
echo "— Execute 'npm run build' e 'npm run dev' (após instalar deps)."
echo
echo "👷 Recomendações pós-conversão:"
echo "1) Ajustar tipos domain (DTOs) nos services e controllers."
echo "2) Adicionar validação com zod/joi e tipar payloads."
echo "3) Rodar testes e corrigir erros de compilação TS (caso apareçam)."
echo
echo "Script finalizado."
