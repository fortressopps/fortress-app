// backend/src/infra/init/infra.init.ts
import { prisma } from "@/app/database/prisma.client.js";

export async function initInfra() {
  try {
    await prisma.$connect();
    console.log("🔥 Prisma connected successfully");
  } catch (err) {
    console.error("❌ Prisma connection error", err);
    process.exit(1);
  }
}
