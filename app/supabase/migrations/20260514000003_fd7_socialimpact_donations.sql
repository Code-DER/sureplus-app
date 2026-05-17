-- Implement FD-7: Extend SocialImpact to support donations

ALTER TABLE "SocialImpact"
  ADD COLUMN "donationID" UUID REFERENCES "Donation"("donationID") ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS uq_socialimpact_purchase; -- B-2 adds this, but we need to handle the case if it's already there

-- Exactly one of purchaseID or donationID must be populated
ALTER TABLE "SocialImpact" ADD CONSTRAINT ck_socialimpact_source CHECK (
  ("purchaseID" IS NOT NULL AND "donationID" IS NULL)
  OR
  ("donationID" IS NOT NULL AND "purchaseID" IS NULL)
);

-- Unique constraints to ensure 1:1 impact mapping
ALTER TABLE "SocialImpact" ADD CONSTRAINT uq_socialimpact_purchase UNIQUE ("purchaseID");
ALTER TABLE "SocialImpact" ADD CONSTRAINT uq_socialimpact_donation UNIQUE ("donationID");

-- Index for donation lookup
CREATE INDEX idx_socialimpact_donation ON "SocialImpact"("donationID");
