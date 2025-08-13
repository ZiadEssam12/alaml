/*
  Warnings:

  - You are about to drop the column `parentCategoryID` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_parentCategoryID_fkey";

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "parentCategoryID";

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
