/**
 * Middleware de autenticação — verifica Bearer JWT e anexa user ao context
 */
import type { Context, Next } from "hono";
import { prisma } from "../libs/prisma";
import { verifyAccessToken } from "../libs/jwt";
import type { User } from "@prisma/client";

export type AuthVariables = { user: User };

export async function authMiddleware(c: Context<{ Variables: AuthVariables }>, next: Next) {
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
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Token inválido" }, 401);
  }
}
