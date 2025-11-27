/**
 * Minimal structured logger wrapper (PS: replace with pino in production)
 */
export const fortressLogger = {
    info: (obj) => console.log(JSON.stringify({ level: "info", ...obj })),
    warn: (obj) => console.warn(JSON.stringify({ level: "warn", ...obj })),
    error: (obj) => console.error(JSON.stringify({ level: "error", ...obj })),
    debug: (obj) => process.env.DEBUG === "true"
        ? console.debug(JSON.stringify({ level: "debug", ...obj }))
        : undefined,
};
