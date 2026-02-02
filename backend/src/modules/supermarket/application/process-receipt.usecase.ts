import { computeImpactInMonth } from "../domain/supermarket.constants";
import { createInsight } from "../../insights/domain/insight.factory";
import { computeRelevance, mapSuavidade } from "../../kernel/domain/kernel.decision";
import { dispatchNotification } from "../../notifications/domain/notification.dispatcher";
// import { saveReceipt } from "../infra/supermarket.repository"; // Future

export interface ProcessReceiptInput {
    userId: string;
    totalAmount: number; // in cents
    category: string;
    projectedMonthTotal: number; // in cents
    monthAverageScale: number; // for MA3 (mocked for now)
}

export async function processReceipt(input: ProcessReceiptInput) {
    // 1. Calculate Impact (Supermarket 4B)
    const { impact_cents, impact_pct_month } = computeImpactInMonth(
        input.totalAmount,
        input.projectedMonthTotal
    );

    // 2a. Check for Goal Conflicts (Upgrade B)
    // Fetch active goals (Mocked for now, in real scenario would injection Repository)
    // We assume a conflict if this transaction eats > 20% of another goal's remaining buffer.
    // For now we simulate that "Vacation" has a buffer of 2000.
    let conflict = undefined;
    const VACATION_GOAL_BUFFER = 200000; // 2000 BRL
    const impactOnBuffer = (input.totalAmount / VACATION_GOAL_BUFFER) * 100;

    if (impactOnBuffer > 20 && input.category !== "Viagem") {
        conflict = {
            goalName: "Viagem 2024",
            impactOnBufferPct: Math.round(impactOnBuffer)
        };
    }

    // 2. Generate Insight (Insights 4E)
    const insight = createInsight({
        category: input.category,
        impact_cents: input.totalAmount,
        projected_month_total: input.projectedMonthTotal,
        current_value: input.totalAmount,
        ma3_average: input.monthAverageScale,
        confidence: 1.0,
    });

    if (conflict) {
        insight.conflict = conflict;
        insight.interpretacao += ` ⚠️ Atenção: Impacta ${conflict.impactOnBufferPct}% do buffer de '${conflict.goalName}'.`;
        insight.relevancia = Math.min(100, insight.relevancia + 20); // Boost relevance
    }

    // 3. Kernel Decision (4C)
    const kernelDecision = {
        relevance: insight.relevancia,
        suavidade: mapSuavidade(insight.relevancia),
        permit: true,
        cooldownMin: 0,
        reinforce: insight.tipo.startsWith("F") || insight.tipo.startsWith("D"),
        reason: "Integration Flow",
        decision_timestamp: new Date().toISOString(),
        kernel_version: "7.24",
    };

    // 4. Dispatch Notification (Notifications 4D)
    const notification = dispatchNotification(insight, kernelDecision);

    return {
        success: true,
        data: {
            receipt: {
                total: input.totalAmount,
                impact_pct: impact_pct_month,
            },
            insight,
            decision: kernelDecision,
            notification,
        },
    };
}
