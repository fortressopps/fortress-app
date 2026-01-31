// Fortress v7.24 — Testes Goals
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/main.server';
import { prisma } from '../src/libs/prisma';

const testUserId = 'test-user-uuid';

beforeAll(async () => {
  await prisma.goal.deleteMany({ where: { userId: testUserId } });
});

describe('Goals API', () => {
  it('cria uma meta', async () => {
    const res = await request(app)
      .post('/goals')
      .set('x-user-id', testUserId)
      .send({ name: 'Meta Teste', value: 1000, periodicity: 'MONTHLY' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Meta Teste');
    expect(res.body.value).toBe(1000);
    expect(res.body.periodicity).toBe('MONTHLY');
  });

  it('lista metas do usuário', async () => {
    const res = await request(app)
      .get('/goals')
      .set('x-user-id', testUserId);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('atualiza progresso da meta', async () => {
    const metas = await prisma.goal.findMany({ where: { userId: testUserId } });
    const id = metas[0].id;
    const res = await request(app)
      .patch(`/goals/${id}/progress`)
      .set('x-user-id', testUserId)
      .send({ progress: 50 });
    expect(res.status).toBe(200);
    expect(res.body.progress).toBe(50);
  });

  it('deleta uma meta', async () => {
    const metas = await prisma.goal.findMany({ where: { userId: testUserId } });
    const id = metas[0].id;
    const res = await request(app)
      .delete(`/goals/${id}`)
      .set('x-user-id', testUserId);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
