-- Fortress v7.24 - Performance Indexes
-- Add indexes to optimize common queries

-- User queries (auth, profile)
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

-- Supermarket queries (user's lists and items)
CREATE INDEX IF NOT EXISTS idx_supermarket_list_user ON "SupermarketList"("userId");
CREATE INDEX IF NOT EXISTS idx_supermarket_item_list ON "SupermarketItem"("listId");
CREATE INDEX IF NOT EXISTS idx_supermarket_item_purchased ON "SupermarketItem"("purchased");

-- Goals queries (user's goals)
CREATE INDEX IF NOT EXISTS idx_goal_user ON "Goal"("userId");
CREATE INDEX IF NOT EXISTS idx_goal_periodicity ON "Goal"("periodicity");

-- Time-based queries (for analytics)
CREATE INDEX IF NOT EXISTS idx_supermarket_list_created ON "SupermarketList"("createdAt");
CREATE INDEX IF NOT EXISTS idx_goal_created ON "Goal"("createdAt");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_supermarket_list_user_created ON "SupermarketList"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_goal_user_periodicity ON "Goal"("userId", "periodicity");
