// src/server/server.ts
import express from "express";
import { Logger } from "../libs/logger";

export function createServer() {
  const app = express();

  app.use(express.json());

  // health check endpoint (obrigatório no método v7)
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", version: "v7.24" });
  });

  Logger.info("Server initialized");

  return app;
}
