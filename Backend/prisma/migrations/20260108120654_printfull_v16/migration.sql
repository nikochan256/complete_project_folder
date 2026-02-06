/*
  Warnings:

  - You are about to drop the column `storeId` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `productsData` on the `sellers` table. All the data in the column will be lost.
  - Added the required column `productId` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "storeId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "storeId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sellers" DROP COLUMN "productsData";

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
