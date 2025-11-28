// src/core/app.bootstrap.ts
import type { Application } from "express";
import path from "path";

import { initLogger } from "../config/logger.config.js";
import { initDb } from "../config/db.config.js";
import { initRedis } from "../config/redis.config.js";
import { securityInit } from "../config/security.config.js";

import { registerHttpRoutes } from "../http/routes/index.routes.js";
import { registerHealthRoutes } from "../http/routes/health.routes.js";

/**
 * bootstrapApp
 * - Inicializa infra (DB, Redis, Logger, Security)
 * - Registra rotas HTTP (módulos)
 * - Aplica middlewares específicos por rota
 */
export async function bootstrapApp(app: Application) {
  // 1) logger (instancia global exportada pelo config)
  const logger = initLogger();

  // 2) load infra (db, redis)
  try {
    await initDb();
    logger.info("DB initialized");
  } catch (err) {
    logger.error({ err }, "DB init failed");
    throw err;
  }

  try {
    await initRedis();
    logger.info("Redis initialized");
  } catch (err) {
    // Redis é opcional em alguns fluxos — log e continue
    logger.warn({ err }, "Redis not available (continuing without Redis)");
  }

  // 3) security hardening (CSP, cookies policy, rate-limit already applied at main)
  securityInit(app);

  // 4) register health/readiness routes early (no auth)
  registerHealthRoutes(app);

  // 5) register application modular routes (auth, users, supermarket, ...)
  registerHttpRoutes(app);

  // 6) attach a small "ready" log
  logger.info("App bootstrap complete — routes registered");

  return app;
}
export default bootstrapApp;
