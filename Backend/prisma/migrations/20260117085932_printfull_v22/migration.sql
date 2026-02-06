/*
  Warnings:

  - Added the required column `password` to the `sellers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "password" TEXT NOT NULL;
