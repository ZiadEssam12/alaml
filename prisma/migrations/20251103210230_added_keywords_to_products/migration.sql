-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
