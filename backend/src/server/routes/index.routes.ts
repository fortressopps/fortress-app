// src/server/routes/index.routes.ts
import { authRoutes } from "./auth.routes";
import { oauthRoutes } from "./oauth.routes";
import { supermarketRoutes } from "../modules/supermarket/supermarket.routes";

export function registerModuleRoutes(app: Hono) {
  app.route("/", authRoutes);
  app.route("/supermarket", supermarketRoutes);
  app.route("/", oauthRoutes);
  app.get("/", (c) => c.json({ message: "Fortress API v7.24" }));
}
