// ============================================================================
// SUPABASE ENTERPRISE CLIENT – Fortress-app
// Arquitetura: Production-grade
// Este arquivo foi projetado para ser o núcleo de comunicação interna com o
// Supabase, garantindo:
// - segurança
// - observabilidade
// - consistência
// - extensibilidade
// - padronização
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// 1. Tipos
// ============================================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface DBError {
  message: string;
  details?: any;
  hint?: string;
  code?: string;
}

interface QueryOptions {
  retry?: number; // número de tentativas
  timeout?: number; // ms
  audit?: boolean; // salva no log
}

interface AuditPayload {
  operation: string;
  table: string;
  timestamp: string;
  userId?: string;
  extra?: any;
}

// ============================================================================
// 2. Validação de Variáveis de Ambiente
// ============================================================================

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

// modo debug opcional
const DEBUG_DB = process.env.DEBUG_DB === "true";

// ============================================================================
// 3. Logger Estruturado
// ============================================================================

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

// ============================================================================
// 4. Criação dos clients
// ============================================================================

// client público (para rotas públicas ou leitura)
export const supabasePublic: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
  }
);

// client privado (SERVICE ROLE) – NUNCA expor ao frontend
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

// ============================================================================
// 5. Timeout Promisificado
// ============================================================================

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

// ============================================================================
// 6. Wrapper universal para queries
// ============================================================================

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

      if (result.error) {
        throw result.error;
      }

      if (auditFlag) {
        audit({
          operation: "query",
          table: "unknown", // preenchido quando usado
          timestamp: new Date().toISOString(),
        });
      }

      return result.data as T;
    } catch (err: any) {
      lastError = err;
      attempt++;

      log("warn", "[DB WARNING] Tentativa falhou", {
        attempt,
        error: err.message,
      });

      if (attempt > retry) break;
    }
  }

  log("error", "[DB ERROR] Todas tentativas falharam", {
    error: lastError,
  });

  throw new Error(
    `[DB ERROR] Query falhou após ${retry + 1} tentativas → ${String(
      lastError?.message
    )}`
  );
}

// ============================================================================
// 7. Helpers prontos para uso
// ============================================================================

// Paginação consistente
export function applyPagination(
  page: number = 1,
  pageSize: number = 20
): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}

// Retorno padronizado com "meta"
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

// Safe table select
export async function safeSelect<T>(
  table: string,
  { page = 1, pageSize = 20 } = {}
): Promise<{ data: T[]; meta: any }> {
  const { from, to } = applyPagination(page, pageSize);

  const data = await dbQuery(
    supabaseAdmin,
    (c) =>
      c
        .from(table)
        .select("*", { count: "exact" })
        .range(from, to),
    {
      retry: 2,
      timeout: 9000,
      audit: true,
    }
  );

  const meta = buildMeta(data.count ?? 0, page, pageSize);

  return {
    data: (data as any).data ?? [],
    meta,
  };
}

// Insert universal
export async function safeInsert<T>(
  table: string,
  payload: any
): Promise<T> {
  return dbQuery(
    supabaseAdmin,
    (c) => c.from(table).insert(payload).select().single(),
    { retry: 1, audit: true }
  );
}

// Update universal
export async function safeUpdate<T>(
  table: string,
  id: string | number,
  payload: any
): Promise<T> {
  return dbQuery(
    supabaseAdmin,
    (c) => c.from(table).update(payload).eq("id", id).select().single(),
    { retry: 1, audit: true }
  );
}

// Delete universal
export async function safeDelete(
  table: string,
  id: string | number
): Promise<boolean> {
  await dbQuery(
    supabaseAdmin,
    (c) => c.from(table).delete().eq("id", id),
    { retry: 1, audit: true }
  );

  return true;
}

// ============================================================================
// 8. Health-check simples para sistemas de monitoramento
// ============================================================================

export async function dbHealthCheck() {
  try {
    await supabasePublic.from("health_check").select("*").limit(1);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ============================================================================
// 9. Exports
// ============================================================================

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
};
