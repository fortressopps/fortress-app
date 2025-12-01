import { PrismaClient } from "@prisma/client";

// Prisma v7 — sem datasourceUrl no constructor
export const prisma = new PrismaClient();

export async function initPrisma() {
  try {
    await prisma.$connect();
    console.log("🔌 Prisma connected");
  } catch (err) {
    console.error("❌ Prisma connection error:", err);
    throw err;
  }
}
