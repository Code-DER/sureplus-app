-- Implement FD-1: Add donation mode and food goal tracking to CharityPost

ALTER TABLE "CharityPost"
  ADD COLUMN "donationMode"   TEXT          NOT NULL DEFAULT 'money'
    CHECK ("donationMode" IN ('money', 'food', 'both')),
  ADD COLUMN "foodGoalKg"     NUMERIC(10,3) CHECK ("foodGoalKg" > 0),
  ADD COLUMN "currentFoodKg"  NUMERIC(10,3) NOT NULL DEFAULT 0,
  ADD COLUMN "status"         TEXT          NOT NULL DEFAULT 'active'
    CHECK ("status" IN ('active', 'funded', 'closed'));

-- Enforce: money posts must have amountNeeded, food posts must have foodGoalKg
ALTER TABLE "CharityPost" ADD CONSTRAINT ck_charitypost_goals CHECK (
  (  "donationMode" = 'money' AND "amountNeeded" IS NOT NULL                         )
  OR ("donationMode" = 'food'  AND "foodGoalKg"   IS NOT NULL                         )
  OR ("donationMode" = 'both'  AND "amountNeeded" IS NOT NULL AND "foodGoalKg" IS NOT NULL)
);

-- Because amountNeeded is currently NOT NULL in the schema, it needs to become nullable
-- so food-only posts don't need to supply it.
ALTER TABLE "CharityPost" ALTER COLUMN "amountNeeded" DROP NOT NULL;
