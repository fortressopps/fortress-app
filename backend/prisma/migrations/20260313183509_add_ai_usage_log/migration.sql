-- CreateEnum
CREATE TYPE "AIReportStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "plan" "UserTier" NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "status" "AIReportStatus" NOT NULL DEFAULT 'QUEUED',
    "tokensUsed" INTEGER DEFAULT 0,
    "costUsd" DOUBLE PRECISION DEFAULT 0,
    "costBrl" DOUBLE PRECISION DEFAULT 0,
    "latencyMs" INTEGER,
    "error" TEXT,
    "reportUrl" TEXT,
    "reportRequiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIUsageLog_requestId_key" ON "AIUsageLog"("requestId");

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
