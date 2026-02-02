/**
 * PFS 4C — Kernel Comportamental
 * Núcleo de decisão: relevância, suavidade, permissão de notificação
 */
export * from "./domain/kernel.types";
export {
  computeRelevance,
  mapSuavidade,
  decideNotification,
} from "./domain/kernel.decision";
