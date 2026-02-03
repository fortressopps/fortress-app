import { prisma } from "../../../libs/prisma";
import { DEFAULT_RELEVANCE_WEIGHTS } from "../domain/kernel.types";

export interface RelevanceWeights {
    w1: number;
    w2: number;
    w3: number;
    w4: number;
    w5: number;
    w6: number;
}

export class KernelRepository {
    static async getWeights(userId: string): Promise<RelevanceWeights> {
        const profile = await prisma.kernelProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return DEFAULT_RELEVANCE_WEIGHTS;
        }

        return {
            w1: profile.w1,
            w2: profile.w2,
            w3: profile.w3,
            w4: profile.w4,
            w5: profile.w5,
            w6: profile.w6,
        };
    }

    static async updateWeights(userId: string, weights: Partial<RelevanceWeights>) {
        return prisma.kernelProfile.upsert({
            where: { userId },
            update: weights,
            create: {
                userId,
                ...DEFAULT_RELEVANCE_WEIGHTS,
                ...weights,
            },
        });
    }

    /**
     * Level 3: Obtém o estado cognitivo e tier do usuário
     */
    static async getCognitiveState(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                tier: true,
                lastDashboardVisit: true,
                impulseCount: true,
                totalInsightsViewed: true
            }
        });

        return user || {
            tier: "SENTINEL",
            lastDashboardVisit: null,
            impulseCount: 0,
            totalInsightsViewed: 0
        };
    }

    /**
     * Level 3: Atualiza campos de tracking cognitivo
     */
    static async updateCognitiveState(userId: string, data: any) {
        return prisma.user.update({
            where: { id: userId },
            data
        });
    }

    /**
     * Level 3: Obtém histórico de notificações para o Natural Flow
     * (Simulado por enquanto, em produção buscaria de uma tabela de Eventos/Logs)
     */
    static async getNotificationHistory(userId: string) {
        // Mock: retorno vazio para novos usuários
        return {
            lastNotificationAt: null,
            history: []
        };
    }
}
