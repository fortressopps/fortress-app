import { defineConfig } from "@prisma/config";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env first
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Load backend/.env if exists
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("DEBUG DATABASE_URL =", process.env.DATABASE_URL);

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url: process.env.DATABASE_URL,
  },

  migrate: {
    enabled: true,
  },
});
