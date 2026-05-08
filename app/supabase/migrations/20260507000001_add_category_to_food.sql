-- Add category to Food table
ALTER TABLE "Food" ADD COLUMN "category" TEXT DEFAULT 'All Items';
UPDATE "Food" SET "category" = 'Produce' WHERE "foodName" ILIKE '%Vegetable%' OR "foodName" ILIKE '%Banana%';
UPDATE "Food" SET "category" = 'Bakery' WHERE "foodName" ILIKE '%Bread%';
UPDATE "Food" SET "category" = 'Dairy' WHERE "foodName" ILIKE '%Yogurt%' OR "foodName" ILIKE '%Cheese%';
UPDATE "Food" SET "category" = 'Pantry' WHERE "foodName" ILIKE '%Rice%';
