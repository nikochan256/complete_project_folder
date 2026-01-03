/*
  Warnings:

  - Added the required column `productImg` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "productImg" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL;
