ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_VERIFICATION_PENDING' BEFORE 'ORDER_CONFIRMED';

CREATE TYPE "ManualPaymentStatus" AS ENUM ('CREATED', 'VERIFICATION_PENDING', 'PAID', 'UNSUCCESSFUL', 'EXPIRED', 'CANCELLED');

ALTER TABLE "Product" ADD COLUMN "sellerRating" DECIMAL(2,1);
ALTER TABLE "ContactSettings" ADD COLUMN "upiId" TEXT, ADD COLUMN "upiPayeeName" TEXT;

ALTER TABLE "CheckoutSession" RENAME TO "ManualPaymentAttempt";
ALTER TABLE "ManualPaymentAttempt" ADD COLUMN "orderNumber" TEXT;
UPDATE "ManualPaymentAttempt" SET "orderNumber" = 'SBF-LEGACY-' || upper(substr(md5("id"), 1, 10));
ALTER TABLE "ManualPaymentAttempt" ALTER COLUMN "orderNumber" SET NOT NULL;
ALTER TABLE "ManualPaymentAttempt" ADD CONSTRAINT "ManualPaymentAttempt_orderNumber_key" UNIQUE ("orderNumber");
ALTER TABLE "ManualPaymentAttempt" ADD COLUMN "utrNumber" TEXT, ADD COLUMN "proofImageData" TEXT, ADD COLUMN "submittedAt" TIMESTAMP(3), ADD COLUMN "reviewedAt" TIMESTAMP(3), ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "ManualPaymentAttempt" ADD CONSTRAINT "ManualPaymentAttempt_utrNumber_key" UNIQUE ("utrNumber");
ALTER TABLE "ManualPaymentAttempt" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ManualPaymentAttempt" ALTER COLUMN "status" TYPE "ManualPaymentStatus" USING
  (CASE "status"::text WHEN 'PAYMENT_PENDING' THEN 'VERIFICATION_PENDING' WHEN 'FAILED' THEN 'UNSUCCESSFUL' ELSE "status"::text END)::"ManualPaymentStatus";
ALTER TABLE "ManualPaymentAttempt" ALTER COLUMN "status" SET DEFAULT 'CREATED';
ALTER TABLE "ManualPaymentAttempt" DROP COLUMN "providerOrderId", DROP COLUMN "processingFee", DROP COLUMN "roundingAdjustment";
DROP TYPE "CheckoutSessionStatus";

ALTER TABLE "Order" RENAME COLUMN "checkoutSessionId" TO "manualPaymentAttemptId";
ALTER TABLE "Order" DROP COLUMN "processingFee", DROP COLUMN "roundingAdjustment";

ALTER TABLE "Payment" RENAME COLUMN "provider" TO "method";
ALTER TABLE "Payment" RENAME COLUMN "providerPaymentId" TO "utrNumber";
ALTER TABLE "Payment" ALTER COLUMN "method" SET DEFAULT 'MANUAL_UPI';
ALTER TABLE "Payment" DROP COLUMN "providerOrderId", DROP COLUMN "providerSignature";

DROP TABLE IF EXISTS "PaymentWebhookEvent";
CREATE TABLE "SellerNotification" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "entityId" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SellerNotification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SellerNotification_isRead_createdAt_idx" ON "SellerNotification"("isRead", "createdAt");
