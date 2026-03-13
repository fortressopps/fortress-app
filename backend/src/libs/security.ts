// src/libs/security.ts
import type { Hono } from "hono";
import { ENV } from "./env";

const ALLOWED_ORIGINS = new Set([
  ENV.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173", // vite preview
]);

export function applySecurity(app: Hono) {
  // CORS — allowlist only (no wildcard https://)
  app.use("*", async (c, next) => {
    const origin = c.req.header("Origin") ?? "";
    // In development, also allow any localhost port
    const isAllowed =
      ALLOWED_ORIGINS.has(origin) ||
      (ENV.APP_ENV === "development" && /^http:\/\/localhost(:\d+)?$/.test(origin));
    const allowOrigin = isAllowed ? origin : (ENV.FRONTEND_URL ?? "http://localhost:5173");

    c.header("Access-Control-Allow-Origin", allowOrigin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }
    await next();
  });

  // Security headers básicos
  app.use("*", async (c, next) => {
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "1; mode=block");
    c.header("Referrer-Policy", "no-referrer");

    // CSP simples (relaxado em dev para Vite)
    if (ENV.APP_ENV === "production") {
      c.header(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"
      );
    }

    await next();
  });
}
