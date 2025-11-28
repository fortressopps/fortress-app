import type { Application } from "express";
import { healthRouter } from "./health.routes.js";

export function registerAppRoutes(app: Application){
  app.use("/_health", healthRouter);
  // TODO: register module routers here: /auth, /users, /supermarket
}
