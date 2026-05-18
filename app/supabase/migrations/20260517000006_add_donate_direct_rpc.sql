-- Create RPC for direct food donations (donor-described food)
CREATE OR REPLACE FUNCTION donate_direct_food_to_post(
  p_post_id UUID,
  p_food_name TEXT,
  p_food_picture TEXT,
  p_expiry_date DATE,
  p_weight_kg NUMERIC,
  p_quantity INT
)
RETURNS TABLE (post "CharityPost", kg_added NUMERIC) 
LANGUAGE plpgsql 
AS $$
DECLARE
  v_rec "CharityPost"%ROWTYPE;
  v_kg_added NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN 
    RAISE EXCEPTION 'Quantity must be greater than zero'; 
  END IF;

  -- Lock the post
  SELECT * INTO v_rec FROM "CharityPost" WHERE "charityID" = p_post_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Charity post not found';
  END IF;

  IF v_rec."donationMode" NOT IN ('food', 'both') THEN
    RAISE EXCEPTION 'This campaign does not accept food donations';
  END IF;

  IF v_rec."currentFoodKg" >= v_rec."foodGoalKg" THEN
    RAISE EXCEPTION 'Food goal already reached';
  END IF;

  -- Calculate weight to add
  v_kg_added := LEAST(
    p_quantity * p_weight_kg,
    v_rec."foodGoalKg" - v_rec."currentFoodKg"
  );

  -- Perform the update
  UPDATE "CharityPost"
    SET "currentFoodKg" = "currentFoodKg" + v_kg_added
    WHERE "charityID" = p_post_id
    RETURNING * INTO v_rec;

  -- Auto-transition status to 'funded' if all applicable goals are met
  IF (v_rec."donationMode" = 'food'  AND v_rec."currentFoodKg" >= v_rec."foodGoalKg")
     OR (v_rec."donationMode" = 'both'
         AND v_rec."currentAmount" >= v_rec."amountNeeded"
         AND v_rec."currentFoodKg" >= v_rec."foodGoalKg")
  THEN
    UPDATE "CharityPost" 
      SET "status" = 'funded' 
      WHERE "charityID" = p_post_id 
      RETURNING * INTO v_rec;
  END IF;

  RETURN QUERY SELECT v_rec, v_kg_added;
END; $$;
