ALTER TABLE "Purchase"
  DROP CONSTRAINT IF EXISTS "Purchase_userID_fkey",
  ADD CONSTRAINT "Purchase_userID_fkey"
    FOREIGN KEY ("userID") REFERENCES "Buyer"("userID") ON DELETE RESTRICT;