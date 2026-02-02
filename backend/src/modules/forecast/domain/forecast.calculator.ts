/**
 * Fortress Forecast 4F — Calculator (Consolidado)
 * Gera projeções mensais e semanais baseadas em dados reais
 */
import type { PrevisaoMensal, PrevisaoSemanal, ForecastResult } from "./forecast.types";
import { FORECAST_VERSION } from "./forecast.types";

/**
 * Calcula projeção mensal usando extrapolação linear
 * @param actualSpent - Gasto atual em centavos
 * @param daysElapsed - Dias decorridos no mês
 * @param totalDays - Total de dias no mês (default 30)
 * @param initialBudget - Orçamento inicial previsto
 */
export function calculateMonthlyForecast(
    actualSpent: number,
    daysElapsed: number,
    totalDays: number = 30,
    initialBudget: number = 0
): PrevisaoMensal {
    if (daysElapsed <= 0) {
        return {
            gastoTotalPrevisto: initialBudget,
            deltaVsPrevistoInicial: 0,
            estabilidadeVsVolatilidade: 1.0,
            confidence: 0,
        };
    }

    // Projeção linear: (gasto atual / dias decorridos) * total de dias
    const dailyRate = actualSpent / daysElapsed;
    const gastoTotalPrevisto = Math.round(dailyRate * totalDays);

    // Delta vs orçamento inicial
    const deltaVsPrevistoInicial = initialBudget > 0
        ? gastoTotalPrevisto - initialBudget
        : 0;

    // Estabilidade: quanto mais dias, mais confiável (simplificado)
    const estabilidadeVsVolatilidade = Math.min(1.0, daysElapsed / 15);

    // Confiança aumenta com dias decorridos
    const confidence = Math.min(1.0, daysElapsed / 20);

    return {
        gastoTotalPrevisto,
        deltaVsPrevistoInicial,
        estabilidadeVsVolatilidade,
        confidence,
    };
}

/**
 * Calcula projeção semanal (tendência de curto prazo)
 * @param recentDailySpending - Array dos últimos 3-7 dias de gasto
 */
export function calculateWeeklyForecast(recentDailySpending: number[]): PrevisaoSemanal {
    if (recentDailySpending.length === 0) {
        return {
            ritmoProximosDias: 0,
            tendencia: "estavel",
            confidence: 0,
        };
    }

    // Média dos últimos dias
    const avg = recentDailySpending.reduce((a, b) => a + b, 0) / recentDailySpending.length;
    const ritmoProximosDias = Math.round(avg);

    // Detectar tendência comparando primeira e segunda metade
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

    return {
        ritmoProximosDias,
        tendencia,
        confidence,
    };
}

/**
 * Consolida todas as previsões em um único resultado
 */
export function consolidateForecast(
    actualSpent: number,
    daysElapsed: number,
    totalDays: number,
    initialBudget: number,
    recentDailySpending: number[]
): ForecastResult {
    const previsaoMensal = calculateMonthlyForecast(
        actualSpent,
        daysElapsed,
        totalDays,
        initialBudget
    );

    const previsaoSemanal = calculateWeeklyForecast(recentDailySpending);

    // Estabilidade geral (média das duas confiâncias)
    const estabilidade = (previsaoMensal.estabilidadeVsVolatilidade + previsaoSemanal.confidence) / 2;

    // Risco leve: se projeção > 110% do orçamento
    const riscoLeve = initialBudget > 0 && previsaoMensal.gastoTotalPrevisto > initialBudget * 1.1
        ? 1
        : 0;

    // Confiança geral do forecast
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
