/*
  Warnings:

  - Added the required column `varientId` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "varientId" INTEGER NOT NULL;
