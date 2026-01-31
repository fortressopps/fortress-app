import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { bootstrap } from "./server/bootstrap";
import { Logger } from "./libs/logger";
import { ENV } from "./libs/env";
import { gracefulShutdown } from "./libs/gracefulShutdown";

const app = new Hono();

// faz o bootstrap completo (infra + rotas + segurança)
await bootstrap(app);

const server = serve({
  fetch: app.fetch,
  port: ENV.PORT,
});

gracefulShutdown(server);

Logger.info(`🚀 Fortress backend running on port ${ENV.PORT}`);
