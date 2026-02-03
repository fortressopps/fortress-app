/**
 * Fortress Level 3 - Natural Flow Engine
 * Manages notification cooldowns and anti-noise logic conforme PFS 4D §8
 */
import { InsightFamily } from "../../insights/domain/insight.types";

export interface NaturalFlowState {
    lastNotificationAt: Date | null;
    history: Array<{ family: InsightFamily; timestamp: Date }>;
}

export class NaturalFlowEngine {
    // PFS 4D §8.1: Intervalo mínimo entre insights similares: 72h a 120h
    private static readonly SIMILAR_COOLDOWN_MS = 72 * 60 * 60 * 1000;

    // PFS 4D §8.2: Máximo 2 notificações por dia
    private static readonly DAILY_LIMIT = 2;
    private static readonly DAY_MS = 24 * 60 * 60 * 1000;

    /**
     * Determina se uma notificação deve ser permitida baseado no histórico
     */
    static shouldAllow(family: InsightFamily, state: NaturalFlowState): boolean {
        const now = Date.now();

        // 1. Check Daily Limit
        const recentCount = state.history.filter(h =>
            now - h.timestamp.getTime() < this.DAY_MS
        ).length;

        if (recentCount >= this.DAILY_LIMIT) {
            return false;
        }

        // 2. Check similar family cooldown (72h)
        const lastSameFamily = state.history
            .filter(h => h.family === family)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

        if (lastSameFamily && (now - lastSameFamily.timestamp.getTime() < this.SIMILAR_COOLDOWN_MS)) {
            return false;
        }

        return true;
    }
}
