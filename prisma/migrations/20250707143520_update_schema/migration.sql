/*
  Warnings:

  - Made the column `source` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "source" SET NOT NULL;
