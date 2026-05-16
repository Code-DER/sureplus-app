-- ============================================================
-- SurePlus - Seed Data
-- ============================================================

-- 1. Create Users
-- All passwords are 'password123' (hashed using bcrypt)
-- Use fixed hexadecimal UUIDs for referential integrity
INSERT INTO "User" ("userID", "firstName", "lastName", "emailAddress", "password", "role", "phoneNumber", "street", "barangay", "city")
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin', 'User', 'admin@sureplus.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'admin', '09171234567', 'Main St', 'Brgy 1', 'Makati'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Juan', 'Dela Cruz', 'buyer@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'buyer', '09177654321', 'Rizal St', 'Brgy 2', 'Quezon City'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Maria', 'Santos', 'maria@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'buyer', '09181112222', 'Luna St', 'Brgy 3', 'Manila'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Helping', 'Hands', 'charity@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'charity', '09193334444', 'Hope Ave', 'Brgy 4', 'Pasig'),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Feed', 'People', 'feed@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'charity', '09205556666', 'Kindness St', 'Brgy 5', 'Taguig'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Fresh', 'Market', 'seller@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'seller', '09217778888', 'Market Rd', 'Brgy 6', 'Mandaluyong'),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'Bakers', 'Delight', 'baker@test.com', '$2b$12$EP4viZXIShDktWfwUxoIbeiHpYhNuapefJjeY5Hag44DK03kh9YzC', 'seller', '09229990000', 'Flour St', 'Brgy 7', 'San Juan');

-- 2. Create User Subtypes
INSERT INTO "Admin" ("userID", "employeeID", "adminType")
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'EMP-001', 'superadmin');

INSERT INTO "Buyer" ("userID", "points")
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 150),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 50);

INSERT INTO "Seller" ("userID", "sellerType", "isVerified", "companyName")
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Grocery', true, 'Fresh Market Manila'),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'Bakery', true, 'Bakers Delight Co.');

INSERT INTO "Charity" ("userID", "organizationName", "isPartner")
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Helping Hands Foundation', true),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Feed the Hungry Philippines', false);

-- 3. Create Allergens
INSERT INTO "Allergen" ("allergenID", "name")
VALUES 
  ('11111111-0000-0000-0000-000000000001', 'Peanuts'),
  ('11111111-0000-0000-0000-000000000002', 'Dairy'),
  ('11111111-0000-0000-0000-000000000003', 'Gluten'),
  ('11111111-0000-0000-0000-000000000004', 'Soy'),
  ('11111111-0000-0000-0000-000000000005', 'Shellfish');

-- 4. Charity Applications
INSERT INTO "CharityApplication" ("applicationID", "userID", "purpose", "govID", "status", "secRegistration")
VALUES 
  ('77777777-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Community feeding program', 'SEC-12345', 'approved', 'SEC-REG-001'),
  ('77777777-2222-2222-2222-222222222222', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Disaster relief efforts', 'SEC-67890', 'pending', 'SEC-REG-002');

-- 5. Create Food Items
INSERT INTO "Food" ("foodID", "userID", "foodName", "description", "price", "stockQuantity", "expirationDate", "weightKg", "isEdible")
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Slightly Bruised Apples', 'Still perfectly good for pies!', 50.00, 20, '2026-06-01', 0.2, true),
  ('efffffff-ffff-ffff-ffff-ffffffffffff', 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'Day-old Baguettes', 'Great for French toast', 20.00, 15, '2026-05-20', 0.4, true),
  ('e1e1e1e1-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Canned Tuna (Dented)', 'Small dents on the can, safe to consume.', 35.00, 10, '2027-01-01', 0.18, true);

-- 6. Food Allergens
INSERT INTO "FoodAllergen" ("foodID", "allergenID")
VALUES 
  ('efffffff-ffff-ffff-ffff-ffffffffffff', '11111111-0000-0000-0000-000000000003'); -- Baguette contains Gluten

-- 7. Create Charity Posts
INSERT INTO "CharityPost" ("charityID", "userID", "title", "description", "donationMode", "amountNeeded", "foodGoalKg", "status", "imageUrl")
VALUES 
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Feed the Community', 'Raising funds to buy rice for the local shelter.', 'money', 10000.00, NULL, 'active', 'https://example.com/feed.jpg'),
  ('f1f1f1f1-1111-1111-1111-111111111111', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Fruit Drive', 'Collecting apples and fruits for children.', 'food', NULL, 50.0, 'active', 'https://example.com/fruit.jpg');

-- 8. Create Purchases
INSERT INTO "Purchase" ("purchaseID", "userID", "paymentMethod", "totalPrice", "status")
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'GCash', 150.00, 'completed'),
  ('33333333-4444-4444-4444-444444444444', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Maya', 70.00, 'completed');

INSERT INTO "PurchaseItems" ("purchaseID", "foodID", "quantity", "price", "totalPerItem")
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, 50.00, 150.00),
  ('33333333-4444-4444-4444-444444444444', 'e1e1e1e1-1111-1111-1111-111111111111', 2, 35.00, 70.00);

-- 9. Create Donations
INSERT INTO "Donation" ("donationID", "postID", "userID", "donationType", "amount", "foodID", "quantity", "foodKg", "status")
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'money', 500.00, NULL, NULL, NULL, 'completed'),
  ('55555555-6666-6666-6666-666666666666', 'f1f1f1f1-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'food', NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 1.0, 'completed');

-- 10. Create Social Impact
INSERT INTO "SocialImpact" ("impactID", "purchaseID", "donationID", "carbonOffset", "rescuedKilos", "peopleFed")
VALUES 
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', NULL, 0.5, 0.6, 2),
  ('44444444-5555-5555-5555-555555555555', NULL, '55555555-6666-6666-6666-666666666666', 0.8, 1.0, 3);

-- 11. Create Ratings
INSERT INTO "Rating" ("ratingID", "purchaseID", "donationID", "buyerID", "sellerID", "rating", "comment")
VALUES 
  ('99999999-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 5, 'Great apples, fast delivery!'),
  ('99999999-2222-2222-2222-222222222222', NULL, '55555555-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, 'Thank you for the generous food donation!');

-- 12. Notifications
INSERT INTO "Notifications" ("userID", "title", "message", "type")
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Order Confirmed', 'Your order for apples has been confirmed.', 'order'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'New Donation', 'You received a new money donation for "Feed the Community".', 'donation');

-- 13. Admin Activity
INSERT INTO "AdminActivity" ("userID", "actionType", "description", "targetID", "targetEntity")
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'approve_charity', 'Approved Helping Hands Foundation application', '77777777-1111-1111-1111-111111111111', 'CharityApplication');
