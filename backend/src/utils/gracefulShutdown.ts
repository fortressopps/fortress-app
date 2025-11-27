import { Server } from "http";
import { fortressLogger } from "./logger";

export const gracefulShutdown = (server?: Server) => {
  const shutdown = (signal: string) => {
    fortressLogger.info({ event: "SHUTDOWN", signal });
    if (server) {
      server.close(() => {
        fortressLogger.info({ event: "HTTP_SERVER_CLOSED" });
        process.exit(0);
      });
      setTimeout(() => {
        fortressLogger.error({ event: "FORCE_EXIT" });
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (err: any) => {
    fortressLogger.error({ event: "UNHANDLED_REJECTION", error: { name: err?.name, message: err?.message } });
    shutdown("UNHANDLED_REJECTION");
  });
  process.on("uncaughtException", (err: any) => {
    fortressLogger.error({ event: "UNCAUGHT_EXCEPTION", error: { name: err?.name, message: err?.message } });
    shutdown("UNCAUGHT_EXCEPTION");
  });
};
