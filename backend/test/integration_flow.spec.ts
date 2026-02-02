
import { describe, it, expect } from "vitest";
import { processReceipt } from "../src/modules/supermarket/application/process-receipt.usecase";
import { NotificationChannel } from "../src/modules/notifications/domain/notification.types";

describe("Integration Flow - Core Modules", () => {

    it("should execute the full chain: Receipt -> Insight -> Decision -> Notification", async () => {
        // Scenario: High Impact Purchase (Phone)
        const result = await processReceipt({
            userId: "user-123",
            totalAmount: 500000, // 5000 BRL
            category: "Eletrônicos",
            projectedMonthTotal: 1000000, // 10000 BRL Budget
            monthAverageScale: 0 // No baseline
        });

        expect(result.success).toBe(true);

        // 1. Supermarket Logic Check
        expect(result.data.receipt.total).toBe(500000);
        // 5000 / 10000 = 50% impact
        expect(result.data.receipt.impact_pct).toBe(50);

        // 2. Insight Logic Check
        expect(result.data.insight).toBeDefined();
        // 50% impact > 7% threshold -> Family A (Impact), Subtype A3 (Strong)
        expect(result.data.insight.familia).toBe("A");
        expect(result.data.insight.tipo).toBe("A3");

        // 3. Kernel Logic Check
        expect(result.data.decision).toBeDefined();
        // High impact -> High relevance -> Permit
        expect(result.data.decision.relevance).toBeGreaterThan(70);
        expect(result.data.decision.permit).toBe(true);

        // 4. Notification Logic Check
        expect(result.data.notification).toBeDefined();
        // Relevance > 70 -> PUSH
        expect(result.data.notification.canaisSuggested).toContain(NotificationChannel.PUSH);
        expect(result.data.notification.mensagemFinal).toBeDefined();
    });

    it("should handle low impact receipts with gentler notifications", async () => {
        // Scenario: Low Impact Purchase (Bread)
        const result = await processReceipt({
            userId: "user-123",
            totalAmount: 1000, // 10 BRL
            category: "Padaria",
            projectedMonthTotal: 100000, // 1000 BRL Budget
            monthAverageScale: 1000
        });

        expect(result.success).toBe(true);

        // 1% impact
        expect(result.data.receipt.impact_pct).toBe(1);

        // Insight: Stability or Low Trend
        expect(result.data.insight.relevancia).toBeLessThan(70);

        // Notification: Console Only
        expect(result.data.notification.canaisSuggested).not.toContain(NotificationChannel.PUSH);
        expect(result.data.notification.canaisSuggested).toContain(NotificationChannel.CONSOLE);
    });

});
