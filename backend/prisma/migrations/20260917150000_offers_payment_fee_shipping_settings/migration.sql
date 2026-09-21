ALTER TABLE "Product"
  ADD COLUMN "offerPrice" DECIMAL(10,2),
  ADD COLUMN "offerEndsAt" TIMESTAMP(3);

ALTER TABLE "ContactSettings"
  ADD COLUMN "courierPackingCharge" DECIMAL(10,2) NOT NULL DEFAULT 60;

ALTER TABLE "CheckoutSession"
  ADD COLUMN "processingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "roundingAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "Order"
  ADD COLUMN "processingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "roundingAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE INDEX "Product_offerEndsAt_idx" ON "Product"("offerEndsAt");
