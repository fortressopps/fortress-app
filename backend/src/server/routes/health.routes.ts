// src/server/routes/health.routes.ts
import type { Hono } from "hono";
import { prisma } from "../../libs/prisma";

export function registerHealthRoutes(app: Hono) {
  // Basic Health Check
  app.get("/health", (c) =>
    c.json({
      status: "ok",
      version: "7.24",
      timestamp: new Date().toISOString(),
    })
  );

  // Readiness Check (Database)
  app.get("/health/ready", async (c) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return c.json({
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return c.json(
        {
          status: "not_ready",
          database: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        503
      );
    }
  });

  // Liveness Check (Uptime)
  app.get("/health/live", (c) =>
    c.json({
      status: "alive",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    })
  );
}
