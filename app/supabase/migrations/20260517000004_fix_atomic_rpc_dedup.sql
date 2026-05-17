-- Fix X-7: Aggregate duplicate food items in one order to prevent PK violations
-- This replaces the original create_purchase_atomic with a version that sums quantities by foodID

CREATE OR REPLACE FUNCTION create_purchase_atomic(
  p_user_id UUID,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS SETOF "Purchase"
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase_id UUID;
  v_total_price NUMERIC(10,2) := 0;
  v_food_id UUID;
  v_quantity INT;
  v_price NUMERIC(10,2);
  v_stock INT;
  v_subtotal NUMERIC(10,2);
BEGIN
  -- 1. Create the Purchase record first with total 0 (will update later)
  INSERT INTO "Purchase" ("userID", "paymentMethod", "totalPrice", "status")
  VALUES (p_user_id, p_payment_method, 0, 'pending')
  RETURNING "purchaseID" INTO v_purchase_id;

  -- 2. Process items (aggregated by foodID to prevent PK violations)
  FOR v_food_id, v_quantity IN 
    SELECT (item->>'foodID')::UUID, SUM((item->>'quantity')::INT)::INT
    FROM jsonb_array_elements(p_items) AS item
    GROUP BY (item->>'foodID')::UUID
  LOOP
    -- Lock the Food row for update to prevent race conditions
    SELECT "price", "stockQuantity" INTO v_price, v_stock
    FROM "Food"
    WHERE "foodID" = v_food_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Food item % not found', v_food_id;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Not enough stock for food item %', v_food_id;
    END IF;

    v_subtotal := v_price * v_quantity;
    v_total_price := v_total_price + v_subtotal;

    -- Deduct stock
    UPDATE "Food"
    SET "stockQuantity" = "stockQuantity" - v_quantity
    WHERE "foodID" = v_food_id;

    -- Insert PurchaseItem
    INSERT INTO "PurchaseItems" ("purchaseID", "foodID", "quantity", "price", "totalPerItem")
    VALUES (v_purchase_id, v_food_id, v_quantity, v_price, v_subtotal);
  END LOOP;

  -- 3. Update the Purchase record with the final calculated total
  UPDATE "Purchase"
  SET "totalPrice" = v_total_price
  WHERE "purchaseID" = v_purchase_id;

  -- 4. Return the full purchase record
  RETURN QUERY
  SELECT *
  FROM "Purchase"
  WHERE "purchaseID" = v_purchase_id;
END;
$$;
