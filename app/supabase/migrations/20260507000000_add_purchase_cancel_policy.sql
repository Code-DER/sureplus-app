-- Add UPDATE RLS policy to Purchase table for buyer-owned cancellation
CREATE POLICY "Buyers can cancel their own purchases"
  ON "Purchase" FOR UPDATE
  USING (auth.uid() = "userID")
  WITH CHECK (status = 'cancelled');
