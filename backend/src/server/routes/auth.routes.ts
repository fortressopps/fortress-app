// src/server/routes/auth.routes.ts
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../../libs/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } from "../../libs/jwt";
import { verifyPassword } from "../../libs/password";
import { ENV } from "../../libs/env";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const REFRESH_COOKIE = "fortress_refresh";

function sanitizeUser(user: { id: string; email: string; name: string | null }) {
  return { id: user.id, email: user.email, name: user.name };
}

export const authRoutes = new Hono();

authRoutes.post("/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Email e senha obrigatórios" }, 400);
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }
  if (!verifyPassword(password, user.password)) {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  c.header("Set-Cookie", `${REFRESH_COOKIE}=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${ENV.APP_ENV === "production" ? "; Secure" : ""}`);
  return c.json({ accessToken, user: sanitizeUser(user) });
});

authRoutes.post("/auth/refresh", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`));
  const refreshToken = match?.[1]?.trim();
  if (!refreshToken) {
    return c.json({ error: "Refresh token ausente" }, 401);
  }
  try {
    const { sub: userId } = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });
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

// GET /users/me — requer Bearer token
authRoutes.get("/users/me", async (c) => {
  const auth = c.req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return c.json({ error: "Token ausente" }, 401);
  }
  try {
    const { sub: userId } = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return c.json({ error: "Usuário não encontrado" }, 401);
    }
    return c.json(sanitizeUser(user));
  } catch {
    return c.json({ error: "Token inválido" }, 401);
  }
});
