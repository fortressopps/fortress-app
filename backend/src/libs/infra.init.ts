// src/libs/infra.init.ts
import { Logger } from "./logger";
import { prisma } from "./prisma";
// caso haja redis no futuro:
// import { redis } from "./redis";

function formatP1001Hint(err: unknown): string {
  const code = (err as { errorCode?: string })?.errorCode;
  if (code !== "P1001") return "";
  return [
    "",
    "Possible fixes:",
    "1. Supabase: Ensure project is not paused (dashboard → Settings → General → Restore project)",
    "2. Add SSL to DATABASE_URL: ?sslmode=require",
    "3. Use Session Pooler: port 6543 instead of 5432, add ?pgbouncer=true",
    "4. Example: postgresql://user:pass@host:5432/postgres?sslmode=require",
  ].join("\n");
}

export async function initInfra() {
  Logger.info("Initializing Fortress infra...");

  try {
    await prisma.$connect();
    Logger.info("Prisma connected");
  } catch (err) {
    const hint = formatP1001Hint(err);
    Logger.error({ err }, "Prisma failed to connect" + hint);
    throw err;
  }

  // Redis opcional futuramente:
  // try {
  //   await redis.connect();
  //   Logger.info("Redis connected");
  // } catch (err) {
  //   Logger.warn({ err }, "Redis not available");
  // }

  // Seeds e migrations automáticas (opcional futuro)

  return true;
}
