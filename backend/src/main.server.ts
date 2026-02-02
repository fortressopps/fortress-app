import { serve } from "@hono/node-server";

import { app } from "./app";
import { Logger } from "./libs/logger";
import { ENV } from "./libs/env";
import { gracefulShutdown } from "./libs/gracefulShutdown";

const server = serve({
  fetch: app.fetch,
  port: ENV.PORT,
});

gracefulShutdown(server);
Logger.info(`🚀 Fortress backend running on port ${ENV.PORT}`);
