// src/server/routes/auth.routes.ts
import crypto from "node:crypto";
import { Hono } from "hono";
import type { Context, Next } from "hono";
import nodemailer from "nodemailer";
import { z } from "zod";

import { ENV } from "../../libs/env";
import { Logger } from "../../libs/logger";
import { hashPassword, verifyPassword } from "../../libs/password";
import { prisma } from "../../libs/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../libs/jwt";

export const authRoutes = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const REFRESH_COOKIE = "fortress_refresh";

function sanitizeUser(user: { id: string; email: string; name: string | null }) {
  return { id: user.id, email: user.email, name: user.name };
}

// Rate limit em memória (compatível com Hono) — 20 req/15min por IP para rotas sensíveis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 20;

function rateLimitMiddleware(pathPrefix: string) {
  return async (c: Context, next: Next) => {
    const key = `${pathPrefix}:${c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown"}`;
    const now = Date.now();
    let entry = rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
      rateLimitMap.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > RATE_MAX) {
      return c.json({ error: "Muitas requisições, tente novamente mais tarde." }, 429);
    }
    await next();
  };
}

authRoutes.use("/auth/register", rateLimitMiddleware("register"));
authRoutes.use("/auth/verify-email", rateLimitMiddleware("verify-email"));

// GET /auth/verify-email — confirmação de email
authRoutes.get("/auth/verify-email", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ error: "Token ausente" }, 400);
  }
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { gt: new Date() },
      emailVerified: false,
    },
    select: { id: true, email: true },
  });
  if (!user) {
    return c.json({ error: "Token inválido ou expirado" }, 400);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });
  return c.json({ ok: true, message: "Email verificado com sucesso." });
});

authRoutes.post("/auth/register", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Dados inválidos" }, 400);
  }
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return c.json({ error: "Email já cadastrado" }, 409);
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  const user = await prisma.user.create({
    data: {
      email,
      password: hashPassword(password),
      name,
      emailVerificationToken: token,
      emailVerificationExpires: expires,
      emailVerified: false,
    },
  });
  Logger.info({ userId: user.id, email }, "Email de verificação enviado");
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const verifyUrl = `${process.env.APP_BASE_URL ?? "http://localhost:3001"}/auth/verify-email?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Confirme seu email - Fortress",
      html: `<p>Olá ${name},</p><p>Confirme seu email clicando <a href="${verifyUrl}">aqui</a>.</p><p>Se não foi você, ignore este email.</p>`,
    });
  } catch (err) {
    Logger.warn({ err, email }, "Falha ao enviar email de verificação");
  }
  return c.json({ ok: true, message: "Verifique seu email para ativar a conta." }, 201);
});

authRoutes.post("/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Email e senha obrigatórios" }, 400);
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, name: true, emailVerified: true },
  });
  if (!user || !user.password) {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }
  if (!verifyPassword(password, user.password)) {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  c.header(
    "Set-Cookie",
    `${REFRESH_COOKIE}=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${ENV.APP_ENV === "production" ? "; Secure" : ""}`,
  );
  return c.json({ accessToken, user: sanitizeUser(user) });
});

authRoutes.post("/auth/refresh", async (c) => {
  const cookie = c.req.header("Cookie") ?? "";
  const match = cookie.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`));
  const refreshToken = match?.[1]?.trim();
  if (!refreshToken) {
    return c.json({ error: "Refresh token ausente" }, 401);
  }
  try {
    const { sub: userId } = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (!user) {
      return c.json({ error: "Usuário não encontrado" }, 401);
    }
    const accessToken = signAccessToken(user.id);
    return c.json({ accessToken, user: sanitizeUser(user) });
  } catch {
    return c.json({ error: "Refresh token inválido" }, 401);
  }
});

authRoutes.post("/auth/logout", (c) => {
  c.header("Set-Cookie", `${REFRESH_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  return c.json({ ok: true });
});

authRoutes.get("/users/me", async (c) => {
  const auth = c.req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return c.json({ error: "Token ausente" }, 401);
  }
  try {
    const { sub: userId } = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (!user) {
      return c.json({ error: "Usuário não encontrado" }, 401);
    }
    return c.json(sanitizeUser(user));
  } catch {
    return c.json({ error: "Token inválido" }, 401);
  }
});
