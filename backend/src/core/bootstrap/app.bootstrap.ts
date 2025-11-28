import type { Application } from "express";
import { registerAppRoutes } from "../../app/http/routes/index.routes.js";
import { initInfra } from "../../infra/init/infra.init.js";
import { logger } from "../../config/logger/logger.config.js";

export async function bootstrapApp(app: Application) {
  await initInfra();
  registerAppRoutes(app);
  logger.info("App bootstrap complete");
  return app;
}
