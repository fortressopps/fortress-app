
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../src/app";
import { prisma } from "../src/libs/prisma";

describe("Reinforcement Learning (Upgrade A) - Kernel Feedback", () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        // Register and login
        const email = `rl-test-${Date.now()}@fortress.com`;
        await app.request("http://localhost/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "Test123!@#", name: "RL User" }),
        });

        const loginRes = await app.request("http://localhost/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "Test123!@#" }),
        });

        const loginData = await loginRes.json();
        authToken = loginData.accessToken;
        userId = loginData.user.id;
    });

    afterAll(async () => {
        if (userId) {
            await prisma.kernelProfile.deleteMany({ where: { userId } }).catch(() => { });
            await prisma.user.delete({ where: { id: userId } }).catch(() => { });
        }
    });

    it("should adjust weights when user opens an insight (Positive Reinforcement)", async () => {
        // Get initial weights (should be default)
        const initialProfile = await prisma.kernelProfile.findUnique({ where: { userId } });
        const initialW1 = initialProfile?.w1 || 0.5;

        // Send feedback: opened an "Impact" insight (Family A)
        const res = await app.request("http://localhost/kernel/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ action: "opened", family: "A" }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.newWeights.w1).toBeGreaterThan(initialW1);
    });

    it("should adjust weights when user dismisses an insight (Negative Reinforcement)", async () => {
        const profileBefore = await prisma.kernelProfile.findUnique({ where: { userId } });
        const w1Before = profileBefore?.w1 || 0.5;

        // Send feedback: dismissed an "Impact" insight (Family A)
        const res = await app.request("http://localhost/kernel/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ action: "dismissed", family: "A" }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.newWeights.w1).toBeLessThan(w1Before);
    });
});
