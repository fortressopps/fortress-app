/**
 * Minimal structured logger wrapper (PS: replace with pino in production)
 */
export const fortressLogger = {
  info: (obj: any) => console.log(JSON.stringify({ level: "info", ...obj })),
  warn: (obj: any) => console.warn(JSON.stringify({ level: "warn", ...obj })),
  error: (obj: any) => console.error(JSON.stringify({ level: "error", ...obj })),
  debug: (obj: any) =>
    process.env.DEBUG === "true"
      ? console.debug(JSON.stringify({ level: "debug", ...obj }))
      : undefined,
};
