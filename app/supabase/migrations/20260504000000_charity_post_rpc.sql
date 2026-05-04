-- Add RPC to handle atomic donation increments
CREATE OR REPLACE FUNCTION increment_charity_amount(p_charity_id UUID, p_amount NUMERIC)
RETURNS void LANGUAGE sql AS $$
  UPDATE "CharityPost"
  SET "currentAmount" = "currentAmount" + p_amount
  WHERE "charityID" = p_charity_id;
$$;
