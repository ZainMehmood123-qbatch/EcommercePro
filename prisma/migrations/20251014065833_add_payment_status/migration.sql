-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
