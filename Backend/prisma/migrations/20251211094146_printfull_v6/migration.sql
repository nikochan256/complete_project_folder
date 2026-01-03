/*
  Warnings:

  - You are about to drop the column `productId` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cartId,variantId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_productId_fkey";

-- DropIndex
DROP INDEX "cart_items_cartId_productId_variantId_key";

-- DropIndex
DROP INDEX "cart_items_productId_idx";

-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "productId";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "productId";

-- DropTable
DROP TABLE "products";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_variantId_key" ON "cart_items"("cartId", "variantId");
