/**
 * Fortress v7.24 - Kernel Feedback API
 * Allows users to steer the ML weights by providing feedback on insights
 */
import { Hono } from "hono";
import { authMiddleware, type AuthVariables } from "../../middleware/auth";
import { KernelRepository } from "../../modules/kernel/infra/kernel.repository";
import { PersonaAuditor } from "../insights/domain/persona.auditor";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

/**
 * GET /kernel
 * Returns user's core neural state: weights, persona, and flow
 */
app.get("/", async (c) => {
    const user = c.get("user");

    const [weights, cognitiveState, flowState] = await Promise.all([
        KernelRepository.getWeights(user.id),
        KernelRepository.getCognitiveState(user.id),
        KernelRepository.getNotificationHistory(user.id)
    ]);

    const persona = PersonaAuditor.audit(cognitiveState as any);

    return c.json({
        weights,
        persona,
        flow: flowState
    });
});

/**
 * POST /kernel/feedback
 * Adjusts user's kernel weights based on interaction
 */
app.post("/feedback", async (c) => {
    const user = c.get("user");
    const { action, family } = await c.req.json();

    if (!action || !family) {
        return c.json({ error: "Action and family are required" }, 400);
    }

    // Fetch current weights
    const current = await KernelRepository.getWeights(user.id);
    const updated: any = { ...current };

    // Simple Gradient-like adjustment
    const STEP = 0.02;

    if (action === "opened" || action === "saved") {
        // Increase sensitivity to this family
        if (family === "A") updated.w1 += STEP;
        if (family === "B") updated.w2 += STEP;
        if (family === "C") updated.w3 += STEP;
        if (family === "D" || family === "E") updated.w4 += STEP;
        updated.w5 += STEP / 2; // Confidence reinforcement
    } else if (action === "dismissed") {
        // Decrease sensitivity
        if (family === "A") updated.w1 -= STEP;
        if (family === "B") updated.w2 -= STEP;
        if (family === "C") updated.w3 -= STEP;
        if (family === "D" || family === "E") updated.w4 -= STEP;
        updated.w5 -= STEP;
    }

    // Clamp values between 0.01 and 2.0
    for (const key in updated) {
        if (typeof updated[key] === "number") {
            updated[key] = Math.max(0.01, Math.min(2.0, updated[key]));
        }
    }

    await KernelRepository.updateWeights(user.id, updated);

    return c.json({
        success: true,
        newWeights: updated
    });
});

export const kernelRoutes = app;
