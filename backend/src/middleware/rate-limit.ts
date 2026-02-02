/**
 * Fortress v7.24 - Rate Limiting Middleware
 * Prevents abuse and ensures fair usage
 */
import { Context, Next } from "hono";
import { Logger } from "../libs/logger";

// Simple in-memory rate limiter (use Redis in production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
};

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    return async (c: Context, next: Next) => {
        const identifier = getIdentifier(c);
        const now = Date.now();

        // Clean up expired entries
        cleanupExpired(now);

        // Get or create rate limit entry
        let entry = requestCounts.get(identifier);

        if (!entry || now > entry.resetAt) {
            entry = {
                count: 0,
                resetAt: now + finalConfig.windowMs,
            };
            requestCounts.set(identifier, entry);
        }

        entry.count++;

        // Check if limit exceeded
        if (entry.count > finalConfig.maxRequests) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

            Logger.warn(`Rate limit exceeded for ${identifier}`);

            c.header("Retry-After", retryAfter.toString());
            c.header("X-RateLimit-Limit", finalConfig.maxRequests.toString());
            c.header("X-RateLimit-Remaining", "0");
            c.header("X-RateLimit-Reset", entry.resetAt.toString());

            return c.json(
                {
                    error: "Too many requests",
                    message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
                },
                429
            );
        }

        // Add rate limit headers
        c.header("X-RateLimit-Limit", finalConfig.maxRequests.toString());
        c.header("X-RateLimit-Remaining", (finalConfig.maxRequests - entry.count).toString());
        c.header("X-RateLimit-Reset", entry.resetAt.toString());

        await next();
    };
}

/**
 * Get identifier for rate limiting (IP or user ID)
 */
function getIdentifier(c: Context): string {
    // Try to get user ID from auth
    const user = c.get("user");
    if (user?.id) return `user:${user.id}`;

    // Fall back to IP address
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    return `ip:${ip}`;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpired(now: number) {
    for (const [key, entry] of requestCounts.entries()) {
        if (now > entry.resetAt) {
            requestCounts.delete(key);
        }
    }
}
