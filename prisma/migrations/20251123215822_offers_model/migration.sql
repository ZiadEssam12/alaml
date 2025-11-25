-- CreateEnum
CREATE TYPE "OfferScope" AS ENUM ('product', 'category');

-- CreateTable
CREATE TABLE "offers" (
    "offer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scope" "OfferScope" NOT NULL,
    "productId" TEXT,
    "categoryId" TEXT,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_auto_apply" BOOLEAN NOT NULL DEFAULT true,
    "code" TEXT,
    "max_usage_count" INTEGER,
    "per_user_usage_count" INTEGER,
    "max_discount_amount" DECIMAL(10,2),
    "min_cart_amount" DECIMAL(10,2) DEFAULT 0.00,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE "offer_usages" (
    "usage_id" SERIAL NOT NULL,
    "offer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_usages_pkey" PRIMARY KEY ("usage_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_code_key" ON "offers"("code");

-- CreateIndex
CREATE INDEX "offers_is_active_idx" ON "offers"("is_active");

-- CreateIndex
CREATE INDEX "offers_scope_idx" ON "offers"("scope");

-- CreateIndex
CREATE INDEX "offers_productId_idx" ON "offers"("productId");

-- CreateIndex
CREATE INDEX "offers_categoryId_idx" ON "offers"("categoryId");

-- CreateIndex
CREATE INDEX "offers_start_date_idx" ON "offers"("start_date");

-- CreateIndex
CREATE INDEX "offers_expiration_date_idx" ON "offers"("expiration_date");

-- CreateIndex
CREATE INDEX "offer_usages_offer_id_idx" ON "offer_usages"("offer_id");

-- CreateIndex
CREATE INDEX "offer_usages_user_id_idx" ON "offer_usages"("user_id");

-- CreateIndex
CREATE INDEX "offer_usages_order_id_idx" ON "offer_usages"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "offer_usages_offer_id_user_id_order_id_key" ON "offer_usages"("offer_id", "user_id", "order_id");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_usages" ADD CONSTRAINT "offer_usages_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("offer_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_usages" ADD CONSTRAINT "offer_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_usages" ADD CONSTRAINT "offer_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
