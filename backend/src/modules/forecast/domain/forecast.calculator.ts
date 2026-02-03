/**
 * Fortress Forecast 4F — Calculator (Consolidado)
 * Gera projeções mensais e semanais baseadas em dados reais
 */
import type { PrevisaoMensal, PrevisaoSemanal, ForecastResult } from "./forecast.types";
import { FORECAST_VERSION } from "./forecast.types";

/**
 * Calcula projeção mensal usando extrapolação (Linear ou Smart)
 * @param actualSpent - Gasto atual em centavos
 * @param daysElapsed - Dias decorridos no mês
 * @param totalDays - Total de dias no mês (default 30)
 * @param initialBudget - Orçamento inicial previsto
 * @param dayAwareProfile - Média de gastos históricos por dia do mês (Upgrade C)
 * @param userTier - Tier do usuário (SENTINEL/VANGUARD/LEGACY) - Level 3
 */
export function calculateMonthlyForecast(
    actualSpent: number,
    daysElapsed: number,
    totalDays: number = 30,
    initialBudget: number = 0,
    dayAwareProfile?: number[],
    userTier: "SENTINEL" | "VANGUARD" | "LEGACY" = "SENTINEL"
): PrevisaoMensal {
    // Level 3: Simulação de restrição por tier (em produção isso filtraria a query no DB)
    // Para o cálculo puro, o tier pode influenciar o 'confidence' do modelo
    const tierBoost = userTier === "LEGACY" ? 0.15 : userTier === "VANGUARD" ? 0.05 : 0;

    if (daysElapsed <= 0) {
        return {
            gastoTotalPrevisto: initialBudget,
            deltaVsPrevistoInicial: 0,
            estabilidadeVsVolatilidade: 1.0,
            confidence: 0,
        };
    }

    let gastoTotalPrevisto: number;

    if (dayAwareProfile && dayAwareProfile.length >= totalDays) {
        let expectedRemaining = 0;
        for (let i = daysElapsed + 1; i <= totalDays; i++) {
            expectedRemaining += dayAwareProfile[i - 1] || 0;
        }
        gastoTotalPrevisto = actualSpent + expectedRemaining;
    } else {
        const dailyRate = actualSpent / daysElapsed;
        gastoTotalPrevisto = Math.round(dailyRate * totalDays);
    }

    const deltaVsPrevistoInicial = initialBudget > 0 ? gastoTotalPrevisto - initialBudget : 0;
    const boost = (dayAwareProfile ? 0.2 : 0) + tierBoost;
    const estabilidadeVsVolatilidade = Math.min(1.0, (daysElapsed / 15) + boost);
    const confidence = Math.min(1.0, (daysElapsed / 20) + boost);

    return {
        gastoTotalPrevisto: Math.round(gastoTotalPrevisto),
        deltaVsPrevistoInicial,
        estabilidadeVsVolatilidade,
        confidence,
    };
}

export function calculateWeeklyForecast(recentDailySpending: number[]): PrevisaoSemanal {
    if (recentDailySpending.length === 0) {
        return { ritmoProximosDias: 0, tendencia: "estavel", confidence: 0 };
    }

    const avg = recentDailySpending.reduce((a, b) => a + b, 0) / recentDailySpending.length;
    const ritmoProximosDias = Math.round(avg);

    let tendencia: "subida" | "queda" | "estavel" = "estavel";
    if (recentDailySpending.length >= 4) {
        const mid = Math.floor(recentDailySpending.length / 2);
        const firstHalf = recentDailySpending.slice(0, mid);
        const secondHalf = recentDailySpending.slice(mid);
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const change = ((avgSecond - avgFirst) / avgFirst) * 100;
        if (change > 10) tendencia = "subida";
        else if (change < -10) tendencia = "queda";
    }

    const confidence = Math.min(1.0, recentDailySpending.length / 7);
    return { ritmoProximosDias, tendencia, confidence };
}

export function consolidateForecast(
    actualSpent: number,
    daysElapsed: number,
    totalDays: number,
    initialBudget: number,
    recentDailySpending: number[],
    userTier: "SENTINEL" | "VANGUARD" | "LEGACY" = "SENTINEL"
): ForecastResult {
    const previsaoMensal = calculateMonthlyForecast(
        actualSpent,
        daysElapsed,
        totalDays,
        initialBudget,
        undefined,
        userTier
    );

    const previsaoSemanal = calculateWeeklyForecast(recentDailySpending);
    const estabilidade = (previsaoMensal.estabilidadeVsVolatilidade + previsaoSemanal.confidence) / 2;
    const riscoLeve = initialBudget > 0 && previsaoMensal.gastoTotalPrevisto > initialBudget * 1.1 ? 1 : 0;
    const confidenceForecast = (previsaoMensal.confidence + previsaoSemanal.confidence) / 2;

    return {
        version: FORECAST_VERSION,
        previsaoMensal,
        previsaoSemanal,
        estabilidade,
        riscoLeve,
        confidenceForecast,
        timestamp: new Date().toISOString(),
    };
}
