
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../src/app";
import { prisma } from "../src/libs/prisma";

describe("E2E - Full Core Flow", () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        // Create test user and get auth token
        const uniqueEmail = `test-e2e-${Date.now()}@fortress.com`;

        const registerRes = await app.request("http://localhost/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: uniqueEmail,
                password: "Test123!@#",
                name: "E2E Test User",
            }),
        });

        expect(registerRes.status).toBe(201);
        const registerData = await registerRes.json();

        // Login to get token
        const loginRes = await app.request("http://localhost/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: uniqueEmail,
                password: "Test123!@#",
            }),
        });

        const loginData = await loginRes.json();
        authToken = loginData.accessToken;
        userId = loginData.user.id;
    });

    afterAll(async () => {
        // Cleanup test data
        if (userId) {
            await prisma.goal.deleteMany({ where: { userId } }).catch(() => { });
            await prisma.user.delete({ where: { id: userId } }).catch(() => { });
        }
    });

    it("should process receipt through full core flow", async () => {
        // 1. Process Receipt (Supermarket → Insights → Kernel → Notifications)
        const receiptRes = await app.request("http://localhost/supermarket/receipts/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                total: 500000, // 5000 BRL
                category: "Eletrônicos",
                projectedTotal: 1000000, // 10000 BRL budget
                average: 0,
            }),
        });

        expect(receiptRes.status).toBe(200);

        const receiptData = await receiptRes.json();

        // Verify receipt processing
        expect(receiptData.success).toBe(true);
        expect(receiptData.data.receipt.total).toBe(500000);
        expect(receiptData.data.receipt.impact_pct).toBe(50);

        // Verify insight generation
        expect(receiptData.data.insight).toBeDefined();
        expect(receiptData.data.insight.familia).toBe("A"); // High impact
        expect(receiptData.data.insight.tipo).toBe("A3"); // Strong impact

        // Verify kernel decision
        expect(receiptData.data.decision).toBeDefined();
        expect(receiptData.data.decision.relevance).toBeGreaterThan(70);
        expect(receiptData.data.decision.permit).toBe(true);

        // Verify notification
        expect(receiptData.data.notification).toBeDefined();
        expect(receiptData.data.notification.canaisSuggested).toContain("push");
    });

    it("should create and retrieve goals", async () => {
        // Create goal
        const createRes = await app.request("http://localhost/goals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                name: "Mercado Mensal",
                value: 100000, // 1000 BRL
                periodicity: "MONTHLY",
            }),
        });

        expect(createRes.status).toBe(201);
        const goal = await createRes.json();
        expect(goal.name).toBe("Mercado Mensal");

        // Retrieve goals
        const listRes = await app.request("http://localhost/goals", {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(listRes.status).toBe(200);
        const goals = await listRes.json();
        expect(goals.length).toBeGreaterThan(0);
        expect(goals.some((g: any) => g.name === "Mercado Mensal")).toBe(true);
    });

    it("should handle health checks", async () => {
        const healthRes = await app.request("http://localhost/health");
        expect(healthRes.status).toBe(200);

        const healthData = await healthRes.json();
        expect(healthData.status).toBe("ok");
        expect(healthData.version).toBe("7.24");
    });
});
