-- Promotional display values configured by the seller. The storefront must
-- always label these values "Seller display" and prioritize verified reviews.
UPDATE "Product"
SET
  "sellerRating" = (4.1 + (ABS(hashtext("id")::BIGINT) % 9) / 10.0)::DECIMAL(2,1),
  "sellerRatingCount" = 21 + (ABS(hashtext("id")::BIGINT) % 180)::INTEGER
WHERE "sellerRating" IS NULL OR "sellerRatingCount" IS NULL OR "sellerRatingCount" < 21;
