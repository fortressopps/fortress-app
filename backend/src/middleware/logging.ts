import { Logger } from "../libs/logger";
import { Context, Next } from "hono";

/**
 * Fortress Request Logger Middleware
 * Integrates Hono context with Pino for structured logging
 */
export const requestLogger = async (c: Context, next: Next) => {
    const { method, path } = c.req;
    const start = Date.now();

    Logger.info({ msg: `--> ${method} ${path}`, method, path });

    await next();

    const ms = Date.now() - start;
    const status = c.res.status;

    const logData = {
        msg: `<-- ${method} ${path} ${status} (${ms}ms)`,
        method,
        path,
        status,
        durationMs: ms,
    };

    if (status >= 500) {
        Logger.error(logData);
    } else if (status >= 400) {
        Logger.warn(logData);
    } else {
        Logger.info(logData);
    }
};
