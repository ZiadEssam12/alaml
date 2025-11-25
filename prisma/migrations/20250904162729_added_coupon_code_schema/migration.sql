/*
  Warnings:

  - A unique constraint covering the columns `[coupon_id,user_id,order_id]` on the table `coupon_usages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_couponCode_fkey";

-- DropForeignKey
ALTER TABLE "public"."coupon_usages" DROP CONSTRAINT "coupon_usages_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."coupon_usages" DROP CONSTRAINT "coupon_usages_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."coupon_usages" DROP CONSTRAINT "coupon_usages_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "couponId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_coupon_id_user_id_order_id_key" ON "public"."coupon_usages"("coupon_id", "user_id", "order_id");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("coupon_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("coupon_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
