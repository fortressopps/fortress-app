import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const Schema = z.object({
  DATABASE_URL: z.string().min(10),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  APP_ENV: z.enum(["development","production","test"]).default("development"),
  PORT: z.string().transform(Number).default("4000")
});

const out = Schema.safeParse(process.env);
if (!out.success) {
  console.error("ENV validation failed:", out.error.format());
  process.exit(1);
}
export const ENV = out.data;
export const isProd = ENV.APP_ENV === "production";
