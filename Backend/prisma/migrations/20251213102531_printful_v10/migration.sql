/*
  Warnings:

  - You are about to drop the column `orderId` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `Useremail` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `orders` table. All the data in the column will be lost.
  - Made the column `cartId` on table `cart_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_orderId_fkey";

-- DropIndex
DROP INDEX "cart_items_orderId_idx";

-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "orderId",
ALTER COLUMN "cartId" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "Useremail",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "deliveryAddress",
DROP COLUMN "state",
DROP COLUMN "status",
DROP COLUMN "totalAmount",
DROP COLUMN "zip_code";

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "orderId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "storeId" INTEGER NOT NULL,
    "productImg" TEXT NOT NULL,
    "productPrice" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "totalAmount" INTEGER,
    "deliveryAddress" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
