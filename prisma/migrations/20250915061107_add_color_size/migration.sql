-- DropIndex
DROP INDEX "public"."Product_title_key";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "colorCode" TEXT,
ADD COLUMN     "colorName" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
