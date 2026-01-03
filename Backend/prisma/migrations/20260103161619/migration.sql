-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "productsData" TEXT;

-- CreateTable
CREATE TABLE "recently_viewed_products" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productImg" TEXT NOT NULL,
    "productPrice" INTEGER NOT NULL,
    "variantId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recently_viewed_products_userId_idx" ON "recently_viewed_products"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_products_userId_viewedAt_idx" ON "recently_viewed_products"("userId", "viewedAt");

-- AddForeignKey
ALTER TABLE "recently_viewed_products" ADD CONSTRAINT "recently_viewed_products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
