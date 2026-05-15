-- ============================================================
-- SurePlus - Seed Data
-- ============================================================

-- 1. Create Users
-- All passwords are 'password123' (hashed using bcrypt)
-- Use fixed hexadecimal UUIDs for referential integrity
INSERT INTO "User" ("userID", "firstName", "lastName", "emailAddress", "password", "role")
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin', 'User', 'admin@sureplus.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'admin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Juan', 'Dela Cruz', 'buyer@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'buyer'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Helping', 'Hands', 'charity@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'charity'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Fresh', 'Market', 'seller@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'seller');

-- 2. Create User Subtypes
INSERT INTO "Admin" ("userID", "employeeID", "adminType")
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EMP-001', 'superadmin');

INSERT INTO "Buyer" ("userID", "points")
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 100);

INSERT INTO "Seller" ("userID", "sellerType", "isVerified", "companyName")
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Retail', true, 'Fresh Market Manila');

INSERT INTO "Charity" ("userID", "organizationName")
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Helping Hands Foundation');

-- 3. Create Allergens
INSERT INTO "Allergen" ("name")
VALUES ('Peanuts'), ('Dairy'), ('Gluten'), ('Soy'), ('Shellfish');

-- 4. Create Food Items
INSERT INTO "Food" ("foodID", "userID", "foodName", "description", "price", "stockQuantity", "expirationDate")
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Slightly Bruised Apples', 'Still perfectly good for pies!', 50.00, 20, '2026-06-01'),
  ('efffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Day-old Baguettes', 'Great for French toast', 20.00, 15, '2026-05-20');

-- 5. Create Charity Posts
INSERT INTO "CharityPost" ("charityID", "userID", "title", "description", "donationMode", "amountNeeded", "foodGoalKg", "status")
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Feed the Community', 'Raising funds to buy rice for the local shelter.', 'money', 10000.00, NULL, 'active'),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fruit Drive', 'Collecting apples and fruits for children.', 'food', NULL, 50.0, 'active');

-- 6. Create Purchases
INSERT INTO "Purchase" ("purchaseID", "userID", "paymentMethod", "totalPrice", "status")
VALUES ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'GCash', 150.00, 'completed');

INSERT INTO "PurchaseItems" ("purchaseID", "foodID", "quantity", "price", "totalPerItem")
VALUES ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, 50.00, 150.00);

-- 7. Create Social Impact
INSERT INTO "SocialImpact" ("impactID", "purchaseID", "carbonOffset", "rescuedKilos", "peopleFed")
VALUES ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 0.5, 1.5, 2);

-- 8. Create Donations
INSERT INTO "Donation" ("donationID", "postID", "userID", "donationType", "amount")
VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'money', 500.00);
