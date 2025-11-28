/**
 * FORTRESS v7.21 — Global Error Middleware
 */

import { NextFunction, Request, Response } from "express";
import { logger } from "../../../config/logger/logger.config.js";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({
    message: err.message || "Internal Server Error",
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Something went wrong",
  });
};
