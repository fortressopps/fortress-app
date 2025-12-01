import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { bootstrap } from "./server/bootstrap";
import { Logger } from "./libs/logger";

const app = new Hono();

// faz o bootstrap completo (infra + rotas + segurança)
await bootstrap(app);

const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
});

Logger.info(`🚀 Fortress backend running on port ${port}`);
