/**
 * PFS 4E §7 — Gramática Cognitiva
 * Gera interpretação = observação + contexto + movimento
 */
import type { InsightSubtype } from "./insight.types";

interface GrammarParts {
    observacao: string;
    contexto: string;
    movimento: string;
}

/**
 * Gera as partes da gramática baseada no subtipo e variáveis (PFS 4E §7)
 */
export function getGrammarParts(
    subtype: InsightSubtype,
    vars: { category: string; days?: number; difference?: string }
): GrammarParts {
    const { category, days = 3, difference = "pouco" } = vars;

    switch (subtype) {
        case "B1": // Tendência curta (subida leve)
            return {
                observacao: `Seu ritmo em ${category} subiu um pouco nos últimos ${days} dias.`,
                contexto: "Isso representa um aumento leve no padrão recente.",
                movimento: "Ainda está dentro de um comportamento normal.",
            };
        case "B2": // Tendência curta (subida moderada)
            return {
                observacao: `Notamos uma subida moderada em ${category} recentemente.`,
                contexto: `A média dos últimos ${days} dias está acima do habitual.`,
                movimento: "Pode indicar um início de mudança de rotina.",
            };
        case "D1": // Recorrência semanal
            return {
                observacao: `Suas idas ao mercado mostraram um padrão semanal novamente.`,
                contexto: "Isso confirma a regularidade das últimas semanas.",
                movimento: "Indica consistência na rotina.",
            };
        case "C1": // Tendência longa (consistente)
            return {
                observacao: `Seu consumo de ${category} segue consistente há mais de 10 dias.`,
                contexto: "Nenhuma variação brusca foi detectada.",
                movimento: "Mostra um comportamento consolidado.",
            };
        case "F2": // Estabilidade longa
            return {
                observacao: "Seu mês segue estável.",
                contexto: "Esse padrão tem sido consistente nos últimos dias.",
                movimento: "Ótimo sinal de controle.",
            };
        case "E1": // Desvio leve
            return {
                observacao: `Houve um desvio leve (${difference}) entre o previsto e realizado.`,
                contexto: "Nada fora do margem de segurança.",
                movimento: "Segue dentro do esperado.",
            };
        default:
            return {
                observacao: `Observamos uma movimentação em ${category}.`,
                contexto: "Isso faz parte do seu fluxo recente.",
                movimento: "Estamos acompanhando.",
            };
    }
}

/**
 * Monta a interpretação final (PFS 4E §7.1)
 */
export function generateInterpretation(
    subtype: InsightSubtype,
    vars: { category: string; days?: number; difference?: string }
): string {
    const parts = getGrammarParts(subtype, vars);
    return `${parts.observacao} ${parts.contexto} ${parts.movimento}`;
}
