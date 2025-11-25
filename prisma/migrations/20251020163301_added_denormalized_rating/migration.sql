-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingSum" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_averageRating_idx" ON "public"."Product"("averageRating");
