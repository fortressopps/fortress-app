import { Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";

// Type definitions for safer inputs
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransactionData {
  amount: number;
  category: "FOOD" | "TRANSPORT" | "HEALTH" | "ENTERTAINMENT" | "SHOPPING" | "SALARY" | "OTHER";
  description: string;
  date: Date;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

const convertDecimalToNumber = (tx: any) => {
  if (!tx) return tx;
  return {
    ...tx,
    amount: Number(tx.amount),
  };
};

export class TransactionService {
  /**
   * List all transactions for a user, paginated and optionally filtered.
   */
  async getAll(userId: string, filters: TransactionFilters) {
    const { startDate, endDate, category, page = 1, limit = 10 } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.TransactionWhereInput = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (category) {
      where.category = category as any;
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take,
      }),
    ]);

    return {
      data: transactions.map(convertDecimalToNumber),
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Create a manual transaction.
   */
  async create(userId: string, data: CreateTransactionData) {
    const tx = await prisma.transaction.create({
      data: {
        userId,
        amount: new Prisma.Decimal(data.amount),
        category: data.category,
        description: data.description,
        source: "MANUAL",
        date: data.date,
      },
    });

    return convertDecimalToNumber(tx);
  }

  /**
   * Update an existing transaction (restricted to owner).
   */
  async update(userId: string, id: string, data: UpdateTransactionData) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found or not owned by user");
    }

    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }

    const tx = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    return convertDecimalToNumber(tx);
  }

  /**
   * Delete a transaction (restricted to owner).
   */
  async delete(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Transaction not found or not owned by user");
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { ok: true };
  }

  /**
   * Calculates total income, expenses, and balance for a specific month.
   * Month parameter format: YYYY-MM. Defaults to the current month.
   */
  async getSummary(userId: string, monthStr?: string) {
    let startDate: Date;
    let endDate: Date;

    if (monthStr) {
      const [year, month] = monthStr.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { amount: true, category: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (amount >= 0) {
        totalIncome += amount;
      } else {
        const absAmount = Math.abs(amount);
        totalExpenses += absAmount;
        
        // Track expenses by category
        if (!expensesByCategory[tx.category]) {
          expensesByCategory[tx.category] = 0;
        }
        expensesByCategory[tx.category] += absAmount;
      }
    }

    // Convert totalExpenses to negative naturally for the balance calculation 
    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses, // returned as absolute positive sum representing expenditure
      balance,
      expensesByCategory,
    };
  }

  /**
   * Integation boundary for Supermarket.
   * Upserts the transaction matching the referenceId.
   */
  async upsertFromSupermarket(userId: string, listId: string, amount: number, listName: string) {
    const existing = await prisma.transaction.findFirst({
      where: {
        userId,
        referenceId: listId,
        source: "SUPERMARKET",
      },
    });

    // We assume the amount passed here should be represented as a negative expense
    // since it comes from a shopping list which is an expense.
    const expenseAmount = amount > 0 ? -amount : amount;

    if (existing) {
      const updated = await prisma.transaction.update({
        where: { id: existing.id },
        data: {
          amount: new Prisma.Decimal(expenseAmount),
          description: `Compras: ${listName}`,
          // date is not updated to preserve the original transaction occurrence
        },
      });
      return convertDecimalToNumber(updated);
    }

    const created = await prisma.transaction.create({
      data: {
        userId,
        amount: new Prisma.Decimal(expenseAmount),
        category: "FOOD",
        description: `Compras: ${listName}`,
        source: "SUPERMARKET",
        referenceId: listId,
        date: new Date(),
      },
    });

    return convertDecimalToNumber(created);
  }

  /**
   * Parse operations via raw CSV format
   * No external libraries per sprint requirements.
   * Expects: data,descricao,valor,categoria
   */
  async importFromCsv(userId: string, csvBuffer: Buffer) {
    const text = csvBuffer.toString("utf-8");
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Ignore header row if it exists
    let startIndex = 0;
    if (lines.length > 0 && lines[0].toLowerCase().includes("data") && lines[0].toLowerCase().includes("valor")) {
      startIndex = 1;
    }

    const maxLines = 500;
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    const validCategories = ["FOOD", "TRANSPORT", "HEALTH", "ENTERTAINMENT", "SHOPPING", "SALARY", "OTHER"];

    for (let i = startIndex; i < lines.length; i++) {
      if (i - startIndex >= maxLines) {
        skipped += (lines.length - i);
        errors.push(`Limite de ${maxLines} linhas atingido. Restante ignorado.`);
        break;
      }

      const line = lines[i];
      // Basic CSV split considering potential simple formats (no nested quotes supported in this simple parser)
      const cols = line.split(",").map(c => c.trim());
      
      if (cols.length < 3) {
        skipped++;
        errors.push(`Linha ${i + 1}: Formato inválido ou colunas insuficientes.`);
        continue;
      }

      const [dateStr, description, amountStr, categoryStr] = cols;

      try {
        // 1. Parse Date (supports YYYY-MM-DD or DD/MM/YYYY)
        let parsedDate: Date;
        if (dateStr.includes("/")) {
          const [day, month, year] = dateStr.split("/");
          parsedDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
        } else {
          parsedDate = new Date(`${dateStr}T12:00:00Z`);
        }

        if (isNaN(parsedDate.getTime())) {
          throw new Error("Data inválida");
        }

        // 2. Parse Amount
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          throw new Error("Valor numérico inválido");
        }

        // 3. Parse Category
        let category = categoryStr ? categoryStr.toUpperCase() : "OTHER";
        if (!validCategories.includes(category)) {
          category = "OTHER";
        }

        await prisma.transaction.create({
          data: {
            userId,
            date: parsedDate,
            description: description || "Transação Importada",
            amount: new Prisma.Decimal(amount),
            category: category as any,
            source: "IMPORT",
          }
        });

        imported++;
      } catch (err: any) {
        skipped++;
        errors.push(`Linha ${i + 1}: ${err.message}`);
      }
    }

    return { imported, skipped, errors };
  }

  /**
   * Retrieves structured data for report generation.
   * Includes all transactions for the month and basic summary stats.
   */
  async getReportData(userId: string, monthStr: string) {
    const [year, month] = monthStr.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    const summary = await this.getSummary(userId, monthStr);

    return {
      month: monthStr,
      transactions: transactions.map(convertDecimalToNumber),
      summary,
    };
  }
}

export const transactionService = new TransactionService();
