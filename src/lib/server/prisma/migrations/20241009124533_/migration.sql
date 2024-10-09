-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('unit', 'box');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('ml', 'l');

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "external_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerSite" TEXT NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "alcohol" DOUBLE PRECISION NOT NULL,
    "volume" SMALLINT NOT NULL,
    "vintage" SMALLINT,
    "price" DOUBLE PRECISION NOT NULL,
    "format" TEXT,
    "unit" TEXT,
    "originCity" TEXT NOT NULL,
    "originRegion" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "originCountryCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specificCategory" TEXT NOT NULL,
    "tags" TEXT[],
    "raw" JSON NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_external_id_key" ON "Product"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
