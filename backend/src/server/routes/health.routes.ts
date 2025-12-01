// src/server/routes/health.routes.ts
import type { Hono } from "hono";

export function registerHealthRoutes(app: Hono) {
  app.get("/health", (c) =>
    c.json({
      status: "ok",
      version: "v7.24",
      uptime: process.uptime(),
    })
  );
}
