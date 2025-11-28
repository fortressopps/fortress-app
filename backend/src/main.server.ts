import express from "express";
import { bootstrapApplication } from "./core/bootstrap/app.bootstrap.js";
import { logger } from "./config/logger/logger.config.js";

async function main() {
  try {
    const app = express();

    // Bootstrap (routes, middlewares, infra)
    await bootstrapApplication(app);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      logger.info(`🚀 Fortress backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start Fortress server:", err);
    process.exit(1);
  }
}

main();
