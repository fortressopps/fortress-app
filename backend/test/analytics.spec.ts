
import { describe, it, expect } from "vitest";
import {
    detectSpendingPatterns,
    analyzeCategoryTrends,
    calculateAnomalyScore,
} from "../src/modules/analytics/domain/analytics.patterns";
import {
    aggregateMonthly,
    aggregateByCategory,
    comparePeriodsYoY,
} from "../src/modules/analytics/domain/analytics.aggregator";

describe("Analytics - Pattern Detection", () => {

    it("should detect recurring spending patterns", () => {
        const transactions = [
            { category: "Groceries", amount: 50000, date: new Date("2024-01-05") },
            { category: "Groceries", amount: 52000, date: new Date("2024-01-12") },
            { category: "Groceries", amount: 48000, date: new Date("2024-01-19") },
            { category: "Groceries", amount: 51000, date: new Date("2024-01-26") },
        ];

        const patterns = detectSpendingPatterns(transactions);

        expect(patterns.length).toBeGreaterThan(0);
        expect(patterns[0].category).toBe("Groceries");
        expect(patterns[0].frequency).toBe("weekly");
        expect(patterns[0].confidence).toBeGreaterThan(0.6);
    });

    it("should analyze category trends", () => {
        const currentMonth = [
            { category: "Food", amount: 60000 },
            { category: "Transport", amount: 30000 },
        ];
        const previousMonth = [
            { category: "Food", amount: 50000 },
            { category: "Transport", amount: 35000 },
        ];

        const trends = analyzeCategoryTrends(currentMonth, previousMonth);

        expect(trends.length).toBe(2);
        const foodTrend = trends.find((t) => t.category === "Food");
        expect(foodTrend?.trend).toBe("increasing");
        expect(foodTrend?.changePercent).toBe(20);
    });

    it("should detect spending anomalies", () => {
        const historical = [
            { category: "Coffee", amount: 500 },
            { category: "Coffee", amount: 600 },
            { category: "Coffee", amount: 550 },
            { category: "Coffee", amount: 580 },
            { category: "Coffee", amount: 520 },
        ];

        const normalTransaction = { category: "Coffee", amount: 570 };
        const anomalousTransaction = { category: "Coffee", amount: 5000 };

        const normalResult = calculateAnomalyScore(normalTransaction, historical);
        const anomalyResult = calculateAnomalyScore(anomalousTransaction, historical);

        expect(normalResult.isAnomaly).toBe(false);
        expect(anomalyResult.isAnomaly).toBe(true);
        expect(anomalyResult.score).toBeGreaterThan(50);
    });
});

describe("Analytics - Aggregation", () => {

    it("should aggregate transactions by month", () => {
        const transactions = [
            { amount: 10000, category: "Food", date: new Date("2024-01-15") },
            { amount: 20000, category: "Transport", date: new Date("2024-01-20") },
            { amount: 15000, category: "Food", date: new Date("2024-02-10") },
        ];

        const aggregates = aggregateMonthly(transactions);

        expect(aggregates.length).toBe(2);
        expect(aggregates[0].month).toBe("2024-01");
        expect(aggregates[0].totalSpent).toBe(30000);
        expect(aggregates[1].month).toBe("2024-02");
    });

    it("should aggregate by category", () => {
        const transactions = [
            { category: "Food", amount: 10000 },
            { category: "Food", amount: 15000 },
            { category: "Transport", amount: 5000 },
        ];

        const aggregates = aggregateByCategory(transactions);

        expect(aggregates.Food.total).toBe(25000);
        expect(aggregates.Food.count).toBe(2);
        expect(aggregates.Transport.total).toBe(5000);
    });

    it("should compare periods YoY", () => {
        const current = {
            month: "2024-01",
            totalSpent: 120000,
            transactionCount: 10,
            averageTransaction: 12000,
            categories: {},
        };
        const previous = {
            month: "2023-01",
            totalSpent: 100000,
            transactionCount: 8,
            averageTransaction: 12500,
            categories: {},
        };

        const comparison = comparePeriodsYoY(current, previous);

        expect(comparison.changePercent).toBe(20);
        expect(comparison.trend).toBe("up");
    });
});
