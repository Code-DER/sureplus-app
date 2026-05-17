-- Drop unused donation RPCs as they are replaced by direct donation flow
DROP FUNCTION IF EXISTS donate_food_to_post(UUID, UUID, INT);
DROP FUNCTION IF EXISTS donate_purchased_food_to_post(UUID, UUID, UUID, INT);
