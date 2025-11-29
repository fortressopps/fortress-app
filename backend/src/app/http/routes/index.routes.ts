// backend/src/app/http/routes/index.routes.ts
import { Hono } from "hono";
import { healthRoutes } from "./health.routes.js";
import { supermarketRoutes } from "./supermarket.routes.js";

export const indexRoutes = new Hono();

// Health check
indexRoutes.route("/health", healthRoutes);

// Supermarket module
indexRoutes.route("/supermarket", supermarketRoutes);
