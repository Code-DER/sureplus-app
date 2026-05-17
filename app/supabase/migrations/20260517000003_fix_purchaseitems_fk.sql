-- Fix X-6: change PurchaseItems.foodID FK to ON DELETE RESTRICT
-- This prevents deletion of food that has been purchased and resolves the conflict with the PK constraint

ALTER TABLE "PurchaseItems"
  DROP CONSTRAINT IF EXISTS "PurchaseItems_foodID_fkey",
  ADD CONSTRAINT "PurchaseItems_foodID_fkey"
    FOREIGN KEY ("foodID") REFERENCES "Food"("foodID") ON DELETE RESTRICT;
