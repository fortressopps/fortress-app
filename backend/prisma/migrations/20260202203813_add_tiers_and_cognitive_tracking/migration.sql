-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('SENTINEL', 'VANGUARD', 'LEGACY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "impulseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastDashboardVisit" TIMESTAMP(3),
ADD COLUMN     "tier" "UserTier" NOT NULL DEFAULT 'SENTINEL',
ADD COLUMN     "totalInsightsViewed" INTEGER NOT NULL DEFAULT 0;
