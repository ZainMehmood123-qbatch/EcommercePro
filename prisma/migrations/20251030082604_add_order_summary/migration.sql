-- CreateTable
CREATE TABLE "public"."OrderSummary" (
    "id" SERIAL NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "totalUnits" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderSummary_pkey" PRIMARY KEY ("id")
);
