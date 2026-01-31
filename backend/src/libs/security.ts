// src/libs/security.ts
import type { Hono } from "hono";
import { ENV } from "./env";

export function applySecurity(app: Hono) {
  // CORS — frontend em outra origem (ex.: localhost:3000)
  app.use("*", async (c, next) => {
    const origin = c.req.header("Origin");
    const allowOrigin = origin && (origin.startsWith("http://localhost") || origin.startsWith("https://"))
      ? origin
      : "http://localhost:3000";
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
