-- Atomic product and dietary-safety relationship writes for issue #10.

CREATE OR REPLACE FUNCTION create_food_with_allergens(
  food_data JSONB,
  allergen_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS SETOF "Food"
LANGUAGE plpgsql
AS $$
DECLARE
  new_food "Food"%ROWTYPE;
BEGIN
  INSERT INTO "Food" (
    "userID",
    "foodName",
    "description",
    "picture",
    "isEdible",
    "price",
    "stockQuantity",
    "expirationDate"
  )
  VALUES (
    (food_data->>'userID')::UUID,
    food_data->>'foodName',
    NULLIF(food_data->>'description', ''),
    NULLIF(food_data->>'picture', ''),
    COALESCE((food_data->>'isEdible')::BOOLEAN, TRUE),
    (food_data->>'price')::NUMERIC,
    COALESCE((food_data->>'stockQuantity')::INT, 0),
    NULLIF(food_data->>'expirationDate', '')::DATE
  )
  RETURNING * INTO new_food;

  IF allergen_ids IS NOT NULL AND array_length(allergen_ids, 1) IS NOT NULL THEN
    INSERT INTO "FoodAllergen" ("foodID", "allergenID")
    SELECT new_food."foodID", allergen_id
    FROM unnest(allergen_ids) AS allergen_id
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEXT new_food;
END;
$$;

CREATE OR REPLACE FUNCTION replace_food_allergens(
  target_food_id UUID,
  allergen_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM "FoodAllergen"
  WHERE "foodID" = target_food_id;

  IF allergen_ids IS NOT NULL AND array_length(allergen_ids, 1) IS NOT NULL THEN
    INSERT INTO "FoodAllergen" ("foodID", "allergenID")
    SELECT target_food_id, allergen_id
    FROM unnest(allergen_ids) AS allergen_id
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION replace_user_allergies(
  target_user_id UUID,
  allergen_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM "UserAllergies"
  WHERE "userID" = target_user_id;

  IF allergen_ids IS NOT NULL AND array_length(allergen_ids, 1) IS NOT NULL THEN
    INSERT INTO "UserAllergies" ("userID", "allergenID")
    SELECT target_user_id, allergen_id
    FROM unnest(allergen_ids) AS allergen_id
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
