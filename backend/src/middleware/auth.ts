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
