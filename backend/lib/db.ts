// lib/db.ts
/**
 * Fortress Enterprise — Prisma Client Factory (v5)
 * -------------------------------------------------
 * Recursos:
 *  - Conexão singleton com proteção anti-leaks
 *  - Pool tuning por variáveis de ambiente
 *  - Logging estruturado via fortressLogger
 *  - Middlewares de auditoria (latência, erro, tabelas)
 *  - Tratamento de "slow queries"
 *  - Suporte a gracefulShutdown
 */

import { PrismaClient } from "@prisma/client";
import { fortressLogger } from "@utils/logger";

/* -------------------------------------------------------------------------- */
/*  🔧 Pool & Config                                                          */
/* -------------------------------------------------------------------------- */

const prismaLogLevel = ["error", "warn"] as const;

const PRISMA_POOL_MIN = Number(process.env.PRISMA_POOL_MIN ?? "2");
const PRISMA_POOL_MAX = Number(process.env.PRISMA_POOL_MAX ?? "10");
const PRISMA_SLOW_QUERY_MS = Number(process.env.PRISMA_SLOW_QUERY_MS ?? "150");

/* -------------------------------------------------------------------------- */
/*  🧱 Singleton                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Evita recriação do client em Hot Reload (Next.js, Vite, ts-node-dev, etc.)
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLogLevel,
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Guarda instância global fora de produção
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* -------------------------------------------------------------------------- */
/*  🕵️ Middlewares de Auditoria                                              */
/* -------------------------------------------------------------------------- */

/**
 * Monitora todas as queries (latência, slow detection, erro)
 */
prisma.$use(async (params, next) => {
  const start = performance.now();

  try {
    const result = await next(params);
    const duration = performance.now() - start;

    if (duration >= PRISMA_SLOW_QUERY_MS) {
      fortressLogger.warn({
        event: "DB.SLOW_QUERY",
        model: params.model,
        action: params.action,
        durationMs: duration,
      });
    }

    return result;
  } catch (err: any) {
    fortressLogger.error({
      event: "DB.QUERY_ERROR",
      model: params.model,
      action: params.action,
      message: err?.message,
      code: err?.code,
    });
    throw err;
  }
});

/**
 * Auditoria leve (model + action)
 */
prisma.$use(async (params, next) => {
  fortressLogger.debug({
    event: "DB.OP",
    model: params.model,
    action: params.action,
  });
  return next(params);
});

/* -------------------------------------------------------------------------- */
/*  🧨 Proteção contra query injection em $queryRaw                          */
/* -------------------------------------------------------------------------- */
prisma.$use(async (params, next) => {
  if (params.action === "$queryRaw" || params.action === "$queryRawUnsafe") {
    fortressLogger.warn({
      event: "DB.RAW_QUERY",
      danger: params.action === "$queryRawUnsafe",
    });
  }
  return next(params);
});

/* -------------------------------------------------------------------------- */
/*  🛑 Graceful Shutdown (SIGTERM / SIGINT)                                   */
/* -------------------------------------------------------------------------- */

let shuttingDown = false;

export const disconnectPrisma = async () => {
  if (shuttingDown) return;
  shuttingDown = true;

  fortressLogger.info({ event: "DB.DISCONNECT", message: "Closing Prisma Client" });
  await prisma.$disconnect();
};

process.on("SIGTERM", disconnectPrisma);
process.on("SIGINT", disconnectPrisma);

/* -------------------------------------------------------------------------- */
/*  Export padrão                                                            */
/* -------------------------------------------------------------------------- */

export default prisma;
