import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/main.server';

describe('Auth Register & Email Verification', () => {
  it('should register user and send verification email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test', email: 'testuser@example.com', password: 'testpass123' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('should not register with existing email', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Test', email: 'testuser@example.com', password: 'testpass123' });
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test', email: 'testuser@example.com', password: 'testpass123' });
    expect(res.status).toBe(409);
  });

  it('should fail verification with invalid token', async () => {
    const res = await request(app)
      .get('/auth/verify-email?token=invalidtoken');
    expect(res.status).toBe(400);
  });
});
