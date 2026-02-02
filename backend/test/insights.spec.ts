
import { describe, it, expect } from "vitest";
import { createInsight } from "../src/modules/insights/domain/insight.factory";
import { getGrammarParts } from "../src/modules/insights/domain/insight.grammar";
import { InsightFamily } from "../src/modules/insights/domain/insight.types";

describe("Insights 4E - Cognitive Engine", () => {

    describe("Grammar Engine", () => {
        it("should generate correct grammar for B1 (Trend Short)", () => {
            const parts = getGrammarParts("B1", { category: "Mercado" });
            expect(parts.observacao).toContain("Seu ritmo em Mercado subiu um pouco");
            expect(parts.contexto).toContain("aumento leve");
        });

        it("should generate correct grammar for F2 (Stability)", () => {
            const parts = getGrammarParts("F2", { category: "Geral" });
            expect(parts.observacao).toBe("Seu mês segue estável.");
        });
    });

    describe("Factory & Detection Logic", () => {
        it("should detect High Impact (A3) when impact > 7%", () => {
            const insight = createInsight({
                category: "Eletrônicos",
                impact_cents: 8000,
                projected_month_total: 100000, // 8% impact
                ma3_average: 0,
                current_value: 8000,
                confidence: 0.95
            });

            expect(insight.familia).toBe(InsightFamily.A_IMPACT);
            expect(insight.tipo).toBe("A3");
            // High impact -> High relevance
            expect(insight.relevancia).toBeGreaterThan(50);
            expect(insight.interpretacao).toBeDefined();
        });

        it("should detect Recurrence (D3) when count >= 4", () => {
            const insight = createInsight({
                category: "Padaria",
                impact_cents: 200,
                projected_month_total: 100000, // 0.2% impact (low)
                ma3_average: 0,
                current_value: 200,
                recurrence_count: 5
            });

            expect(insight.familia).toBe(InsightFamily.D_RECURRENCE);
            expect(insight.tipo).toBe("D3");
        });

        it("should detect Trend (B2) when current exceeds MA3 significantly", () => {
            const insight = createInsight({
                category: "Lanches",
                impact_cents: 1000,
                projected_month_total: 100000,
                ma3_average: 800, // Current 1000 is +25%
                current_value: 1000
            });

            // 25% diff -> B3 (Forte)
            expect(insight.familia).toBe(InsightFamily.B_TREND_SHORT);
            expect(insight.tipo).toBe("B3");
            expect(insight.tendencia).toBe("Subida");
        });

        it("should default to Stability (F2) when nothing special happens", () => {
            const insight = createInsight({
                category: "Rotina",
                impact_cents: 100,
                projected_month_total: 100000,
                ma3_average: 100, // Same as current
                current_value: 100
            });

            expect(insight.familia).toBe(InsightFamily.F_STABILITY);
            expect(insight.tipo).toBe("F2");
        });
    });

});
