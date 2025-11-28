import { PrismaClient } from "@prisma/client";
import { logger } from "../../config/logger/logger.config.js";
const prisma = new PrismaClient();
process.on("SIGINT", async () => { await prisma.$disconnect(); logger.info("Prisma disconnected"); process.exit(0); });
export default prisma;
