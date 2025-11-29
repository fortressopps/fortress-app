/*
  Warnings:

  - You are about to drop the `_TransactionTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budgets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supermarket_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supermarket_lists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TransactionTags" DROP CONSTRAINT "_TransactionTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_TransactionTags" DROP CONSTRAINT "_TransactionTags_B_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_userId_fkey";

-- DropForeignKey
ALTER TABLE "supermarket_items" DROP CONSTRAINT "supermarket_items_listId_fkey";

-- DropForeignKey
ALTER TABLE "supermarket_lists" DROP CONSTRAINT "supermarket_lists_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_accountId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_supermarketListId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- DropTable
DROP TABLE "_TransactionTags";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "budgets";

-- DropTable
DROP TABLE "supermarket_items";

-- DropTable
DROP TABLE "supermarket_lists";

-- DropTable
DROP TABLE "tags";

-- DropTable
DROP TABLE "transactions";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "BudgetPeriod";

-- DropEnum
DROP TYPE "PlanType";

-- DropEnum
DROP TYPE "SupermarketCategory";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
