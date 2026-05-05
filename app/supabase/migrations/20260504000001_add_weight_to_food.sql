-- Add weightKg to Food table.
-- Default 0.5 kg keeps existing rows valid; sellers should update their listings.
ALTER TABLE "Food"
  ADD COLUMN "weightKg" NUMERIC(6, 3) NOT NULL DEFAULT 0.5;

COMMENT ON COLUMN "Food"."weightKg" IS
  'Estimated weight of one unit in kilograms. Used for SocialImpact metric calculations.';
