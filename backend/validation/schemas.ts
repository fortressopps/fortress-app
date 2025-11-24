import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  spent: z.number().nonnegative("Gasto não pode ser negativo"),
  startDate: z.date(),
  endDate: z.date(),
  alertsEnabled: z.boolean(),
  alertThreshold: z.number().min(0).max(1),
  userId: z.string().cuid(),

  // Validação customizada para datas
}).refine((data) => data.startDate <= data.endDate, {
  message: "startDate deve ser anterior ou igual a endDate",
  path: ["startDate", "endDate"],
});

export const transactionSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  date: z.date(),
  recurringPattern: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean(),
  accountId: z.string().cuid(),
  userId: z.string().cuid(),
  supermarketListId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
});