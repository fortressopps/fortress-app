/**
 * Fortress Analytics - Data Aggregator
 * Provides time-series aggregations and comparisons
 */

export interface MonthlyAggregate {
    month: string; // YYYY-MM
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    categories: Record<string, number>;
}

export interface PeriodComparison {
    current: MonthlyAggregate;
    previous: MonthlyAggregate;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
}

/**
 * Aggregate transactions by month
 */
export function aggregateMonthly(
    transactions: Array<{ amount: number; category: string; date: Date }>
): MonthlyAggregate[] {
    const monthGroups = transactions.reduce((acc, t) => {
        const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(t);
        return acc;
    }, {} as Record<string, typeof transactions>);

    return Object.entries(monthGroups)
        .map(([month, txs]) => {
            const totalSpent = txs.reduce((sum, t) => sum + t.amount, 0);
            const categories = txs.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

            return {
                month,
                totalSpent,
                transactionCount: txs.length,
                averageTransaction: Math.round(totalSpent / txs.length),
                categories,
            };
        })
        .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Aggregate by category
 */
export function aggregateByCategory(
    transactions: Array<{ category: string; amount: number }>
): Record<string, { total: number; count: number; average: number }> {
    const categoryGroups = transactions.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t.amount);
        return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(categoryGroups).reduce((acc, [category, amounts]) => {
        const total = amounts.reduce((a, b) => a + b, 0);
        acc[category] = {
            total,
            count: amounts.length,
            average: Math.round(total / amounts.length),
        };
        return acc;
    }, {} as Record<string, { total: number; count: number; average: number }>);
}

/**
 * Compare two periods (e.g., current month vs previous month)
 */
export function comparePeriodsYoY(
    current: MonthlyAggregate,
    previous: MonthlyAggregate
): PeriodComparison {
    const changePercent = previous.totalSpent > 0
        ? ((current.totalSpent - previous.totalSpent) / previous.totalSpent) * 100
        : 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 5) trend = 'up';
    else if (changePercent < -5) trend = 'down';

    return {
        current,
        previous,
        changePercent: Math.round(changePercent * 10) / 10,
        trend,
    };
}

/**
 * Calculate rolling average (for smoothing trends)
 */
export function calculateRollingAverage(
    data: number[],
    windowSize: number = 3
): number[] {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = data.slice(start, i + 1);
        const avg = window.reduce((a, b) => a + b, 0) / window.length;
        result.push(Math.round(avg));
    }

    return result;
}
