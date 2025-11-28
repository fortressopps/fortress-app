import { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger/logger.config.js";
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction){
  logger.error({ err }, "Unhandled error");
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || "Internal error" });
}
