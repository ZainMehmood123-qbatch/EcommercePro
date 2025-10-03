-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetTokenVersion" INTEGER NOT NULL DEFAULT 0;
