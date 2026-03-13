/*
  Warnings:

  - The values [food,transport,health,entertainment,shopping,salary,other] on the enum `TransactionCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [manual,supermarket,import] on the enum `TransactionSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionCategory_new" AS ENUM ('FOOD', 'TRANSPORT', 'HEALTH', 'ENTERTAINMENT', 'SHOPPING', 'SALARY', 'OTHER');
ALTER TABLE "Transaction" ALTER COLUMN "category" TYPE "TransactionCategory_new" USING ("category"::text::"TransactionCategory_new");
ALTER TYPE "TransactionCategory" RENAME TO "TransactionCategory_old";
ALTER TYPE "TransactionCategory_new" RENAME TO "TransactionCategory";
DROP TYPE "public"."TransactionCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionSource_new" AS ENUM ('MANUAL', 'SUPERMARKET', 'IMPORT');
ALTER TABLE "public"."Transaction" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "source" TYPE "TransactionSource_new" USING ("source"::text::"TransactionSource_new");
ALTER TYPE "TransactionSource" RENAME TO "TransactionSource_old";
ALTER TYPE "TransactionSource_new" RENAME TO "TransactionSource";
DROP TYPE "public"."TransactionSource_old";
ALTER TABLE "Transaction" ALTER COLUMN "source" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "source" SET DEFAULT 'MANUAL';
