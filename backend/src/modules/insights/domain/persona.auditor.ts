/**
 * Fortress Level 3 - Persona Auditor
 * Detects behavioral patterns conforme PFS v7 Enterprise §2
 */
import { UserTier } from "@prisma/client";
import { Suavidade } from "../../kernel/domain/kernel.types";

export interface AuditorInput {
    tier: UserTier;
    lastDashboardVisit: Date | null;
    impulseCount: number;
    totalInsightsViewed: number;
}

export interface PersonaAuditResult {
    detectedPersona: "A" | "B" | "C" | "D";
    recommendedSuavidade: Suavidade; // 1-5
    cognitiveWarning?: string;
}

export class PersonaAuditor {
    /**
     * Analisa o estado do usuário para detectar a persona dominante
     */
    static audit(input: AuditorInput): PersonaAuditResult {
        const now = Date.now();

        // 1. Detectar Persona C (Emocional / Impulso)
        // Se impulseCount subiu rápido (Mock: > 3), sugere Persona C
        if (input.impulseCount > 3) {
            return {
                detectedPersona: "C",
                recommendedSuavidade: 4, // Mais suave para não gerar culpa
                cognitiveWarning: "Detectado fluxo de impulsividade. Aumentando suavidade interpretativa."
            };
        }

        // 2. Detectar Persona A (Ansioso / Evitação)
        // Se não visita o dashboard há mais de 5 dias
        const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
        if (input.lastDashboardVisit && (now - input.lastDashboardVisit.getTime() > FIVE_DAYS)) {
            return {
                detectedPersona: "A",
                recommendedSuavidade: 5, // Máxima suavidade para reduzir ansiedade
                cognitiveWarning: "Detectado padrão de evitação. Reduzindo frequência de insights de impacto."
            };
        }

        // 3. Default Persona B (Disciplinado) ou D (Minimalista)
        if (input.tier === "SENTINEL") {
            return { detectedPersona: "D", recommendedSuavidade: 3 };
        }

        return { detectedPersona: "B", recommendedSuavidade: 2 };
    }
}
