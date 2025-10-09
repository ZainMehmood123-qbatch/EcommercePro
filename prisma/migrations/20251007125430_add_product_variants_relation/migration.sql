/*
  Warnings:

  - You are about to drop the column `variantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "variantId",
ADD COLUMN     "colorCode" TEXT,
ADD COLUMN     "colorName" TEXT,
ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "colorCode" TEXT,
ADD COLUMN     "colorName" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."ProductVariant";
