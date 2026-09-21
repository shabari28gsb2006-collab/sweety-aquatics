ALTER TABLE "Product" ADD COLUMN "sellerRatingCount" INTEGER DEFAULT 0;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_sellerRatingCount_check"
CHECK ("sellerRatingCount" IS NULL OR "sellerRatingCount" >= 0);
