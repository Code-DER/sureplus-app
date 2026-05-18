CREATE POLICY "Authenticated users can insert donations"
  ON "Donation" FOR INSERT
  WITH CHECK (auth.uid() = "userID");

  -- Allow inserts (by the purchaser or donor)
CREATE POLICY "Users can insert social impact"
  ON "SocialImpact" FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT "userID" FROM "Purchase" WHERE "purchaseID" = "SocialImpact"."purchaseID"
      UNION
      SELECT "userID" FROM "Donation" WHERE "donationID" = "SocialImpact"."donationID"
    )
  );

-- Fix SELECT so donation-based impact is also visible
DROP POLICY IF EXISTS "Buyers can view their own social impact" ON "SocialImpact";
CREATE POLICY "Users can view their own social impact"
  ON "SocialImpact" FOR SELECT
  USING (
    auth.uid() IN (
      SELECT "userID" FROM "Purchase" WHERE "purchaseID" = "SocialImpact"."purchaseID"
      UNION
      SELECT "userID" FROM "Donation" WHERE "donationID" = "SocialImpact"."donationID"
    )
  );