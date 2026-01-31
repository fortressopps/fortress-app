import dotenv from "dotenv";
import { z } from "zod";

// Carrega somente o .env do backend
dotenv.config({ path: ".env" });

const Schema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
});

const parsed = Schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ ENV validation failed:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const ENV = parsed.data as z.infer<typeof Schema>;
export const isProd = ENV.APP_ENV === "production";
