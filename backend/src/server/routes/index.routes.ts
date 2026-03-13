// src/server/routes/index.routes.ts
import type { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import goalsRoutes from "./goals.routes";
import { oauthRoutes } from "./oauth.routes";
import { supermarketRoutes } from "../../modules/supermarket/supermarket.routes";
import { forecastRoutes } from "../../modules/forecast/forecast.routes";
import { kernelRoutes } from "../../modules/kernel/kernel.routes";
import { transactionRoutes } from "./transaction.routes";
import { marketRoutes } from "./market.routes";
import { alertRoutes } from "./alerts.routes";
import { userRoutes } from "./users.routes";
import aiRoutes from "./ai.routes";

export function registerModuleRoutes(app: Hono) {
  app.route("/", authRoutes);
  app.route("/goals", goalsRoutes);
  app.route("/users", userRoutes);
  app.route("/supermarket", supermarketRoutes);
  app.route("/", oauthRoutes);
  app.route("/forecast", forecastRoutes);
  app.route("/kernel", kernelRoutes);
  app.route("/transactions", transactionRoutes);
  app.route("/market-data", marketRoutes);
  app.route("/alerts", alertRoutes);
  app.route("/ai", aiRoutes);
  app.get("/", (c) => c.json({ message: "Fortress API v7.24" }));
}
