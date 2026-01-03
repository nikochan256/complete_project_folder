/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cart_items_userId_productId_key";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_key" ON "cart_items"("userId");
