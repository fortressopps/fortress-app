/**
 * Fortress Analytics - Pattern Detection
 * Identifies recurring spending patterns and behavioral insights
 */

export interface SpendingPattern {
    type: 'recurring' | 'seasonal' | 'one_time';
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    averageAmount: number;
    confidence: number;
    lastOccurrence: Date;
}

export interface CategoryTrend {
    category: string;
    currentMonth: number;
    previousMonth: number;
    changePercent: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnomalyResult {
    isAnomaly: boolean;
    score: number; // 0-100, higher = more unusual
    reason: string;
    expectedRange: { min: number; max: number };
}

/**
 * Detect spending patterns from transaction history
 */
export function detectSpendingPatterns(
    transactions: Array<{ category: string; amount: number; date: Date }>
): SpendingPattern[] {
    const patterns: SpendingPattern[] = [];
    const categoryGroups = groupByCategory(transactions);

    for (const [category, txs] of Object.entries(categoryGroups)) {
        if (txs.length < 3) continue; // Need at least 3 occurrences

        const avgAmount = txs.reduce((sum, t) => sum + t.amount, 0) / txs.length;
        const frequency = detectFrequency(txs);
        const confidence = calculatePatternConfidence(txs, frequency);

        if (confidence > 0.6) {
            patterns.push({
                type: frequency === 'monthly' ? 'recurring' : 'seasonal',
                category,
                frequency,
                averageAmount: avgAmount,
                confidence,
                lastOccurrence: txs[txs.length - 1].date,
            });
        }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Analyze category-level trends
 */
export function analyzeCategoryTrends(
    currentMonth: Array<{ category: string; amount: number }>,
    previousMonth: Array<{ category: string; amount: number }>
): CategoryTrend[] {
    const currentTotals = aggregateByCategory(currentMonth);
    const previousTotals = aggregateByCategory(previousMonth);
    const trends: CategoryTrend[] = [];

    const allCategories = new Set([
        ...Object.keys(currentTotals),
        ...Object.keys(previousTotals),
    ]);

    for (const category of allCategories) {
        const current = currentTotals[category] || 0;
        const previous = previousTotals[category] || 0;

        if (previous === 0 && current === 0) continue;

        const changePercent = previous > 0
            ? ((current - previous) / previous) * 100
            : 100;

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (changePercent > 10) trend = 'increasing';
        else if (changePercent < -10) trend = 'decreasing';

        trends.push({
            category,
            currentMonth: current,
            previousMonth: previous,
            changePercent: Math.round(changePercent * 10) / 10,
            trend,
        });
    }

    return trends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}

/**
 * Calculate anomaly score for a transaction
 */
export function calculateAnomalyScore(
    transaction: { category: string; amount: number },
    historicalData: Array<{ category: string; amount: number }>
): AnomalyResult {
    const categoryHistory = historicalData.filter(
        (t) => t.category === transaction.category
    );

    if (categoryHistory.length < 5) {
        return {
            isAnomaly: false,
            score: 0,
            reason: 'Insufficient historical data',
            expectedRange: { min: 0, max: Infinity },
        };
    }

    const amounts = categoryHistory.map((t) => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
        amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    );

    const zScore = Math.abs((transaction.amount - mean) / stdDev);
    const score = Math.min(100, Math.round(zScore * 20)); // Scale to 0-100

    const expectedRange = {
        min: Math.round(mean - 2 * stdDev),
        max: Math.round(mean + 2 * stdDev),
    };

    const isAnomaly = zScore > 2; // 2 standard deviations

    return {
        isAnomaly,
        score,
        reason: isAnomaly
            ? `Amount ${transaction.amount} is ${zScore.toFixed(1)}σ from mean ${mean.toFixed(0)}`
            : 'Within normal range',
        expectedRange,
    };
}

// Helper functions
function groupByCategory(transactions: Array<{ category: string; amount: number; date: Date }>) {
    return transactions.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
    }, {} as Record<string, typeof transactions>);
}

function detectFrequency(transactions: Array<{ date: Date }>): 'daily' | 'weekly' | 'monthly' {
    if (transactions.length < 2) return 'monthly';

    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
        const days = Math.abs(
            (transactions[i].date.getTime() - transactions[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
        );
        intervals.push(days);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    if (avgInterval < 3) return 'daily';
    if (avgInterval < 10) return 'weekly';
    return 'monthly';
}

function calculatePatternConfidence(
    transactions: Array<{ amount: number }>,
    frequency: string
): number {
    const amounts = transactions.map((t) => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    // Lower CV = higher confidence
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
}

function aggregateByCategory(data: Array<{ category: string; amount: number }>) {
    return data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {} as Record<string, number>);
}
