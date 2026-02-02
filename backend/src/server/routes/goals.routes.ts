// Fortress v7.24 — Rotas Goals (protegidas por auth)
import { Hono } from "hono";
import { z } from "zod";

import { authMiddleware, type AuthVariables } from "../../middleware/auth";
import { GoalsService } from "../../modules/goals/domain/goals.commitment-projection";
import type { GoalPeriodicity } from "../../modules/goals/domain/goal.entity";

const app = new Hono<{ Variables: AuthVariables }>();
const service = new GoalsService();

app.use("*", authMiddleware);

const goalSchema = z.object({
  name: z.string().min(2),
  value: z.number().positive(),
  periodicity: z.enum(["MONTHLY", "WEEKLY"]),
});

const progressSchema = z.object({
  progress: z.number().min(0).max(100),
});

// POST /goals — criar meta
app.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid data", details: parsed.error.flatten() }, 400);
  }
  const goal = await service.createGoal(user.id, {
    name: parsed.data.name,
    value: parsed.data.value,
    periodicity: parsed.data.periodicity as GoalPeriodicity,
  });
  return c.json(goal, 201);
});

// GET /goals — listar metas do usuário
app.get("/", async (c) => {
  const user = c.get("user");
  const goals = await service.listGoals(user.id);
  return c.json(goals);
});

// PATCH /goals/:id/progress — atualizar progresso
app.patch("/:id/progress", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "progress obrigatório (0-100)" }, 400);
  }
  const goal = await service.updateProgress(id, user.id, parsed.data.progress);
  if (!goal) {
    return c.json({ error: "Meta não encontrada" }, 404);
  }
  return c.json(goal);
});

// DELETE /goals/:id — deletar meta
app.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  await service.deleteGoal(id, user.id);
  return c.json({ success: true });
});

export default app;
