/*
  Warnings:

  - You are about to drop the column `blockchainNetwork` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `buyerId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Useremail` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_sellerId_fkey";

-- DropIndex
DROP INDEX "cart_items_cartId_variantId_key";

-- DropIndex
DROP INDEX "orders_buyerId_idx";

-- DropIndex
DROP INDEX "orders_orderNumber_key";

-- DropIndex
DROP INDEX "orders_paymentStatus_idx";

-- DropIndex
DROP INDEX "orders_sellerId_idx";

-- DropIndex
DROP INDEX "orders_txHash_idx";

-- DropIndex
DROP INDEX "orders_txHash_key";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "orderId" INTEGER,
ALTER COLUMN "cartId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "blockchainNetwork",
DROP COLUMN "buyerId",
DROP COLUMN "orderNumber",
DROP COLUMN "paidAt",
DROP COLUMN "paymentAddress",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentStatus",
DROP COLUMN "sellerId",
DROP COLUMN "txHash",
ADD COLUMN     "Useremail" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "zip_code" TEXT NOT NULL,
ALTER COLUMN "totalAmount" DROP NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "order_items";

-- CreateIndex
CREATE INDEX "cart_items_orderId_idx" ON "cart_items"("orderId");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
