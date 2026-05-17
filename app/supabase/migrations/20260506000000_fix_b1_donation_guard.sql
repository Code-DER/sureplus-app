-- Fix B-1: add DB-level guard in the RPC to prevent negative/zero donations
CREATE OR REPLACE FUNCTION increment_charity_amount(p_charity_id UUID, p_amount NUMERIC)
RETURNS SETOF "CharityPost" LANGUAGE plpgsql AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Donation amount must be greater than zero';
  END IF;
  RETURN QUERY
    UPDATE "CharityPost"
    SET "currentAmount" = "currentAmount" + p_amount
    WHERE "charityID" = p_charity_id
    RETURNING *;
END;
$$;
