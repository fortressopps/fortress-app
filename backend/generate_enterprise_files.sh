#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="src"
ROUTES_DIR="${SRC}/routes"
UTILS_DIR="${SRC}/utils"
WEBHOOKS_DIR="${SRC}/webhooks"
MIDDLEWARE_DIR="${SRC}/middleware"
CONFIG_DIR="${SRC}/config"

echo "🚀 Generating enterprise TS support files..."

mkdir -p "${ROUTES_DIR}"
mkdir -p "${UTILS_DIR}"
mkdir -p "${WEBHOOKS_DIR}"
mkdir -p "${MIDDLEWARE_DIR}"
mkdir -p "${CONFIG_DIR}"

# 1) routes/index.ts (Enterprise v4 loader)
cat > "${ROUTES_DIR}/index.ts" <<'TS'
/**
 * Fortress Router Loader (Enterprise v4)
 * - works for dev (src/) and prod (dist/)
 * - dynamic import, validates Router instance
 */
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROUTES_DIR = path.join(__dirname);

const VALID_EXT = ["index.ts", "index.js", "index.mjs", "index.cjs"];
const BLOCKLIST = ["_legacy_backup"];

const log = (msg: string, extra: any = {}) => {
  console.log({
    time: new Date().toISOString(),
    source: "ROUTE-LOADER",
    msg,
    ...extra,
  });
};

const router = Router();

const modules = fs
  .readdirSync(ROUTES_DIR)
  .filter((f) => {
    if (BLOCKLIST.includes(f)) return false;
    const abs = path.join(ROUTES_DIR, f);
    return fs.statSync(abs).isDirectory();
  });

(async () => {
  const seen = new Set<string>();

  for (const moduleName of modules) {
    const folder = path.join(ROUTES_DIR, moduleName);
    const entry = VALID_EXT.find((ext) =>
      fs.existsSync(path.join(folder, ext))
    );
    if (!entry) {
      log("No entry file found for module, skipping", { moduleName });
      continue;
    }

    const moduleFile = path.join(folder, entry);
    const routePath = `/${moduleName}`;

    if (seen.has(routePath)) {
      log("Duplicate route path detected, skipping", { routePath });
      continue;
    }

    try {
      const imported = await import(moduleFile);
      const route = imported?.default ?? imported;
      if (!route) {
        log("Module has no export default, skipping", { moduleName });
        continue;
      }

      // runtime validation: ensure router has 'use' and 'stack' (basic)
      if (typeof route.use !== "function") {
        log("Exported module is not an express Router, skipping", {
          moduleName,
          exportedType: typeof route,
        });
        continue;
      }

      router.use(routePath, route);
      seen.add(routePath);
      log("Route loaded", { moduleName, routePath, file: entry });
    } catch (err: any) {
      log("Failed to import module", { moduleName, error: err?.message });
    }
  }

  log("All routes processed", { total: modules.length, modules });
})();

export default router;
TS

# 2) utils/logger.ts (Pino-like minimal structured logger)
cat > "${UTILS_DIR}/logger.ts" <<'TS'
/**
 * Minimal structured logger wrapper (PS: replace with pino in production)
 */
export const fortressLogger = {
  info: (obj: any) => console.log(JSON.stringify({ level: "info", ...obj })),
  warn: (obj: any) => console.warn(JSON.stringify({ level: "warn", ...obj })),
  error: (obj: any) => console.error(JSON.stringify({ level: "error", ...obj })),
  debug: (obj: any) =>
    process.env.DEBUG === "true"
      ? console.debug(JSON.stringify({ level: "debug", ...obj }))
      : undefined,
};
TS

