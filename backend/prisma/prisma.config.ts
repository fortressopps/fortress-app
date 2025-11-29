// prisma/prisma.config.ts
import { defineConfig } from "@prisma/adapter-node";
import { config } from "dotenv";

config(); // carrega .env

export default defineConfig({
  database: {
    url: process.env.DATABASE_URL!, // URL DO BANCO AGORA FICA AQUI
    provider: "postgresql",
  },
  schema: "./schema.prisma",
  migrations: {
    path: "./migrations",
  },
});
