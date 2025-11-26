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
