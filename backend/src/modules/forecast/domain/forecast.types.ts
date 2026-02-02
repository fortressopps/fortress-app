/**
 * PFS 4F — Sistema de Projeções & Forecast: tipos de domínio
 * Alimenta Insights (4E) e Kernel (4C) — PFS 4F §3
 */
export const FORECAST_VERSION = "v7.24";

/** Previsão mensal — PFS 4F §4.1 */
export interface PrevisaoMensal {
  gastoTotalPrevisto: number;
  deltaVsPrevistoInicial: number;
  estabilidadeVsVolatilidade: number;
  confidence: number;
}

/** Previsão semanal — PFS 4F §4.2 */
export interface PrevisaoSemanal {
  ritmoProximosDias: number;
  tendencia: "subida" | "queda" | "estavel";
  confidence: number;
}

/** Objeto final de forecast — PFS 4F §3 (Composição Final) */
export interface ForecastResult {
  version: string;
  previsaoMensal: PrevisaoMensal;
  previsaoSemanal: PrevisaoSemanal;
  estabilidade: number;
  riscoLeve: number;
  confidenceForecast: number;
  timestamp: string;
}
