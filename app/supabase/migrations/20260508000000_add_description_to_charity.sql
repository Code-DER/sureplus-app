-- Add description column to Charity table
ALTER TABLE "Charity" ADD COLUMN "description" TEXT;

-- Update the view policy for Charity to allow anyone to view profiles
-- (Previously it only allowed charities to view their own record)
DROP POLICY IF EXISTS "Charities can view their own record" ON "Charity";
CREATE POLICY "Anyone can view charity profiles" 
  ON "Charity" FOR SELECT USING (true);
