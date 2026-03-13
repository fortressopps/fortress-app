import { prisma } from "../libs/prisma";
import { transactionService } from "./transaction.service";

export interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  message: string;
  value?: number;
}

export class AlertService {
  async getAlerts(userId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // 1. Get Monthly Goal (Budget)
    const monthlyGoal = await prisma.goal.findFirst({
      where: { userId, periodicity: "MONTHLY" },
      orderBy: { createdAt: "desc" },
    });
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // 2. Load constraints
    const [summary, transactions] = await Promise.all([
      transactionService.getSummary(userId),
      prisma.transaction.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" }
      })
    ]);

    // BUDGET ALERTS
    if (monthlyGoal && monthlyGoal.value > 0) {
      const budget = monthlyGoal.value;
      const spent = summary.totalExpenses;
      const pct = (spent / budget) * 100;
      
      if (pct > 100) {
        alerts.push({
          id: "BUDGET_EXCEEDED",
          type: "danger",
          message: `Você ultrapassou seu orçamento em R$ ${(spent - budget).toFixed(2)}`,
          value: spent - budget
        });
      } else if (pct > 80) {
        alerts.push({
          id: "BUDGET_WARNING",
          type: "warning",
          message: `Você já usou ${Math.round(pct)}% do seu orçamento este mês`,
          value: pct
        });
      }
    }

    // CATEGORY_SPIKE
    if (summary.totalExpenses > 0) {
      for (const [category, amount] of Object.entries(summary.expensesByCategory)) {
        const pct = (amount / summary.totalExpenses) * 100;
        if (pct > 40) {
          alerts.push({
            id: `CATEGORY_SPIKE_${category}`,
            type: "info",
            message: `Gastos com ${category} estão altos: ${Math.round(pct)}% das suas despesas`,
            value: pct
          });
        }
      }
    }

    // NO_INCOME
    if (summary.totalIncome === 0) {
      alerts.push({
        id: "NO_INCOME",
        type: "info",
        message: "Nenhuma receita registrada este mês"
      });
    }

    // STREAK_EXPENSES
    const daysMap = new Map<string, { income: number; expenses: number }>();
    for (const tx of transactions) {
      const dateStr = tx.date.toISOString().substring(0, 10);
      if (!daysMap.has(dateStr)) {
        daysMap.set(dateStr, { income: 0, expenses: 0 });
      }
      const dayData = daysMap.get(dateStr)!;
      const amount = Number(tx.amount);
      if (amount >= 0) dayData.income += amount;
      else dayData.expenses += Math.abs(amount);
    }

    const sortedDays = Array.from(daysMap.keys()).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of sortedDays) {
      const dayData = daysMap.get(dateStr)!;
      const currDate = new Date(dateStr);
      
      // se teve renda no dia, zera streak. 
      // Se não, e teve despesa, incrementa streak (se for dia consecutivo)
      if (dayData.income > 0) {
        currentStreak = 0;
        lastDate = currDate;
      } else if (dayData.expenses > 0) {
        if (!lastDate) {
          currentStreak = 1;
        } else {
          const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
        lastDate = currDate;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      }
    }

    if (maxStreak >= 5) {
      alerts.push({
        id: "STREAK_EXPENSES",
        type: "info",
        message: `Você teve despesas por ${maxStreak} dias seguidos sem receita`
      });
    }

    return alerts;
  }
}

export const alertService = new AlertService();
