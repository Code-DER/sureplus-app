-- Fix SocialImpact table: make purchaseID nullable to support donation-based impact

ALTER TABLE "SocialImpact" ALTER COLUMN "purchaseID" DROP NOT NULL;

-- Ensure the check constraint exists (it was added in FD-7 but good to be sure or update it if needed)
-- ALTER TABLE "SocialImpact" DROP CONSTRAINT IF EXISTS ck_socialimpact_source;
-- ALTER TABLE "SocialImpact" ADD CONSTRAINT ck_socialimpact_source CHECK (
--   ("purchaseID" IS NOT NULL AND "donationID" IS NULL)
--   OR
--   ("donationID" IS NOT NULL AND "purchaseID" IS NULL)
-- );
