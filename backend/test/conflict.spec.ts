
import { describe, it, expect } from "vitest";
import { processReceipt } from "../src/modules/supermarket/application/process-receipt.usecase";

describe("Goal Conflict Engine (Feature)", () => {
    it("should detect conflict when transaction impact is high on another goal", async () => {
        // High amount: 500 BRL (50000 cents) against 2000 BRL buffer (200000 cents) = 25% > 20%
        const result = await processReceipt({
            userId: "user-1",
            totalAmount: 50000,
            category: "Eletrônicos",
            projectedMonthTotal: 100000,
            monthAverageScale: 0
        });

        expect(result.data.insight.conflict).toBeDefined();
        expect(result.data.insight.conflict?.goalName).toBe("Viagem 2024");
        expect(result.data.insight.conflict?.impactOnBufferPct).toBeGreaterThan(20);
        expect(result.data.insight.interpretacao).toContain("Impacta 25% do buffer");
    });

    it("should NOT detect conflict for low impact transaction", async () => {
        // Low amount: 50 BRL (5000 cents) = 2.5% < 20%
        const result = await processReceipt({
            userId: "user-1",
            totalAmount: 5000,
            category: "Lanche",
            projectedMonthTotal: 100000,
            monthAverageScale: 0
        });

        expect(result.data.insight.conflict).toBeUndefined();
    });
});
