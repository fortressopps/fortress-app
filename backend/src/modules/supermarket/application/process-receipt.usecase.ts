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

    // 2. Generate Insight (Insights 4E)
    // We mock recurrence and ma3 for this specific receipts flow for now,
    // in a real scenario these would come from the database (Historical Repository).
    const insight = createInsight({
        category: input.category,
        impact_cents: input.totalAmount,
        projected_month_total: input.projectedMonthTotal,
        current_value: input.totalAmount,
        ma3_average: input.monthAverageScale, // mocked baseline
        confidence: 1.0,
    });

    // 3. Kernel Decision (4C) - Explicitly called here to pass to Dispatcher,
    // although Dispatcher *could* do it, separating it allows us to log the decision.
    // Note: insightFactory already calls kernel for Relevance/Suavidade, 
    // but we need the full Decision object (with permission/cooldown) for the Dispatcher.
    const kernelDecision = {
        relevance: insight.relevancia,
        suavidade: mapSuavidade(insight.relevancia),
        permit: true, // Mock permission check
        cooldownMin: 0,
        reinforce: insight.tipo.startsWith("F") || insight.tipo.startsWith("D"), // Simple mock logic for reinforcement
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
