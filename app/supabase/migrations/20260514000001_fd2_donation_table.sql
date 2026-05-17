-- Implement FD-2: Create Donation table supporting money and food donations

CREATE TABLE "Donation" (
  "donationID"   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "postID"       UUID          NOT NULL REFERENCES "CharityPost"("charityID") ON DELETE CASCADE,
  "userID"       UUID          REFERENCES "User"("userID") ON DELETE SET NULL,
  "donationType" TEXT          NOT NULL CHECK ("donationType" IN ('money', 'food')),

  -- Money fields (populated when donationType = 'money')
  "amount"       NUMERIC(12,2) CHECK ("amount" > 0),

  -- Food fields (populated when donationType = 'food')
  "foodID"       UUID          REFERENCES "Food"("foodID") ON DELETE SET NULL,
  "quantity"     INT           CHECK ("quantity" > 0),
  "foodKg"       NUMERIC(10,3) CHECK ("foodKg" >= 0),  -- quantity * Food.weightKg, denormalised for history

  "createdAt"    TIMESTAMPTZ   DEFAULT now(),

  -- Exactly one type's fields must be populated
  CONSTRAINT ck_donation_type CHECK (
    ("donationType" = 'money' AND "amount"   IS NOT NULL AND "foodID"   IS NULL AND "quantity" IS NULL)
    OR
    ("donationType" = 'food'  AND "foodID"   IS NOT NULL AND "quantity" IS NOT NULL AND "amount" IS NULL)
  )
);

ALTER TABLE "Donation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donors can view their own donations"
  ON "Donation" FOR SELECT USING (auth.uid() = "userID");

CREATE POLICY "Charities can view donations to their posts"
  ON "Donation" FOR SELECT USING (
    auth.uid() IN (SELECT "userID" FROM "CharityPost" WHERE "charityID" = "Donation"."postID")
  );

-- Indexes for performance
CREATE INDEX idx_donation_post ON "Donation"("postID");
CREATE INDEX idx_donation_user ON "Donation"("userID");
