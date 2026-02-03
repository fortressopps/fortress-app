
import { describe, it, expect } from "vitest";
import { calculateMonthlyForecast } from "../src/modules/forecast/domain/forecast.calculator";

describe("Smart Forecast (Upgrade C) - Day Awareness", () => {
    it("should use linear projection when no profile is provided", () => {
        // Day 10, Spent 1000. Linear should give 3000 for 30 days.
        const result = calculateMonthlyForecast(100000, 10, 30, 0);
        expect(result.gastoTotalPrevisto).toBe(300000);
    });

    it("should use smart projection when day-aware profile is provided", () => {
        // Day 5, Spent 500.
        // But the profile says on day 10 we usually pay Rent (2000).
        // Profile: days 1-30. Let's say all days are 0 except day 10 which is 2000.
        const profile = new Array(30).fill(0);
        profile[9] = 200000; // Day 10 (index 9)

        // Day 5 elapsed. Remaining days: 6 to 30.
        // Spent 500. Expected remaining: 2000 (at day 10) + 0 others.
        // Total projected: 500 + 2000 = 2500.
        const result = calculateMonthlyForecast(50000, 5, 30, 0, profile);

        expect(result.gastoTotalPrevisto).toBe(250000);
        // Linear would have been (500/5)*30 = 3000.
        expect(result.gastoTotalPrevisto).not.toBe(300000);
    });
});
