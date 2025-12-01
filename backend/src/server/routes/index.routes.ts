// src/server/routes/index.routes.ts
import type { Hono } from "hono";

// Importar rotas de módulos quando existirem
// ex: import { supermarketRoutes } from "../../modules/supermarket/adapters/http/supermarket.routes";

export function registerModuleRoutes(app: Hono) {
  // Exemplo: montar rotas reais
  // app.route("/supermarket", supermarketRoutes);

  // Por enquanto, placeholder:
  app.get("/", (c) => c.json({ message: "Fortress API v7.24" }));
}
