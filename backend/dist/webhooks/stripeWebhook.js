import { fortressLogger } from "../utils/logger";
/**
 * Minimal Stripe webhook handler.
 * In prod: use stripe.webhooks.constructEvent with raw body and signing secret.
 */
export const stripeWebhookHandler = async (req, res) => {
    try {
        const event = req.body;
        fortressLogger.info({ event: "STRIPE_WEBHOOK_RECEIVED", type: event?.type });
        // handle event types as needed
        res.status(200).json({ received: true });
    }
    catch (err) {
        fortressLogger.error({ event: "STRIPE_WEBHOOK_ERROR", error: err?.message });
        res.status(500).end();
    }
};
