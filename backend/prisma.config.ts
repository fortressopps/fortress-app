import { defineConfig } from "@prisma/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("DEBUG DATABASE_URL =", process.env.DATABASE_URL);

export default defineConfig({
  schema: path.resolve(process.cwd(), "prisma/schema.prisma"),

  datasource: {
    url: process.env.DATABASE_URL
  },

  migrate: {
    enabled: true
  }
});
