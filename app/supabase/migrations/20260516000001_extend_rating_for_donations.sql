-- Extend Rating table to support donations and more flexible user roles

-- 1. Loosen foreign key constraints to allow any User to be a rater or target
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_buyerID_fkey";
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_sellerID_fkey";

ALTER TABLE "Rating" ADD CONSTRAINT "Rating_buyerID_fkey" FOREIGN KEY ("buyerID") REFERENCES "User"("userID") ON DELETE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_sellerID_fkey" FOREIGN KEY ("sellerID") REFERENCES "User"("userID") ON DELETE CASCADE;

-- 2. Make purchaseID optional to support donations
ALTER TABLE "Rating" ALTER COLUMN "purchaseID" DROP NOT NULL;

-- 3. Add donationID column
ALTER TABLE "Rating" ADD COLUMN "donationID" UUID REFERENCES "Donation"("donationID") ON DELETE CASCADE;

-- 4. Add constraint to ensure either purchaseID or donationID is set (but not both)
ALTER TABLE "Rating" ADD CONSTRAINT "rating_source_check" CHECK (
    ("purchaseID" IS NOT NULL AND "donationID" IS NULL) OR
    ("purchaseID" IS NULL AND "donationID" IS NOT NULL)
);

-- 5. Add index for donationID
CREATE INDEX idx_rating_donation ON "Rating"("donationID");

-- 6. Add comment length constraint (e.g., 500 characters)
-- Note: PostgreSQL doesn't have a direct "max_length" on TEXT columns without a CHECK or using VARCHAR(N).
-- We'll use a CHECK constraint.
ALTER TABLE "Rating" ADD CONSTRAINT "rating_comment_length" CHECK (char_length("comment") <= 500);

-- 7. Update RLS policies to allow charities to insert ratings
-- Current policies:
-- CREATE POLICY "Buyers can insert their own ratings" ON "Rating" FOR INSERT WITH CHECK (auth.uid() = "buyerID");
-- This already works if we set buyerID to the charity's userID, but the name is confusing.
-- We'll add a more descriptive policy or just rely on the existing one if it's broad enough.
-- Since the existing policy uses "buyerID", and we are reusing that column as "raterID", it should work.
