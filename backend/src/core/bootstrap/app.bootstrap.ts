/**
 * FORTRESS — app.bootstrap.ts (v7.21)
 * Responsável apenas por montar camadas HTTP:
 * - Middlewares globais
 * - Adaptadores
 * - Rotas
 * - Error handling
 */

import type { Express } from "express";
import express from "express";
import routes from "../../app/http/routes/index.routes.js";
import { errorMiddleware } from "../../app/http/middleware/error.middleware.js";

export async function bootstrapApplication(app: Express): Promise<void> {
  //
  // 1. Middlewares essenciais
  //
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  //
  // 2. Rotas principais (já modularizadas v7.21)
  //
  app.use("/api", routes);

  //
  // 3. Error handler central
  //
  app.use(errorMiddleware);
}
