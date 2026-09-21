ALTER TABLE "ServiceablePincode" ADD COLUMN "stationCode" TEXT;

CREATE INDEX "ServiceablePincode_stationCode_isActive_idx"
ON "ServiceablePincode"("stationCode", "isActive");