# 3) utils/uuid.ts (simple request id generator)
cat > "${UTILS_DIR}/uuid.ts" <<'TS'
export const fortressUUID = (): string =>
  `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
TS

# 4) utils/gracefulShutdown.ts
cat > "${UTILS_DIR}/gracefulShutdown.ts" <<'TS'
import { Server } from "http";
import { fortressLogger } from "./logger";

export const gracefulShutdown = (server?: Server) => {
  const shutdown = (signal: string) => {
    fortressLogger.info({ event: "SHUTDOWN", signal });
    if (server) {
      server.close(() => {
        fortressLogger.info({ event: "HTTP_SERVER_CLOSED" });
        process.exit(0);
      });
      setTimeout(() => {
        fortressLogger.error({ event: "FORCE_EXIT" });
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (err: any) => {
    fortressLogger.error({ event: "UNHANDLED_REJECTION", error: { name: err?.name, message: err?.message } });
    shutdown("UNHANDLED_REJECTION");
  });
  process.on("uncaughtException", (err: any) => {
    fortressLogger.error({ event: "UNCAUGHT_EXCEPTION", error: { name: err?.name, message: err?.message } });
    shutdown("UNCAUGHT_EXCEPTION");
  });
};
TS

# 5) webhooks/clerkWebhook.ts
cat > "${WEBHOOKS_DIR}/clerkWebhook.ts" <<'TS'
import { Request, Response } from "express";
import { fortressLogger } from "../utils/logger";

/**
 * Minimal Clerk webhook handler: verify signature as needed, then process.
 * Replace verify logic with Clerk official SDK if required.
 */
export const clerkWebhookHandler = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    fortressLogger.info({ event: "CLERK_WEBHOOK_RECEIVED", type: event?.type });
    // Example: handle user.created
    switch (event?.type) {
      case "user.created":
        fortressLogger.info({ event: "CLERK_USER_CREATED", id: event?.data?.id });
        break;
      case "user.updated":
        fortressLogger.info({ event: "CLERK_USER_UPDATED", id: event?.data?.id });
        break;
      default:
        fortressLogger.info({ event: "CLERK_WEBHOOK_IGNORED", type: event?.type });
    }
    res.status(200).json({ success: true });
  } catch (err: any) {
    fortressLogger.error({ event: "CLERK_WEBHOOK_ERROR", error: err?.message });
    res.status(500).json({ success: false });
  }
};
TS

# 6) webhooks/stripeWebhook.ts
cat > "${WEBHOOKS_DIR}/stripeWebhook.ts" <<'TS'
import { Request, Response } from "express";
import { fortressLogger } from "../utils/logger";

/**
 * Minimal Stripe webhook handler.
 * In prod: use stripe.webhooks.constructEvent with raw body and signing secret.
 */
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    fortressLogger.info({ event: "STRIPE_WEBHOOK_RECEIVED", type: event?.type });
    // handle event types as needed
    res.status(200).json({ received: true });
  } catch (err: any) {
    fortressLogger.error({ event: "STRIPE_WEBHOOK_ERROR", error: err?.message });
    res.status(500).end();
  }
};
TS

# 7) middleware/auth.ts (Clerk integration)
cat > "${MIDDLEWARE_DIR}/auth.ts" <<'TS'
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

/**
 * requireAuth middleware typed for Express
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }
  (req as any).auth = { userId };
  next();
};
TS

# 8) config/clerk.ts (small helper)
cat > "${CONFIG_DIR}/clerk.ts" <<'TS'
/**
 * Small helper to centralize Clerk config if needed
 */
export const CLERK_CONFIG = {
  apiKey: process.env.CLERK_API_KEY || "",
};
TS

# 9) tsconfig.json (if absent)
if [ ! -f "tsconfig.json" ]; then
  cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "resolveJsonModule": true,
    "allowJs": false,
    "noEmit": false,
    "baseUrl": ".",
    "paths": {
      "@utils/*": ["src/utils/*"],
      "@routes/*": ["src/routes/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
JSON
  echo "tsconfig.json created."
fi

# 10) patch package.json scripts for TS dev
if [ -f "package.json" ]; then
  node - <<'NODE'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.type = p.type || 'module';
p.scripts = p.scripts || {};
p.scripts['dev'] = 'ts-node-dev --respawn --transpile-only src/index.ts';
p.scripts['build'] = 'tsc';
p.scripts['start'] = 'node dist/index.js';
fs.writeFileSync('package.json', JSON.stringify(p,null,2));
console.log('package.json patched (dev/build/start scripts)');
NODE
fi

echo "✅ Enterprise support files generated."
echo "Next: install dev deps: npm i -D typescript ts-node-dev @types/node @types/express @types/cors @types/compression @types/helmet"
echo "Install runtime deps if missing: npm i express cors helmet compression express-rate-limit morgan @clerk/express"
