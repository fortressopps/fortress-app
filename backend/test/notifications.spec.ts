
import { describe, it, expect, vi } from "vitest";
import { determineChannels, composeFinalMessage, dispatchNotification } from "../src/modules/notifications/domain/notification.dispatcher";
import { NotificationChannel } from "../src/modules/notifications/domain/notification.types";
import { Insight, InsightFamily } from "../src/modules/insights/domain/insight.types";
import { KernelDecision } from "../src/modules/kernel/domain/kernel.types";

const MOCK_INSIGHT: Insight = {
    categoria: "Teste",
    dado: "10%",
    familia: InsightFamily.A_IMPACT,
    impacto: 10,
    interpretacao: "Você gastou um pouco mais.",
    nivel: 3,
    relevancia: 50,
    suavidade: 3,
    tendencia: "Alta",
    tipo: "A3"
};

const MOCK_DECISION: KernelDecision = {
    cooldownMin: 72,
    decision_timestamp: "",
    kernel_version: "",
    permit: true,
    reason: "ok",
    reinforce: false,
    relevance: 50,
    suavidade: 3
};

describe("Notifications 4D - Dispatcher", () => {

    describe("Channel Determination", () => {
        it("should route High Relevance (>=70) to PUSH", () => {
            const channels = determineChannels(75, 4);
            expect(channels).toContain(NotificationChannel.PUSH);
            expect(channels).toContain(NotificationChannel.CONSOLE);
        });

        it("should route Medium Relevance (41-69) to CONSOLE only (for now)", () => {
            const channels = determineChannels(50, 3);
            expect(channels).not.toContain(NotificationChannel.PUSH);
            expect(channels).toContain(NotificationChannel.CONSOLE);
        });
    });

    describe("Message Composition", () => {
        it("should append reinforcement when permitted", () => {
            const decision = { ...MOCK_DECISION, reinforce: true };
            const msg = composeFinalMessage(MOCK_INSIGHT, decision);
            expect(msg).toContain("Ótimo sinal de consistência");
        });

        it("should NOT append reinforcement when NOT permitted", () => {
            const decision = { ...MOCK_DECISION, reinforce: false };
            const msg = composeFinalMessage(MOCK_INSIGHT, decision);
            expect(msg).not.toContain("Ótimo sinal");
        });
    });

    describe("Dispatch Flow", () => {
        it("should create full notification object", () => {
            const notif = dispatchNotification(MOCK_INSIGHT, MOCK_DECISION);
            expect(notif.id).toBeDefined();
            expect(notif.canaisSuggested).toContain(NotificationChannel.CONSOLE);
            expect(notif.mensagemFinal).toBe(MOCK_INSIGHT.interpretacao);
        });
    });

});
