-- Fix B-2: Add UNIQUE constraint to SocialImpact.purchaseID to prevent duplicate impact records
ALTER TABLE "SocialImpact"
  ADD CONSTRAINT uq_socialimpact_purchase UNIQUE ("purchaseID");
