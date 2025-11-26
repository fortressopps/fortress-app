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
