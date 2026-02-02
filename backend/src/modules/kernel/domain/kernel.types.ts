/**
 * PFS 4C — Kernel Comportamental: tipos de domínio
 * Relevância 0..100, suavidade 1..5, decisão de notificação
 */

export const KERNEL_VERSION = "v7.24";

/** Features de entrada para o Kernel (PFS 4C §4) */
export interface KernelInputFeatures {
  impact_cents: number;
  impact_pct_month: number;
  topic?: string; // e.g., "insight_similar", "reforco", "sugestao"
  projected_month_total?: number;
  ma3_pct?: number;
  ma10_pct?: number;
  volatility?: number;
  recurrence_score?: number;
  novelty?: number;
  confidence: number;
  user_sensitivity?: 1 | 2 | 3;
  time_since_last_similar_h?: number;
  notifications_sent_window?: number;
}

/** Suavidade (tone level) 1..5 — PFS 4C §6 */
export type Suavidade = 1 | 2 | 3 | 4 | 5;

/** Decisão de notificação — PFS 4C §9 */
export interface KernelDecision {
  permit: boolean;
  reason: string;
  relevance: number;
  suavidade: Suavidade;
  reinforce: boolean;
  cooldownMin: number;
  kernel_version: string;
  decision_timestamp: string;
}

/** Pesos configuráveis para relevância (PFS 4C §5 — sugestão v1) */
export const DEFAULT_RELEVANCE_WEIGHTS = {
  w1: 0.5,
  w2: 0.2,
  w3: 0.1,
  w4: 0.15,
  w5: 0.05,
  w6: 0.1,
} as const;

export const MIN_RELEVANCE_THRESHOLD = 15;
export const MIN_CONFIDENCE = 0.6;
