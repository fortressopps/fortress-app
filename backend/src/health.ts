/**
 * Fortress v7.24 - Health Check Endpoint
 * Provides system status for monitoring and orchestration
 */
import { Hono } from "hono";
import { prisma } from "./libs/prisma";

const app = new Hono();

/**
 * GET /health - Basic health check
 * Returns 200 if service is running
 */
app.get("/health", (c) => {
    return c.json({
        status: "ok",
        version: "7.24",
        timestamp: new Date().toISOString(),
    });
});

/**
 * GET /health/ready - Readiness check
 * Returns 200 if service is ready to accept traffic (DB connected)
 */
app.get("/health/ready", async (c) => {
    try {
        // Test database connection
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

/**
 * GET /health/live - Liveness check
 * Returns 200 if service is alive (for restart detection)
 */
app.get("/health/live", (c) => {
    return c.json({
        status: "alive",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
    });
});

export const healthRoutes = app;
