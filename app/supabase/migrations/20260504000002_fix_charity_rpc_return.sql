-- Fix increment_charity_amount to return the updated record instead of void
-- We must DROP first because return type is changing from void to SETOF
DROP FUNCTION IF EXISTS increment_charity_amount(UUID, NUMERIC);

CREATE OR REPLACE FUNCTION increment_charity_amount(p_charity_id UUID, p_amount NUMERIC)
RETURNS SETOF "CharityPost" LANGUAGE sql AS $$
  UPDATE "CharityPost"
  SET "currentAmount" = "currentAmount" + p_amount
  WHERE "charityID" = p_charity_id
  RETURNING *;
$$;
