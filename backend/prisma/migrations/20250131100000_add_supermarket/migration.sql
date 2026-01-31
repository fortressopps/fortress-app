-- CreateEnum
CREATE TYPE "SupermarketCategory" AS ENUM ('PRODUCE', 'DAIRY', 'MEAT', 'BAKERY', 'FROZEN', 'BEVERAGES', 'PANTRY', 'OTHER');

-- CreateTable
CREATE TABLE "SupermarketList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupermarketList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupermarketItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SupermarketCategory" NOT NULL,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "actualPrice" DOUBLE PRECISION,
    "quantity" INTEGER DEFAULT 1,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupermarketItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupermarketList" ADD CONSTRAINT "SupermarketList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupermarketItem" ADD CONSTRAINT "SupermarketItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SupermarketList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
