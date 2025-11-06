/*
  Warnings:

  - Added the required column `updatedAt` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CustomOrderStatus" AS ENUM ('in_progress', 'done', 'refused');

-- AlterTable
ALTER TABLE "public"."CustomOrder" ADD COLUMN     "status" "public"."CustomOrderStatus" NOT NULL DEFAULT 'in_progress',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CustomOrder_status_idx" ON "public"."CustomOrder"("status");

-- CreateIndex
CREATE INDEX "CustomOrder_createdAt_idx" ON "public"."CustomOrder"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."CustomOrder" ADD CONSTRAINT "CustomOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
