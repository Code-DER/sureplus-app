-- Implement FD-3 and FD-11: Atomic Donation RPCs with Auto-Funded Status

-- Drop the old increment_charity_amount RPC as it is replaced by donate_money_to_post
DROP FUNCTION IF EXISTS increment_charity_amount(UUID, NUMERIC);

-- 1. Money RPC
CREATE OR REPLACE FUNCTION donate_money_to_post(p_post_id UUID, p_amount NUMERIC)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
DECLARE
  rec "CharityPost"%ROWTYPE;
BEGIN
  IF p_amount <= 0 THEN 
    RAISE EXCEPTION 'Amount must be greater than zero'; 
  END IF;

  SELECT * INTO rec FROM "CharityPost" WHERE "charityID" = p_post_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Charity post not found';
  END IF;

  IF rec."donationMode" NOT IN ('money', 'both') THEN
    RAISE EXCEPTION 'This campaign does not accept monetary donations';
  END IF;

  IF rec."currentAmount" >= rec."amountNeeded" THEN
    RAISE EXCEPTION 'Money goal already reached';
  END IF;

  -- Perform the update
  UPDATE "CharityPost"
    SET "currentAmount" = LEAST("currentAmount" + p_amount, "amountNeeded")
    WHERE "charityID" = p_post_id
    RETURNING * INTO rec;

  -- FD-11: Auto-transition status to 'funded' if all applicable goals are met
  IF (rec."donationMode" = 'money' AND rec."currentAmount" >= rec."amountNeeded")
     OR (rec."donationMode" = 'food'  AND rec."currentFoodKg" >= rec."foodGoalKg")
     OR (rec."donationMode" = 'both'
         AND rec."currentAmount" >= rec."amountNeeded"
         AND rec."currentFoodKg" >= rec."foodGoalKg")
  THEN
    UPDATE "CharityPost" 
      SET "status" = 'funded' 
      WHERE "charityID" = p_post_id 
      RETURNING * INTO rec;
  END IF;

  RETURN NEXT rec;
END; $$;


-- 2. Food RPC
CREATE OR REPLACE FUNCTION donate_food_to_post(p_post_id UUID, p_food_id UUID, p_quantity INT)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
DECLARE
  rec      "CharityPost"%ROWTYPE;
  food_row "Food"%ROWTYPE;
  kg_added NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN 
    RAISE EXCEPTION 'Quantity must be greater than zero'; 
  END IF;

  SELECT * INTO rec FROM "CharityPost" WHERE "charityID" = p_post_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Charity post not found';
  END IF;

  IF rec."donationMode" NOT IN ('food', 'both') THEN
    RAISE EXCEPTION 'This campaign does not accept food donations';
  END IF;

  IF rec."currentFoodKg" >= rec."foodGoalKg" THEN
    RAISE EXCEPTION 'Food goal already reached';
  END IF;

  -- Decrement stock atomically
  SELECT * INTO food_row FROM "Food" WHERE "foodID" = p_food_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Food item not found';
  END IF;

  IF food_row."stockQuantity" < p_quantity THEN
    RAISE EXCEPTION 'Not enough stock for this food item';
  END IF;

  UPDATE "Food" SET "stockQuantity" = "stockQuantity" - p_quantity WHERE "foodID" = p_food_id;

  kg_added := LEAST(
    p_quantity * food_row."weightKg",
    rec."foodGoalKg" - rec."currentFoodKg"
  );

  -- Perform the update
  UPDATE "CharityPost"
    SET "currentFoodKg" = "currentFoodKg" + kg_added
    WHERE "charityID" = p_post_id
    RETURNING * INTO rec;

  -- FD-11: Auto-transition status to 'funded' if all applicable goals are met
  IF (rec."donationMode" = 'money' AND rec."currentAmount" >= rec."amountNeeded")
     OR (rec."donationMode" = 'food'  AND rec."currentFoodKg" >= rec."foodGoalKg")
     OR (rec."donationMode" = 'both'
         AND rec."currentAmount" >= rec."amountNeeded"
         AND rec."currentFoodKg" >= rec."foodGoalKg")
  THEN
    UPDATE "CharityPost" 
      SET "status" = 'funded' 
      WHERE "charityID" = p_post_id 
      RETURNING * INTO rec;
  END IF;

  RETURN NEXT rec;
END; $$;
