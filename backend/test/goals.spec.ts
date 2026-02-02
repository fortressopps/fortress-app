
import { describe, it, expect } from "vitest";
import {
  calculateProgress,
  calculateDeviation,
  isAtRisk,
  analyzeGoal
} from "../src/modules/goals/domain/goal.calculator";
import { GoalPeriodicity } from "../src/modules/goals/domain/goal.entity";

describe("Goals 4F - Calculator", () => {

  describe("Progress Calculation", () => {
    it("should calculate 50% progress when half spent", () => {
      const progress = calculateProgress(10000, 5000); // 100 BRL goal, 50 BRL spent
      expect(progress).toBe(50);
    });

    it("should calculate 100% progress when fully spent", () => {
      const progress = calculateProgress(10000, 10000);
      expect(progress).toBe(100);
    });

    it("should calculate >100% when overspent", () => {
      const progress = calculateProgress(10000, 12000); // 120%
      expect(progress).toBe(120);
    });

    it("should handle zero goal gracefully", () => {
      const progress = calculateProgress(0, 5000);
      expect(progress).toBe(0);
    });
  });

  describe("Deviation Detection", () => {
    it("should detect 'on_track' status when within 10%", () => {
      const deviation = calculateDeviation(10000, 10500); // +5%
      expect(deviation.status).toBe("on_track");
      expect(deviation.deviation_pct).toBe(5);
    });

    it("should detect 'over' status when >10% above", () => {
      const deviation = calculateDeviation(10000, 12000); // +20%
      expect(deviation.status).toBe("over");
      expect(deviation.deviation_cents).toBe(2000);
    });

    it("should detect 'under' status when >10% below", () => {
      const deviation = calculateDeviation(10000, 8000); // -20%
      expect(deviation.status).toBe("under");
    });
  });

  describe("Risk Assessment", () => {
    it("should flag risk when projection exceeds 110%", () => {
      // Spent 6000 in 10 days -> projects to 18000 in 30 days (180% of 10000 goal)
      const atRisk = isAtRisk(10000, 6000, 10, 30);
      expect(atRisk).toBe(true);
    });

    it("should NOT flag risk when projection is safe", () => {
      // Spent 3000 in 10 days -> projects to 9000 in 30 days (90% of 10000 goal)
      const atRisk = isAtRisk(10000, 3000, 10, 30);
      expect(atRisk).toBe(false);
    });
  });

  describe("Full Analysis", () => {
    it("should provide complete goal analysis", () => {
      const mockGoal = {
        id: "goal-1",
        userId: "user-1",
        name: "Mercado Mensal",
        value: 50000, // 500 BRL
        periodicity: GoalPeriodicity.MONTHLY,
        progress: 0,
        impactCurrent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const analysis = analyzeGoal(mockGoal, 30000, 15, 30); // 300 BRL spent, day 15

      expect(analysis.progress).toBe(60); // 60%
      expect(analysis.deviation.status).toBe("under"); // 60% spent = -40% deviation = under budget
      expect(analysis.remaining).toBe(20000); // 200 BRL remaining
      expect(analysis.atRisk).toBe(true); // 300 in 15 days = 600 projected (120% of 500 goal)
    });
  });

});
