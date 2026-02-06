/*
  Warnings:

  - You are about to drop the column `image` on the `products` table. All the data in the column will be lost.
  - Added the required column `image1` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "image",
ADD COLUMN     "image1" TEXT NOT NULL,
ADD COLUMN     "image2" TEXT,
ADD COLUMN     "image3" TEXT;

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
