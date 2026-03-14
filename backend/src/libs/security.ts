// src/libs/security.ts
import type { Hono } from "hono";
import { ENV } from "./env";

const ALLOWED_ORIGINS = new Set(); // Mantido vazio para evitar quebras se referenciado em outro lugar (embora improvável)

import { cors } from "hono/cors";

export function applySecurity(app: Hono) {
  // CORS — allowlist only
  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://fortress-app.vercel.app",
        ENV.FRONTEND_URL,
      ].filter(Boolean) as string[],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

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
