-- Fix B-8/F-10: Track donated quantity on PurchaseItems to support buyer-owned food donations

ALTER TABLE "PurchaseItems"
  ADD COLUMN "donatedQuantity" INTEGER NOT NULL DEFAULT 0
  CHECK ("donatedQuantity" >= 0 AND "donatedQuantity" <= "quantity");

-- Create specialized RPC for buyer-owned food donations
CREATE OR REPLACE FUNCTION donate_purchased_food_to_post(
  p_post_id UUID, 
  p_purchase_id UUID, 
  p_food_id UUID, 
  p_quantity INT
)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
DECLARE
  rec          "CharityPost"%ROWTYPE;
  purchase_row "PurchaseItems"%ROWTYPE;
  food_row     "Food"%ROWTYPE;
  kg_added     NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN 
    RAISE EXCEPTION 'Quantity must be greater than zero'; 
  END IF;

  SELECT * INTO rec FROM "CharityPost" WHERE "charityID" = p_post_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Charity post not found'; END IF;

  IF rec."donationMode" NOT IN ('food', 'both') THEN
    RAISE EXCEPTION 'This campaign does not accept food donations';
  END IF;

  IF rec."currentFoodKg" >= rec."foodGoalKg" THEN
    RAISE EXCEPTION 'Food goal already reached';
  END IF;

  -- Verify buyer quantity
  SELECT * INTO purchase_row 
    FROM "PurchaseItems" 
    WHERE "purchaseID" = p_purchase_id AND "foodID" = p_food_id 
    FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase item not found';
  END IF;

  IF (purchase_row."quantity" - purchase_row."donatedQuantity") < p_quantity THEN
    RAISE EXCEPTION 'Not enough purchased quantity for this donation';
  END IF;

  -- Update donatedQuantity
  UPDATE "PurchaseItems" 
    SET "donatedQuantity" = "donatedQuantity" + p_quantity 
    WHERE "purchaseID" = p_purchase_id AND "foodID" = p_food_id;

  -- Get food info for weightKg
  SELECT * INTO food_row FROM "Food" WHERE "foodID" = p_food_id;
  
  kg_added := LEAST(
    p_quantity * food_row."weightKg",
    rec."foodGoalKg" - rec."currentFoodKg"
  );

  -- Perform the CharityPost update
  UPDATE "CharityPost"
    SET "currentFoodKg" = "currentFoodKg" + kg_added
    WHERE "charityID" = p_post_id
    RETURNING * INTO rec;

  -- Auto-transition status to 'funded' if goal met
  IF (rec."donationMode" = 'food' AND rec."currentFoodKg" >= rec."foodGoalKg")
     OR (rec."donationMode" = 'both' 
         AND rec."currentAmount" >= rec."amountNeeded" 
         AND rec."currentFoodKg" >= rec."foodGoalKg")
  THEN
    UPDATE "CharityPost" SET "status" = 'funded' WHERE "charityID" = p_post_id RETURNING * INTO rec;
  END IF;

  RETURN NEXT rec;
END; $$;
