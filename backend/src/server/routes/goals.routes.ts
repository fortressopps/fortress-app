// Fortress v7.24 — Rotas Goals
import { Hono } from 'hono';
import { z } from 'zod';

import { GoalsService } from '../../modules/goals/service/goals.service';
const service = new GoalsService();

const router = new Hono();

const goalSchema = z.object({
  name: z.string().min(2),
  value: z.number().positive(),
  periodicity: z.enum(['MONTHLY', 'WEEKLY']),
});

// Criar meta
router.post('/', async (c) => {
  const userId = c.req.header('x-user-id');
  const body = await c.req.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid data', details: parsed.error }, 400);
  const goal = await service.createGoal(userId, parsed.data);
  return c.json(goal);
});

// Listar metas do usuário
router.get('/', async (c) => {
  const userId = c.req.header('x-user-id');
  const goals = await service.listGoals(userId);
  return c.json(goals);
});

// Atualizar progresso da meta
router.patch('/:id/progress', async (c) => {
  const userId = c.req.header('x-user-id');
  const { progress } = await c.req.json();
  const { id } = c.req.param();
  const goal = await service.updateProgress(id, userId, progress);
  return c.json(goal);
});

// Deletar meta
router.delete('/:id', async (c) => {
  const userId = c.req.header('x-user-id');
  const { id } = c.req.param();
  await service.deleteGoal(id, userId);
  return c.json({ success: true });
});

export default router;
