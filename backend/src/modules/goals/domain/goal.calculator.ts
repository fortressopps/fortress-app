/**
 * Fortress Goals 4F — Calculator
 * Calcula progresso, desvios e risco de metas
 */
import type { Goal } from "./goal.entity";

/**
 * Calcula o progresso de uma meta (% atingido)
 * @param goalValue - Valor da meta em centavos
 * @param actualSpent - Valor gasto em centavos
 * @returns Progresso em % (0-100+)
 */
export function calculateProgress(goalValue: number, actualSpent: number): number {
    if (goalValue <= 0) return 0;
    return Math.round((actualSpent / goalValue) * 100);
}

/**
 * Calcula o desvio de uma meta
 * @returns { deviation_cents, deviation_pct, status }
 */
export function calculateDeviation(goalValue: number, actualSpent: number) {
    const deviation_cents = actualSpent - goalValue;
    const deviation_pct = goalValue > 0 ? (deviation_cents / goalValue) * 100 : 0;

    let status: "under" | "on_track" | "over";
    if (deviation_cents < -goalValue * 0.1) status = "under"; // >10% abaixo
    else if (deviation_cents > goalValue * 0.1) status = "over"; // >10% acima
    else status = "on_track";

    return {
        deviation_cents,
        deviation_pct: Math.round(deviation_pct * 10) / 10,
        status,
    };
}

/**
 * Verifica se a meta está em risco de ser ultrapassada
 * @param goalValue - Valor da meta
 * @param actualSpent - Gasto atual
 * @param daysElapsed - Dias decorridos no período
 * @param totalDays - Total de dias no período (ex: 30 para mensal)
 * @returns true se projeção indica que vai ultrapassar
 */
export function isAtRisk(
    goalValue: number,
    actualSpent: number,
    daysElapsed: number,
    totalDays: number = 30
): boolean {
    if (daysElapsed <= 0 || totalDays <= 0) return false;

    // Projeção linear simples
    const dailyRate = actualSpent / daysElapsed;
    const projectedTotal = dailyRate * totalDays;

    // Risco se projeção > 110% da meta
    return projectedTotal > goalValue * 1.1;
}

/**
 * Calcula todos os indicadores de uma meta
 */
export function analyzeGoal(
    goal: Goal,
    actualSpent: number,
    daysElapsed: number = 15,
    totalDays: number = 30
) {
    const progress = calculateProgress(goal.value, actualSpent);
    const deviation = calculateDeviation(goal.value, actualSpent);
    const atRisk = isAtRisk(goal.value, actualSpent, daysElapsed, totalDays);

    return {
        progress,
        deviation,
        atRisk,
        remaining: goal.value - actualSpent,
    };
}
