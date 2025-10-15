/*
  Warnings:

  - The `paymentStatus` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "tax" SET DEFAULT 0,
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeCustomerId" TEXT;
