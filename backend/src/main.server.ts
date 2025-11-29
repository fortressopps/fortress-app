// backend/src/main.server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { indexRoutes } from "./app/http/routes/index.routes.js";
import { initInfra } from "./infra/init/infra.init.js";

// Inicializa Hono
const app = new Hono();

// Inicializa Prisma + outras integrações
await initInfra();

// Registra rotas principais
app.route("/", indexRoutes);

// Servidor
const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
});

console.info(`🚀 Fortress backend running on port ${port}`);
