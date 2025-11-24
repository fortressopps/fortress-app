import pino, { Logger } from "pino";

const logger: Logger = pino({
    level: process.env.LOG_LEVEL || "info",
    base: { app: "fortress-backend" },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
        err: pino.stdSerializers.err,
    },
});

export default logger;