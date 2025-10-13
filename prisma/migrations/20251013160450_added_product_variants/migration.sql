-- CreateTable
CREATE TABLE "public"."ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "presentation" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductOptionValue" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "hex" TEXT,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrls" TEXT[],
    "combinationHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariantOption" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "valueId" TEXT NOT NULL,

    CONSTRAINT "ProductVariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "public"."ProductOption"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionValue_optionId_value_key" ON "public"."ProductOptionValue"("optionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "public"."ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_combinationHash_key" ON "public"."ProductVariant"("combinationHash");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "public"."ProductVariant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantOption_variantId_optionId_key" ON "public"."ProductVariantOption"("variantId", "optionId");

-- AddForeignKey
ALTER TABLE "public"."ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "public"."ProductOptionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
