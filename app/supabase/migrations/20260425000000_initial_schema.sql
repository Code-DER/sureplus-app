-- ============================================================
-- SurePlus - Initial Schema Migration
-- Includes RLS (Row Level Security) for all tables
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. USER
-- ============================================================
CREATE TABLE "User" (
  "userID"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName"       TEXT        NOT NULL,
  "lastName"        TEXT        NOT NULL,
  "emailAddress"    TEXT        UNIQUE NOT NULL,
  "password"        TEXT        NOT NULL,
  "phoneNumber"     TEXT,
  "role"            TEXT        NOT NULL CHECK ("role" IN ('buyer', 'seller', 'charity', 'admin')),
  "street"          TEXT,
  "barangay"        TEXT,
  "city"            TEXT,
  "residentialName" TEXT,
  "createdAt"       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own record"
  ON "User" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Users can update their own record"
  ON "User" FOR UPDATE USING (auth.uid() = "userID");


-- ============================================================
-- 2. USER SUBTYPES
-- ============================================================
CREATE TABLE "Buyer" (
  "userID" UUID PRIMARY KEY REFERENCES "User"("userID") ON DELETE CASCADE,
  "points" NUMERIC DEFAULT 0
);

ALTER TABLE "Buyer" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view their own record"
  ON "Buyer" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Buyers can update their own record"
  ON "Buyer" FOR UPDATE USING (auth.uid() = "userID");


CREATE TABLE "Seller" (
  "userID"      UUID    PRIMARY KEY REFERENCES "User"("userID") ON DELETE CASCADE,
  "sellerType"  TEXT,
  "isVerified"  BOOLEAN DEFAULT false,
  "companyName" TEXT
);

ALTER TABLE "Seller" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own record"
  ON "Seller" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Sellers can update their own record"
  ON "Seller" FOR UPDATE USING (auth.uid() = "userID");
CREATE POLICY "Anyone can view verified sellers"
  ON "Seller" FOR SELECT USING ("isVerified" = true);


CREATE TABLE "Charity" (
  "userID"           UUID PRIMARY KEY REFERENCES "User"("userID") ON DELETE CASCADE,
  "organizationName" TEXT
);

ALTER TABLE "Charity" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Charities can view their own record"
  ON "Charity" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Charities can update their own record"
  ON "Charity" FOR UPDATE USING (auth.uid() = "userID");


CREATE TABLE "Admin" (
  "userID"     UUID PRIMARY KEY REFERENCES "User"("userID") ON DELETE CASCADE,
  "employeeID" TEXT UNIQUE,
  "adminType"  TEXT
);

ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view their own record"
  ON "Admin" FOR SELECT USING (auth.uid() = "userID");


-- ============================================================
-- 3. NOTIFICATIONS
-- ============================================================
CREATE TABLE "Notifications" (
  "notificationID" UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userID"         UUID        NOT NULL REFERENCES "User"("userID") ON DELETE CASCADE,
  "title"          TEXT,
  "message"        TEXT,
  "link"           TEXT,
  "type"           TEXT,
  "createdAt"      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications"
  ON "Notifications" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Users can delete their own notifications"
  ON "Notifications" FOR DELETE USING (auth.uid() = "userID");


-- ============================================================
-- 4. CHARITY APPLICATION
-- ============================================================
CREATE TABLE "CharityApplication" (
  "applicationID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userID"        UUID NOT NULL REFERENCES "User"("userID") ON DELETE CASCADE,
  "purpose"       TEXT,
  "govID"         TEXT,
  "status"        TEXT DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE "CharityApplication" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own application"
  ON "CharityApplication" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Users can insert their own application"
  ON "CharityApplication" FOR INSERT WITH CHECK (auth.uid() = "userID");


-- ============================================================
-- 5. CHARITY POST
-- ============================================================
CREATE TABLE "CharityPost" (
  "charityID"     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "userID"        UUID          NOT NULL REFERENCES "User"("userID") ON DELETE CASCADE,
  "title"         TEXT          NOT NULL,
  "description"   TEXT,
  "currentAmount" NUMERIC(12,2) DEFAULT 0,
  "amountNeeded"  NUMERIC(12,2) NOT NULL,
  "createdAt"     TIMESTAMPTZ   DEFAULT now()
);

ALTER TABLE "CharityPost" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view charity posts"
  ON "CharityPost" FOR SELECT USING (true);
CREATE POLICY "Charity users can insert their own posts"
  ON "CharityPost" FOR INSERT WITH CHECK (auth.uid() = "userID");
CREATE POLICY "Charity users can update their own posts"
  ON "CharityPost" FOR UPDATE USING (auth.uid() = "userID");
CREATE POLICY "Charity users can delete their own posts"
  ON "CharityPost" FOR DELETE USING (auth.uid() = "userID");


-- ============================================================
-- 6. ALLERGEN
-- ============================================================
CREATE TABLE "Allergen" (
  "allergenID" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       TEXT UNIQUE NOT NULL
);

ALTER TABLE "Allergen" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view allergens"
  ON "Allergen" FOR SELECT USING (true);


-- ============================================================
-- 7. FOOD
-- ============================================================
CREATE TABLE "Food" (
  "foodID"         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "userID"         UUID          NOT NULL REFERENCES "Seller"("userID") ON DELETE CASCADE,
  "foodName"       TEXT          NOT NULL,
  "description"    TEXT,
  "picture"        TEXT,
  "isEdible"       BOOLEAN       DEFAULT true,
  "price"          NUMERIC(10,2) NOT NULL,
  "stockQuantity"  INT           DEFAULT 0,
  "expirationDate" DATE,
  "createdAt"      TIMESTAMPTZ   DEFAULT now()
);

ALTER TABLE "Food" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view food listings"
  ON "Food" FOR SELECT USING (true);
CREATE POLICY "Sellers can insert their own food"
  ON "Food" FOR INSERT WITH CHECK (auth.uid() = "userID");
CREATE POLICY "Sellers can update their own food"
  ON "Food" FOR UPDATE USING (auth.uid() = "userID");
CREATE POLICY "Sellers can delete their own food"
  ON "Food" FOR DELETE USING (auth.uid() = "userID");


-- ============================================================
-- 8. FOOD ALLERGEN
-- ============================================================
CREATE TABLE "FoodAllergen" (
  "foodID"     UUID NOT NULL REFERENCES "Food"("foodID")         ON DELETE CASCADE,
  "allergenID" UUID NOT NULL REFERENCES "Allergen"("allergenID") ON DELETE CASCADE,
  PRIMARY KEY ("foodID", "allergenID")
);

ALTER TABLE "FoodAllergen" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view food allergens"
  ON "FoodAllergen" FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their food allergens"
  ON "FoodAllergen" FOR ALL
  USING (
    auth.uid() IN (SELECT "userID" FROM "Food" WHERE "foodID" = "FoodAllergen"."foodID")
  );


-- ============================================================
-- 9. USER ALLERGIES
-- ============================================================
CREATE TABLE "UserAllergies" (
  "userID"     UUID NOT NULL REFERENCES "User"("userID")         ON DELETE CASCADE,
  "allergenID" UUID NOT NULL REFERENCES "Allergen"("allergenID") ON DELETE CASCADE,
  PRIMARY KEY ("userID", "allergenID")
);

ALTER TABLE "UserAllergies" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own allergies"
  ON "UserAllergies" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Users can manage their own allergies"
  ON "UserAllergies" FOR ALL USING (auth.uid() = "userID");


-- ============================================================
-- 10. PURCHASE
-- ============================================================
CREATE TABLE "Purchase" (
  "purchaseID"    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "userID"        UUID          NOT NULL REFERENCES "Buyer"("userID") ON DELETE SET NULL,
  "purchaseDate"  TIMESTAMPTZ   DEFAULT now(),
  "paymentMethod" TEXT,
  "totalPrice"    NUMERIC(10,2) NOT NULL,
  "status"        TEXT          DEFAULT 'pending'
                                CHECK ("status" IN ('pending', 'completed', 'cancelled', 'refunded'))
);

ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view their own purchases"
  ON "Purchase" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Buyers can insert their own purchases"
  ON "Purchase" FOR INSERT WITH CHECK (auth.uid() = "userID");


-- ============================================================
-- 11. PURCHASE ITEMS
-- ============================================================
CREATE TABLE "PurchaseItems" (
  "purchaseID"   UUID          NOT NULL REFERENCES "Purchase"("purchaseID") ON DELETE CASCADE,
  "foodID"       UUID          NOT NULL REFERENCES "Food"("foodID")         ON DELETE SET NULL,
  "quantity"     INT           NOT NULL CHECK ("quantity" > 0),
  "totalPerItem" NUMERIC(10,2) NOT NULL,
  PRIMARY KEY ("purchaseID", "foodID")
);

ALTER TABLE "PurchaseItems" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view their own purchase items"
  ON "PurchaseItems" FOR SELECT
  USING (
    auth.uid() IN (SELECT "userID" FROM "Purchase" WHERE "purchaseID" = "PurchaseItems"."purchaseID")
  );
CREATE POLICY "Buyers can insert their own purchase items"
  ON "PurchaseItems" FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT "userID" FROM "Purchase" WHERE "purchaseID" = "PurchaseItems"."purchaseID")
  );


-- ============================================================
-- 12. SOCIAL IMPACT
-- ============================================================
CREATE TABLE "SocialImpact" (
  "impactID"     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "purchaseID"   UUID         NOT NULL REFERENCES "Purchase"("purchaseID") ON DELETE CASCADE,
  "carbonOffset" NUMERIC(10,4),
  "rescuedKilos" NUMERIC(10,4),
  "peopleFed"    INT
);

ALTER TABLE "SocialImpact" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view their own social impact"
  ON "SocialImpact" FOR SELECT
  USING (
    auth.uid() IN (SELECT "userID" FROM "Purchase" WHERE "purchaseID" = "SocialImpact"."purchaseID")
  );


-- ============================================================
-- 13. RATING
-- ============================================================
CREATE TABLE "Rating" (
  "ratingID"   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "purchaseID" UUID        NOT NULL REFERENCES "Purchase"("purchaseID") ON DELETE CASCADE,
  "buyerID"    UUID        NOT NULL REFERENCES "Buyer"("userID")        ON DELETE CASCADE,
  "sellerID"   UUID        NOT NULL REFERENCES "Seller"("userID")       ON DELETE CASCADE,
  "rating"     INT         NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment"    TEXT,
  "createdAt"  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "Rating" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ratings"
  ON "Rating" FOR SELECT USING (true);
CREATE POLICY "Buyers can insert their own ratings"
  ON "Rating" FOR INSERT WITH CHECK (auth.uid() = "buyerID");
CREATE POLICY "Buyers can update their own ratings"
  ON "Rating" FOR UPDATE USING (auth.uid() = "buyerID");


-- ============================================================
-- 14. ADMIN ACTIVITY
-- ============================================================
CREATE TABLE "AdminActivity" (
  "activityID"   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userID"       UUID        NOT NULL REFERENCES "Admin"("userID") ON DELETE CASCADE,
  "actionType"   TEXT,
  "description"  TEXT,
  "timestamp"    TIMESTAMPTZ DEFAULT now(),
  "targetID"     TEXT,
  "targetEntity" TEXT
);

ALTER TABLE "AdminActivity" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all activity logs"
  ON "AdminActivity" FOR SELECT USING (auth.uid() = "userID");
CREATE POLICY "Admins can insert activity logs"
  ON "AdminActivity" FOR INSERT WITH CHECK (auth.uid() = "userID");


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_notifications_user     ON "Notifications"("userID");
CREATE INDEX idx_charitypost_user       ON "CharityPost"("userID");
CREATE INDEX idx_charityapp_user        ON "CharityApplication"("userID");
CREATE INDEX idx_food_seller            ON "Food"("userID");
CREATE INDEX idx_purchase_buyer         ON "Purchase"("userID");
CREATE INDEX idx_purchaseitems_purchase ON "PurchaseItems"("purchaseID");
CREATE INDEX idx_purchaseitems_food     ON "PurchaseItems"("foodID");
CREATE INDEX idx_rating_purchase        ON "Rating"("purchaseID");
CREATE INDEX idx_rating_buyer           ON "Rating"("buyerID");
CREATE INDEX idx_rating_seller          ON "Rating"("sellerID");
CREATE INDEX idx_socialimpact_purchase  ON "SocialImpact"("purchaseID");
CREATE INDEX idx_adminactivity_user     ON "AdminActivity"("userID");
CREATE INDEX idx_foodallergen_food      ON "FoodAllergen"("foodID");
CREATE INDEX idx_foodallergen_allergen  ON "FoodAllergen"("allergenID");
CREATE INDEX idx_userallergies_user     ON "UserAllergies"("userID");
CREATE INDEX idx_userallergies_allergen ON "UserAllergies"("allergenID");
