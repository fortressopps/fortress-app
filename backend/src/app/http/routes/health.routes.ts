/**
 * FORTRESS v7.21 — health.routes.ts
 * Rota de health-check para garantir que a API está funcional.
 */

import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "fortress-backend",
    message: "Fortress API is running — v7.21",
    timestamp: new Date().toISOString(),
  });
});
