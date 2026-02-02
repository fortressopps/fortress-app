/**
 * PFS 4B — Supermarket: taxonomia e constantes
 * Categorias base (§8), regras de valores em centavos (§5.3), impacto no mês (§12)
 */
import type { SupermarketCategory } from "@prisma/client";

/** PFS 4B §8 — Categorias base com slug e isFitness (mapeamento para enum Prisma) */
export const SUPERMARKET_CATEGORY_META: Record<
  SupermarketCategory,
  { slug: string; isFitness: boolean; label: string }
> = {
  PRODUCE: { slug: "hortifruti", isFitness: true, label: "Hortifruti" },
  DAIRY: { slug: "laticinios", isFitness: true, label: "Laticínios" },
  MEAT: { slug: "proteinas", isFitness: true, label: "Proteínas" },
  BAKERY: { slug: "padaria", isFitness: false, label: "Padaria" },
  FROZEN: { slug: "congelados", isFitness: false, label: "Congelados" },
  BEVERAGES: { slug: "bebidas", isFitness: false, label: "Bebidas" },
  PANTRY: { slug: "despensa", isFitness: false, label: "Lanches / Despensa" },
  CLEANING: { slug: "limpeza", isFitness: false, label: "Limpeza" },
  HYGIENE: { slug: "higiene", isFitness: false, label: "Higiene" },
  HOME: { slug: "casa", isFitness: false, label: "Casa" },
  PETS: { slug: "pets", isFitness: false, label: "Pets" },
  PHARMACY: { slug: "drogaria", isFitness: false, label: "Drogaria" },
  FITNESS: { slug: "fitness", isFitness: true, label: "Fitness" },
  OTHER: { slug: "outros", isFitness: false, label: "Outros" },
};

/** PFS 4B §5.3 — Valores de compra: armazenar em centavos quando for entidade Compra */
export const STORE_VALUES_IN_CENTS = true;

/** Converte valor em reais para centavos (para persistência conforme PFS) */
export function toCents(reais: number): number {
  return Math.round(reais * 100);
}

/** Converte centavos para reais (para exibição/API) */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * PFS 4B §12 — Impacto imediato no mês
 * Calcula impact_cents e impact_pct_month para alimentar o Kernel (4C)
 */
export function computeImpactInMonth(
  impactCents: number,
  projectedMonthTotalCents: number
): { impact_cents: number; impact_pct_month: number } {
  const impact_cents = impactCents;
  const impact_pct_month =
    projectedMonthTotalCents > 0
      ? (impactCents / projectedMonthTotalCents) * 100
      : 0;
  return { impact_cents, impact_pct_month };
}
