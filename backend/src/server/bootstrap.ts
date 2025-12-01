// src/server/bootstrap.ts
import type { Hono } from "hono";

import { initInfra } from "../libs/infra.init";
import { applySecurity } from "../libs/security";
import { Logger } from "../libs/logger";

import { registerHealthRoutes } from "./routes/health.routes";
import { registerModuleRoutes } from "./routes/index.routes";

export async function bootstrap(app: Hono) {
  Logger.info("🔧 Bootstrapping Fortress backend...");

  // 1) Inicializa prisma, logger, redis, seeds, etc
  await initInfra();

  // 2) Segurança
  applySecurity(app);

  // 3) Rotas essenciais (health, readiness)
  registerHealthRoutes(app);

  // 4) Rotas de módulos (supermarket, users, insights, etc)
  registerModuleRoutes(app);

  Logger.info("✔️ Bootstrap completo.");
  return app;
}
