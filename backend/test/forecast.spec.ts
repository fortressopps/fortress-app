
import { describe, it, expect } from "vitest";
import {
    calculateMonthlyForecast,
    calculateWeeklyForecast,
    consolidateForecast
} from "../src/modules/forecast/domain/forecast.calculator";

describe("Forecast 4F - Consolidado", () => {

    describe("Monthly Forecast", () => {
        it("should project total spend using linear extrapolation", () => {
            // 1000 BRL spent in 10 days → 3000 BRL projected for 30 days
            const forecast = calculateMonthlyForecast(100000, 10, 30, 200000);

            expect(forecast.gastoTotalPrevisto).toBe(300000); // 3000 BRL
            expect(forecast.deltaVsPrevistoInicial).toBe(100000); // +1000 BRL vs 2000 budget
            expect(forecast.confidence).toBeGreaterThan(0);
        });

        it("should handle early month with low confidence", () => {
            // Only 2 days elapsed
            const forecast = calculateMonthlyForecast(10000, 2, 30, 100000);

            expect(forecast.gastoTotalPrevisto).toBe(150000); // 100 * 15 = 1500 BRL
            expect(forecast.confidence).toBeLessThan(0.5); // Low confidence
        });

        it("should handle zero days gracefully", () => {
            const forecast = calculateMonthlyForecast(0, 0, 30, 100000);

            expect(forecast.gastoTotalPrevisto).toBe(100000); // Returns initial budget
            expect(forecast.confidence).toBe(0);
        });
    });

    describe("Weekly Forecast", () => {
        it("should detect upward trend", () => {
            // Spending increasing: [100, 120, 140, 160]
            const forecast = calculateWeeklyForecast([10000, 12000, 14000, 16000]);

            expect(forecast.tendencia).toBe("subida");
            expect(forecast.ritmoProximosDias).toBeGreaterThan(10000);
        });

        it("should detect downward trend", () => {
            // Spending decreasing: [160, 140, 120, 100]
            const forecast = calculateWeeklyForecast([16000, 14000, 12000, 10000]);

            expect(forecast.tendencia).toBe("queda");
        });

        it("should detect stable trend", () => {
            // Spending stable: [100, 105, 100, 95]
            const forecast = calculateWeeklyForecast([10000, 10500, 10000, 9500]);

            expect(forecast.tendencia).toBe("estavel");
        });

        it("should handle empty data", () => {
            const forecast = calculateWeeklyForecast([]);

            expect(forecast.ritmoProximosDias).toBe(0);
            expect(forecast.confidence).toBe(0);
        });
    });

    describe("Consolidation", () => {
        it("should combine monthly and weekly forecasts", () => {
            const result = consolidateForecast(
                150000, // 1500 BRL spent
                15,     // 15 days elapsed
                30,     // 30 days total
                200000, // 2000 BRL budget
                [10000, 10500, 11000, 10000, 9500, 10000, 10500] // Last 7 days
            );

            expect(result.version).toBe("v7.24");
            expect(result.previsaoMensal.gastoTotalPrevisto).toBe(300000); // 3000 BRL projected
            expect(result.previsaoSemanal.tendencia).toBeDefined();
            expect(result.estabilidade).toBeGreaterThan(0);
            expect(result.confidenceForecast).toBeGreaterThan(0);
        });

        it("should flag risk when projection exceeds budget by >10%", () => {
            const result = consolidateForecast(
                120000, // 1200 BRL spent
                10,     // 10 days
                30,     // 30 days
                200000, // 2000 BRL budget
                [12000, 12000, 12000]
            );

            // 1200 in 10 days → 3600 projected (180% of 2000 budget)
            expect(result.riscoLeve).toBe(1); // Risk flagged
        });

        it("should NOT flag risk when projection is safe", () => {
            const result = consolidateForecast(
                60000,  // 600 BRL spent
                10,     // 10 days
                30,     // 30 days
                200000, // 2000 BRL budget
                [6000, 6000, 6000]
            );

            // 600 in 10 days → 1800 projected (90% of 2000 budget)
            expect(result.riscoLeve).toBe(0); // No risk
        });
    });

});
