// src/libs/security.ts
import type { Hono } from "hono";

export function applySecurity(app: Hono) {
  // Security headers básicos
  app.use("*", async (c, next) => {
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "1; mode=block");
    c.header("Referrer-Policy", "no-referrer");

    // CSP simples
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'"
    );

    await next();
  });
}
