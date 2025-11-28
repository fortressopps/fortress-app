/**
 * FORTRESS v7.21 — index.routes.ts
 * Router unificado da camada HTTP
 */

import { Router } from "express";
import { healthRouter } from "./health.routes.js";

const router = Router();

// Rotas principais
router.use("/health", healthRouter);

export default router;
