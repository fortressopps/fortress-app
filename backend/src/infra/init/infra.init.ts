// backend/src/infra/init/infra.init.ts
import { prisma } from "../../app/database/prisma.client.js";
import { logger } from "../../app/config/logger/logger.config.js";

export async function initInfra() {
  await prisma.$connect();
  logger.info("Prisma connected");
}
