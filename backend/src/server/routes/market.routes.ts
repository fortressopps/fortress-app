import { Hono } from "hono";
import { authMiddleware, type AuthVariables } from "../../middleware/auth";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

interface MarketCache {
  data: any[];
  fetchedAt: Date;
}

// In-memory static cache
let marketCache: MarketCache | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const TICKERS = ["PETR4", "VALE3", "USDBRL", "BTC"];

app.get("/", async (c) => {
  const now = new Date();

  // Return cache if it's still fresh
  if (marketCache && (now.getTime() - marketCache.fetchedAt.getTime()) < CACHE_TTL_MS) {
    return c.json(marketCache.data);
  }

  try {
    // Brapi.dev endpoint for multiple tickers
    const res = await fetch(`https://brapi.dev/api/quote/${TICKERS.join(',')}`);
    if (!res.ok) {
      throw new Error(`Brapi API error: ${res.status}`);
    }
    
    const json = await res.json();
    
    if (!json.results || !Array.isArray(json.results)) {
      throw new Error("Invalid response format from Brapi");
    }

    const formattedData = json.results.map((item: any) => ({
      ticker: item.symbol,
      name: item.shortName || item.longName || item.symbol,
      price: item.regularMarketPrice,
      change_percent: item.regularMarketChangePercent,
      last_updated: new Date().toISOString(),
      cached: false,
    }));

    // Update Cache
    marketCache = {
      data: formattedData,
      fetchedAt: now,
    };

    return c.json(formattedData);

  } catch (err) {
    console.error("Failed to fetch market data:", err);

    // Fallback to stale cache if available
    if (marketCache) {
      const staleData = marketCache.data.map(item => ({
        ...item,
        cached: true,
      }));
      return c.json(staleData);
    }

    // No cache available, service is unavailable
    return c.json({ error: "Market data service unavailable." }, 503);
  }
});

export const marketRoutes = app;
