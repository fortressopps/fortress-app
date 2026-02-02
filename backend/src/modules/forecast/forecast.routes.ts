/**
 * Fortress v7.24 - Forecast API
 * Exposes consolidated financial projections
 */
import { Hono } from "hono";
import { authMiddleware, type AuthVariables } from "../../middleware/auth";
import { consolidateForecast } from "./domain/forecast.calculator";
import { prisma } from "../../libs/prisma";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

app.get("/", async (c) => {
    const user = c.get("user");
    const now = new Date();

    // 1. Get Monthly Budget (from Goals)
    const monthlyGoal = await prisma.goal.findFirst({
        where: {
            userId: user.id,
            periodicity: "MONTHLY"
        }
    });
    const budget = monthlyGoal?.value || 500000; // Default 5000 BRL if no goal

    // 2. Get Current Spend (from Supermarket Lists this month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lists = await prisma.supermarketList.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: startOfMonth }
        },
        include: { items: true }
    });

    const totalSpent = lists.reduce((sum, list) => {
        const listTotal = list.items.reduce((s, item) => s + (item.actualPrice || item.estimatedPrice || 0) * (item.quantity || 1), 0);
        return sum + listTotal;
    }, 0);

    // 3. Get Recent History for Weekly Trends (Last 30 days)
    const startOfHistory = new Date();
    startOfHistory.setDate(startOfHistory.getDate() - 30);

    const historyLists = await prisma.supermarketList.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: startOfHistory }
        },
        include: { items: true },
        orderBy: { createdAt: 'asc' }
    });

    const dailyHistory = historyLists.map(list => ({
        date: list.createdAt,
        amount: list.items.reduce((s, item) => s + (item.actualPrice || item.estimatedPrice || 0) * (item.quantity || 1), 0)
    }));

    // 4. Calculate Forecast
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const forecast = consolidateForecast(
        totalSpent,
        now.getDate(), // daysElapsed
        totalDaysInMonth, // totalDays
        budget, // initialBudget
        dailyHistory.map(d => d.amount) // recentDailySpending (number[])
    );

    return c.json({
        forecast,
        meta: {
            budget,
            currentSpend: totalSpent,
            percentage: Math.round((totalSpent / budget) * 100)
        }
    });
});

export const forecastRoutes = app;
