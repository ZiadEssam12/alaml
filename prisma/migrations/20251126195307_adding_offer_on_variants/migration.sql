-- AlterEnum
ALTER TYPE "OfferScope" ADD VALUE 'variant';

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "variant_id" TEXT;

-- CreateIndex
CREATE INDEX "offers_variant_id_idx" ON "offers"("variant_id");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
