
import { describe, it, expect } from "vitest";
import { processReceipt } from "../src/modules/supermarket/application/process-receipt.usecase";

describe("Fortress v7.24 Enterprise - Standard User Journey", () => {
    const userId = "00000000-0000-0000-0000-000000000001";

    it("Jornada 1: Cadastro e Primeira Compra", async () => {
        const result = await processReceipt({
            userId,
            totalAmount: 12550,
            category: "Mercado",
            projectedMonthTotal: 200000,
            monthAverageScale: 10000
        });
        expect(result.success).toBe(true);
    });

    it("Jornada 2: Detecção de Conflito de Meta", async () => {
        const result = await processReceipt({
            userId,
            totalAmount: 60000,
            category: "Eletronicos",
            projectedMonthTotal: 200000,
            monthAverageScale: 0
        });
        expect(result.success).toBe(true);
    });

    it("Jornada 3: Auditoria de Persona C", async () => {
        const result = await processReceipt({
            userId: "00000000-0000-0000-0000-000000000002",
            totalAmount: 3000,
            category: "Restaurante",
            projectedMonthTotal: 200000,
            monthAverageScale: 5000
        });
        expect(result.success).toBe(true);
    });
});
