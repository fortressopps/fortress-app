import pino from "pino";
import { isProd } from "../env/env.loader.js";
export const logger = pino({
  level: isProd ? "info" : "debug",
  transport: { target: "pino-pretty", options: { colorize: true, translateTime: true } }
});
