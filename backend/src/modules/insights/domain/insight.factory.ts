/**
 * PFS 4E §9 — Factory de Insights
 * Detecta família/subtipo, calcula relevância (via Kernel) e gera texto (via Grammar)
 */
import { Insight, InsightFamily, InsightSubtype } from "./insight.types";
import { generateInterpretation } from "./insight.grammar";
import { computeRelevance, mapSuavidade } from "../../kernel/domain/kernel.decision";
import { KernelInputFeatures } from "../../kernel/domain/kernel.types";

export interface InsightInput {
    category: string;
    impact_cents: number;
    projected_month_total: number;
    ma3_average: number;
    current_value: number;
    recurrence_count?: number;
    confidence?: number;
}

/**
 * Detecta o subtipo baseado nos thresholds (PFS 4E §6)
 */
function detectSubtype(input: InsightInput, impact_pct: number): { subtype: InsightSubtype; family: InsightFamily } {
    // 1. Recorrência (Família D)
    if ((input.recurrence_count ?? 0) >= 4) return { subtype: "D3", family: InsightFamily.D_RECURRENCE };
    if ((input.recurrence_count ?? 0) >= 2) return { subtype: "D1", family: InsightFamily.D_RECURRENCE };

    // 2. Impacto Imediato (Família A)
    // PFS 6.1: Leve 1-3%, Mod 3-7%, Forte >7%
    if (impact_pct > 7) return { subtype: "A3", family: InsightFamily.A_IMPACT };
    if (impact_pct > 3) return { subtype: "A2", family: InsightFamily.A_IMPACT };
    // if (impact_pct > 1) return { subtype: "A1", family: InsightFamily.A_IMPACT }; // Comentado pois A1 compete com tendência

    // 3. Tendência Curta (Família B)
    // Comparar current vs ma3
    if (input.ma3_average > 0) {
        const diffPct = ((input.current_value - input.ma3_average) / input.ma3_average) * 100;
        if (diffPct > 15) return { subtype: "B3", family: InsightFamily.B_TREND_SHORT }; // Forte
        if (diffPct > 5) return { subtype: "B2", family: InsightFamily.B_TREND_SHORT };  // Moderada
        if (diffPct > 0) return { subtype: "B1", family: InsightFamily.B_TREND_SHORT };  // Leve
    }

    // Default: Estabilidade Longa (se nada mais triggerar)
    return { subtype: "F2", family: InsightFamily.F_STABILITY };
}

/**
 * Cria um objeto Insight completo
 */
export function createInsight(input: InsightInput): Insight {
    // 1. Calcular variáveis básicas
    const impact_pct = input.projected_month_total > 0
        ? (input.impact_cents / input.projected_month_total) * 100
        : 0;

    // 2. Detectar Subtipo
    const { subtype, family } = detectSubtype(input, impact_pct);

    // 3. Preparar Features para Kernel (4C)
    // Escalar impact_pct para escala 0-100 de intensidade do Kernel (onde ~10% é muito alto)
    const impactForKernel = Math.min(100, impact_pct * 10);

    const kernelFeatures: KernelInputFeatures = {
        impact_cents: input.impact_cents,
        impact_pct_month: impactForKernel,
        projected_month_total: input.projected_month_total,
        confidence: input.confidence ?? 1.0,
        topic: family, // Topic maps to Family (roughly)
        recurrence_score: (input.recurrence_count ?? 0) > 0 ? 0.8 : 0,
    };

    // 4. Invocar Kernel para Relevância e Suavidade
    const relevance = computeRelevance(kernelFeatures);
    const suavidade = mapSuavidade(relevance);

    // 5. Gerar Interpretação (Grammar)
    const interpretacao = generateInterpretation(subtype, {
        category: input.category,
        days: 3, // Default para tendência curta
        difference: `${impact_pct.toFixed(1)}%`,
    });

    // 6. Montar Objeto
    return {
        tipo: subtype,
        familia: family,
        nivel: suavidade, // Nivel muitas vezes é mapeado 1:1 com suavidade
        relevancia: relevance,
        categoria: input.category,
        interpretacao,
        dado: `Impacto ${impact_pct.toFixed(1)}%`,
        tendencia: subtype.startsWith("B") ? "Subida" : "Estável",
        impacto: Math.round(impact_pct * 10) / 10,
        suavidade,
    };
}
