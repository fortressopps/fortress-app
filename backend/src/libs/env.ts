import dotenv from "dotenv";
import { z } from "zod";

// Carrega somente o .env do backend
dotenv.config({ path: ".env" });

const Schema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url().optional().default("http://localhost:5173"),
  APP_BASE_URL: z.string().url().optional().default("http://localhost:3001"),
  APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  // Email (SMTP) — optional, verification silently skipped if missing
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // OAuth — optional, strategy not registered if missing
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().min(1),
});

const parsed = Schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ ENV validation failed:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const ENV = parsed.data as z.infer<typeof Schema>;
export const isProd = ENV.APP_ENV === "production";
