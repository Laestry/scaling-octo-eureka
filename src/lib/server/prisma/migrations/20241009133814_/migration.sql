/*
  Warnings:

  - You are about to drop the column `format` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('bottle', 'box');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "format";

-- DropEnum
DROP TYPE "Format";

-- DropEnum
DROP TYPE "Unit";
