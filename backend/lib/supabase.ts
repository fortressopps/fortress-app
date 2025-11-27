// ============================================================================
// SUPABASE ENTERPRISE CLIENT – Fortress-app
// Arquitetura: Production-grade
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// 1. Tipos
// ============================================================================
type LogLevel = "debug" | "info" | "warn" | "error";

export interface DBError {
  message: string;
  details?: unknown;
  hint?: string;
  code?: string;
}

export interface QueryOptions {
  retry?: number;   // número de tentativas
  timeout?: number; // ms
  audit?: boolean;  // salva no log
}

export interface AuditPayload {
  operation: string;
  table: string;
  timestamp: string;
  userId?: string;
  extra?: unknown;
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

const DEBUG_DB = process.env.DEBUG_DB === "true";

// ============================================================================
// 3. Logger Estruturado
// ============================================================================
function log(level: LogLevel, message: string, extra: Record<string, unknown> = {}) {
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
export const supabasePublic: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ============================================================================
// 5. Timeout Promisificado
// ============================================================================
function promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Query timeout after ${ms}ms`)), ms);
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
  let lastError: DBError | Error | null = null;

  while (attempt <= retry) {
    try {
      if (DEBUG_DB) log("debug", `Executando query tentativa #${attempt + 1}`);

      const result = await promiseTimeout(queryFn(client), timeout);

      if (result.error) throw result.error;

      if (auditFlag) {
        audit({
          operation: "query",
          table: "unknown",
          timestamp: new Date().toISOString(),
        });
      }

      if (!result.data) throw new Error("Query retornou vazio");
      return result.data;
    } catch (err: any) {
      lastError = err;
      attempt++;
      log("warn", "[DB WARNING] Tentativa falhou", { attempt, error: err?.message });
      if (attempt > retry) break;
    }
  }

  log("error", "[DB ERROR] Todas tentativas falharam", { error: lastError });
  throw new Error(`[DB ERROR] Query falhou após ${retry + 1} tentativas → ${String(lastError?.message)}`);
}

// ============================================================================
// 7. Helpers prontos para uso
// ============================================================================
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

// Safe table select
export async function safeSelect<T>(
  table: string,
  { page = 1, pageSize = 20 } = {}
): Promise<{ data: T[]; meta: ReturnType<typeof buildMeta> }> {
  const { from, to } = applyPagination(page, pageSize);

  const result = await dbQuery<{ data: T[]; count: number }>(
    supabaseAdmin,
    async (c) => {
      const { data, error, count } = await c
        .from<T>(table)
        .select("*", { count: "exact" })
        .range(from, to);
      return { data: data ?? [], error: error as DBError | null };
    },
    { retry: 2, timeout: 9000, audit: true }
  );

  const meta = buildMeta((result as any).count ?? 0, page, pageSize);
  return { data: (result as any).data ?? [], meta };
}

// Insert universal
export async function safeInsert<T>(table: string, payload: Partial<T>): Promise<T> {
  return dbQuery<T>(
    supabaseAdmin,
    async (c) => {
      const { data, error } = await c.from<T>(table).insert(payload).select().single();
      return { data, error: error as DBError | null };
    },
    { retry: 1, audit: true }
  );
}

// Update universal
export async function safeUpdate<T>(table: string, id: string | number, payload: Partial<T>): Promise<T> {
  return dbQuery<T>(
    supabaseAdmin,
    async (c) => {
      const { data, error } = await c.from<T>(table).update(payload).eq("id", id).select().single();
      return { data, error: error as DBError | null };
    },
    { retry: 1, audit: true }
  );
}

// Delete universal
export async function safeDelete(table: string, id: string | number): Promise<boolean> {
  await dbQuery<boolean>(
    supabaseAdmin,
    async (c) => {
      const { error } = await c.from(table).delete().eq("id", id);
      return { data: true, error: error as DBError | null };
    },
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
  } catch (err: any) {
    return { ok: false, error: err?.message };
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