/*
  Warnings:

  - A unique constraint covering the columns `[store_id]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_key]` on the table `sellers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `api_key` to the `sellers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `sellers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "api_key" TEXT NOT NULL,
ADD COLUMN     "store_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sellers_store_id_key" ON "sellers"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_api_key_key" ON "sellers"("api_key");
