-- Fix relationship for PostgREST joins between CharityPost and Charity
-- This allows .select("*, Charity(isPartner)")
ALTER TABLE "CharityPost"
ADD CONSTRAINT fk_charity_post_charity
FOREIGN KEY ("userID") REFERENCES "Charity"("userID");
