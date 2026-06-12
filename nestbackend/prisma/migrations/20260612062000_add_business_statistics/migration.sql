CREATE TABLE "BusinessStatistic" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "revenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "productBuyCount" INTEGER NOT NULL DEFAULT 0,
    "productReturnCount" INTEGER NOT NULL DEFAULT 0,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessStatistic_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BusinessStatistic_date_key" ON "BusinessStatistic"("date");
CREATE INDEX "BusinessStatistic_date_idx" ON "BusinessStatistic"("date");
