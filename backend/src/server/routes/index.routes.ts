// src/server/routes/index.routes.ts
import type { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import goalsRoutes from "./goals.routes";
import { oauthRoutes } from "./oauth.routes";
import { supermarketRoutes } from "../../modules/supermarket/supermarket.routes";
import { forecastRoutes } from "../../modules/forecast/forecast.routes";

export function registerModuleRoutes(app: Hono) {
  app.route("/", authRoutes);
  app.route("/goals", goalsRoutes);
  app.route("/supermarket", supermarketRoutes);
  app.route("/", oauthRoutes);
  app.route("/forecast", forecastRoutes);
  app.get("/", (c) => c.json({ message: "Fortress API v7.24" }));
}
