// backend/src/app/database/prisma.client.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL, // Prisma 7 exige explicitamente
});
