// src/libs/infra.init.ts
import { Logger } from "./logger";
import { prisma } from "./prisma";
// caso haja redis no futuro:
// import { redis } from "./redis";

export async function initInfra() {
  Logger.info("Initializing Fortress infra...");

  try {
    await prisma.$connect();
    Logger.info("Prisma connected");
  } catch (err) {
    Logger.error({ err }, "Prisma failed to connect");
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
