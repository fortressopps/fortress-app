/**
 * JWT — Access e Refresh tokens (Hono-compatible, ENV-based)
 */
import jwt from "jsonwebtoken";
import { ENV } from "./env";

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "access" }, ENV.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): { sub: string } {
  const payload = jwt.verify(token, ENV.JWT_SECRET) as { sub: string; type?: string };
  return { sub: payload.sub };
}

export function verifyRefreshToken(token: string): { sub: string } {
  const payload = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as { sub: string; type?: string };
  return { sub: payload.sub };
}
