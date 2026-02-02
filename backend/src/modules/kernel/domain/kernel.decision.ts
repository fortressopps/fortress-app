/**
 * PFS 4C — Kernel Comportamental: decisão de notificação
 * Relevância, suavidade, cooldown mínimo (PFS 4C Enterprise v7.24)
 */
import type { KernelInputFeatures, KernelDecision, Suavidade } from "./kernel.types";
import {
  DEFAULT_RELEVANCE_WEIGHTS,
  MIN_RELEVANCE_THRESHOLD,
  MIN_CONFIDENCE,
  KERNEL_VERSION,
} from "./kernel.types";

/** Sigmóide simples para saturação (relevância 0..100) */
function sigmoid(x: number, scale = 50): number {
  return 100 / (1 + Math.exp(-x / scale));
}

/**
 * Calcula relevância 0..100 (PFS 4C §5)
 */
export function computeRelevance(
  features: KernelInputFeatures,
  weights = DEFAULT_RELEVANCE_WEIGHTS
): number {
  const w = weights;
  const raw =
    w.w1 * Math.abs(features.impact_pct_month ?? 0) +
    w.w2 * Math.abs(features.ma3_pct ?? 0) +
    w.w3 * Math.abs(features.ma10_pct ?? 0) +
    w.w4 * (features.recurrence_score ?? 0) * 100 +
    w.w5 * (1 - features.confidence) * -10 +
    w.w6 * (features.novelty ?? 0) * 10;

  // Ajuste calibrado para corresponder aos exemplos PFS 4C (0 input -> ~12, 100 input -> ~79)
  // Raw 0 -> -30. Sigmoid(-30/15) = 12.
  // Raw 50 -> 20. Sigmoid(20/15) = 79.
  const BIAS = 30;
  const SCALE = 15;

  let relevance = sigmoid(raw - BIAS, SCALE);
  if (features.confidence < MIN_CONFIDENCE) {
    relevance *= features.confidence;
  }
  return Math.max(0, Math.min(100, Math.round(relevance)));
}

/**
 * Mapeia relevância + sensibilidade para suavidade 1..5 (PFS 4C §6)
 */
export function mapSuavidade(relevance: number, _userSensitivity?: 1 | 2 | 3): Suavidade {
  if (relevance < 25) return 1;
  if (relevance < 45) return 2;
  if (relevance < 70) return 3;
  if (relevance < 85) return 4;
  return 5;
}

/**
 * Determina intervalo mínimo (cooldown) baseado no tipo e relevância (PFS 4C §7.1)
 */
export function kernelCooldownForType(topic: string = "general", relevance: number): number {
  switch (topic) {
    case "reforco_positivo":
      return 168; // 7 dias
    case "sugestao_leve":
      return 120; // 5 dias
    case "tendencia_repetida":
      return 96; // 4 dias
    case "micro_variacao":
      return 96;
    case "insight_similar":
    default:
      if (relevance >= 70) return 72; // Alto relevância
      return 120; // Baixa relevância
  }
}

/**
 * Verifica se permissão de reforço positivo é válida (PFS 4C §8.1)
 */
export function allowReinforcement(relevance: number, features: KernelInputFeatures): boolean {
  // 1. Faixa de relevância 40..85
  if (relevance < 40 || relevance > 85) return false;

  // 2. Sensibilidade (Sentinel/1 não permite)
  if (features.user_sensitivity === 1) return false;

  // 3. Sinal positivo: economia (impacto negativo) OU estabilidade (volatilidade baixa)
  const isSaving = (features.impact_pct_month ?? 0) < 0;
  const isStable = (features.volatility ?? 1) < 0.2; // Threshold arbitrário de estabilidade se não definido

  return isSaving || isStable;
}

/**
 * Decide se a notificação é permitida (PFS 4C §9)
 */
export function decideNotification(features: KernelInputFeatures): KernelDecision {
  const relevance = computeRelevance(features);
  const suavidade = mapSuavidade(relevance, features.user_sensitivity);
  const cooldownMin = kernelCooldownForType(features.topic, relevance);
  const reinforce = allowReinforcement(relevance, features);

  // Checks básicos
  if (relevance < MIN_RELEVANCE_THRESHOLD) {
    return {
      permit: false,
      reason: "low_relevance",
      relevance,
      suavidade,
      reinforce,
      cooldownMin,
      kernel_version: KERNEL_VERSION,
      decision_timestamp: new Date().toISOString(),
    };
  }

  if (features.confidence < MIN_CONFIDENCE) {
    return {
      permit: false,
      reason: "low_confidence",
      relevance,
      suavidade,
      reinforce,
      cooldownMin,
      kernel_version: KERNEL_VERSION,
      decision_timestamp: new Date().toISOString(),
    };
  }

  // Cooldown check
  if (
    features.time_since_last_similar_h !== undefined &&
    features.time_since_last_similar_h < cooldownMin
  ) {
    return {
      permit: false,
      reason: "cooldown",
      relevance,
      suavidade,
      reinforce,
      cooldownMin,
      kernel_version: KERNEL_VERSION,
      decision_timestamp: new Date().toISOString(),
    };
  }

  // Quota check (simplificado, assumindo max 5 por janela se não especificado)
  const MAX_NOTIFICATIONS_WINDOW = 5;
  if (
    features.notifications_sent_window !== undefined &&
    features.notifications_sent_window >= MAX_NOTIFICATIONS_WINDOW
  ) {
    return {
      permit: false,
      reason: "quota_exceeded",
      relevance,
      suavidade,
      reinforce,
      cooldownMin,
      kernel_version: KERNEL_VERSION,
      decision_timestamp: new Date().toISOString(),
    };
  }

  return {
    permit: true,
    reason: "ok",
    relevance,
    suavidade,
    reinforce,
    cooldownMin,
    kernel_version: KERNEL_VERSION,
    decision_timestamp: new Date().toISOString(),
  };
}
