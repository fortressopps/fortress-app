/**
 * Password hashing (pbkdf2) — sem dependência externa
 */
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const SALT_LEN = 16;
const KEY_LEN = 64;
const ITERATIONS = 100000;
const DIGEST = "sha256";

export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const hash = pbkdf2Sync(plain, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const derived = pbkdf2Sync(plain, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}
