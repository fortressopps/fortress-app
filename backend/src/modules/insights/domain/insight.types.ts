/**
 * PFS 4E — Sistema de Insights: tipos de domínio
 * Estrutura base do insight e famílias (PFS 4E §3.1, §4, §5)
 */
import type { Suavidade } from "../../kernel/domain/kernel.types";

export enum InsightFamily {
  A_IMPACT = "A",
  B_TREND_SHORT = "B",
  C_TREND_LONG = "C",
  D_RECURRENCE = "D",
  E_DEVIATION = "E",
  F_STABILITY = "F",
  G_OPPORTUNITY = "G",
}

export type InsightSubtype =
  | "A1" | "A2" | "A3"
  | "B1" | "B2" | "B3" | "B4"
  | "C1" | "C2"
  | "D1" | "D2" | "D3"
  | "E1" | "E2" | "E3"
  | "F1" | "F2"
  | "G1" | "G2";

export interface Insight {
  tipo: InsightSubtype;
  familia: InsightFamily;
  nivel: 1 | 2 | 3 | 4 | 5;
  relevancia: number;
  categoria: string;
  interpretacao: string;
  dado: string;
  tendencia: string;
  impacto: number;
  suavidade: Suavidade;
  conflict?: {
    goalName: string;
    impactOnBufferPct: number;
  };
}
