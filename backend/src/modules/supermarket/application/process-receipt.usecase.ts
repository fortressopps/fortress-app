import { computeImpactInMonth } from "../domain/supermarket.constants";
import { createInsight } from "../../insights/domain/insight.factory";
import { mapSuavidade } from "../../kernel/domain/kernel.decision";
import { dispatchNotification } from "../../notifications/domain/notification.dispatcher";
import { KernelRepository } from "../../kernel/infra/kernel.repository";
import { PersonaAuditor } from "../../insights/domain/persona.auditor";
import { NaturalFlowEngine } from "../../kernel/domain/natural-flow.engine";

export interface ProcessReceiptInput {
    userId: string;
    totalAmount: number; // in cents
    category: string;
    projectedMonthTotal: number; // in cents
    monthAverageScale: number; // for MA3 (mocked for now)
}

export async function processReceipt(input: ProcessReceiptInput) {
    // 0a. Fetch learned weights (Upgrade A)
    const weights = await KernelRepository.getWeights(input.userId);

    // 0b. Fetch Cognitive State and Tier (Level 3)
    const cognitiveState = await KernelRepository.getCognitiveState(input.userId);
    const persona = PersonaAuditor.audit(cognitiveState as any);

    // 0c. Check Natural Flow (Anti-noise / Level 3)
    const flowState = await KernelRepository.getNotificationHistory(input.userId);
    const allowedByFlow = NaturalFlowEngine.shouldAllow(input.category as any, flowState);

    // 1. Calculate Impact (Supermarket 4B)
    const { impact_cents, impact_pct_month } = computeImpactInMonth(
        input.totalAmount,
        input.projectedMonthTotal
    );

    // 2a. Check for Goal Conflicts (Upgrade B)
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
    }, weights);

    if (conflict) {
        insight.conflict = conflict;
        insight.interpretacao += ` ⚠️ Atenção: Impacta ${conflict.impactOnBufferPct}% do buffer de '${conflict.goalName}'.`;
        insight.relevancia = Math.min(100, insight.relevancia + 20); // Boost relevance
    }

    // 3. Kernel Decision (4C) - Augmented with Persona Audit
    const kernelDecision = {
        relevance: insight.relevancia,
        suavidade: (persona.recommendedSuavidade || mapSuavidade(insight.relevancia)) as any,
        permit: allowedByFlow, // Use Natural Flow for permission
        cooldownMin: allowedByFlow ? 0 : 72 * 60,
        reinforce: insight.tipo.startsWith("F") || insight.tipo.startsWith("D"),
        reason: persona.cognitiveWarning || "Integration Flow",
        decision_timestamp: new Date().toISOString(),
        kernel_version: "7.24 (L3)",
    };

    // 4. Dispatch Notification (Notifications 4D)
    const notification = kernelDecision.permit
        ? dispatchNotification(insight, kernelDecision)
        : null;

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
