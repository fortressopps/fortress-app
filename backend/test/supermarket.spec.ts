
import { describe, it, expect } from "vitest";
import {
    toCents,
    fromCents,
    computeImpactInMonth,
    SUPERMARKET_CATEGORY_META
} from "../src/modules/supermarket/domain/supermarket.constants";

describe("Supermarket 4B - Domain Logic", () => {

    describe("Currency Utils", () => {
        it("should convert BRL to cents correctly", () => {
            expect(toCents(10.50)).toBe(1050);
            expect(toCents(0.01)).toBe(1);
            expect(toCents(9.99)).toBe(999);
            expect(toCents(0)).toBe(0);
        });

        it("should convert cents to BRL correctly", () => {
            expect(fromCents(1050)).toBe(10.5);
            expect(fromCents(1)).toBe(0.01);
            expect(fromCents(0)).toBe(0);
        });
    });

    describe("Taxonomy (Categories)", () => {
        it("should have all required categories defined in PFS", () => {
            const keys = Object.keys(SUPERMARKET_CATEGORY_META);
            expect(keys).toContain("PRODUCE");
            expect(keys).toContain("CLEANING");
            expect(keys).toContain("FITNESS");
            expect(keys).toContain("HYGIENE");
        });

        it("should ensure Fitness category is marked correctly", () => {
            expect(SUPERMARKET_CATEGORY_META.FITNESS.isFitness).toBe(true);
            expect(SUPERMARKET_CATEGORY_META.CLEANING.isFitness).toBe(false);
        });
    });

    describe("Impact Calculation", () => {
        it("should calculate impact percentage correctly", () => {
            // 100 reais spent, monthly budget 1000 reais (10%)
            const result = computeImpactInMonth(10000, 100000);
            expect(result.impact_cents).toBe(10000);
            expect(result.impact_pct_month).toBe(10);
        });

        it("should handle zero budget gracefully", () => {
            const result = computeImpactInMonth(5000, 0);
            expect(result.impact_pct_month).toBe(0);
        });

        it("should calculate tiny impact", () => {
            // 10 reais in 10000 reais (0.1%)
            const result = computeImpactInMonth(1000, 1000000);
            expect(result.impact_pct_month).toBe(0.1);
        });
    });

});
