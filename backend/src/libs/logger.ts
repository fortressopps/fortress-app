// src/libs/logger.ts
import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const Logger = pino({
  level: isProd ? "info" : "debug",
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: true,
        },
      },
});
