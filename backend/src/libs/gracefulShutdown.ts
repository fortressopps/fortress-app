import { Logger } from "./logger";

type CloseableServer = { close: (callback?: () => void) => void };

export function gracefulShutdown(server?: CloseableServer): void {
  const shutdown = (signal: string) => {
    Logger.info({ event: "SHUTDOWN", signal });
    if (server && typeof server.close === "function") {
      server.close(() => {
        Logger.info({ event: "HTTP_SERVER_CLOSED" });
        process.exit(0);
      });
      setTimeout(() => {
        Logger.error({ event: "FORCE_EXIT" });
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (err: unknown) => {
    const e = err as Error;
    Logger.error({ event: "UNHANDLED_REJECTION", error: { name: e?.name, message: e?.message } });
    shutdown("UNHANDLED_REJECTION");
  });
  process.on("uncaughtException", (err: unknown) => {
    const e = err as Error;
    Logger.error({ event: "UNCAUGHT_EXCEPTION", error: { name: e?.name, message: e?.message } });
    shutdown("UNCAUGHT_EXCEPTION");
  });
}
