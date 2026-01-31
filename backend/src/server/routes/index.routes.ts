// src/server/routes/index.routes.ts
import type { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import { supermarketRoutes } from "../../modules/supermarket/supermarket.routes";

export function registerModuleRoutes(app: Hono) {
  app.route("/", authRoutes);
  app.route("/supermarket", supermarketRoutes);
  app.get("/", (c) => c.json({ message: "Fortress API v7.24" }));
}
