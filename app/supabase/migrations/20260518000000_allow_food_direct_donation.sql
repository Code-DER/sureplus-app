-- Allow 'food_direct' in donationType and relax constraints for direct donations
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donationType_check";
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donationType_check" CHECK ("donationType" IN ('money', 'food', 'food_direct'));

ALTER TABLE "Donation" DROP CONSTRAINT ck_donation_type;
ALTER TABLE "Donation" ADD CONSTRAINT ck_donation_type CHECK (
    ("donationType" = 'money' AND "amount" IS NOT NULL AND "foodID" IS NULL AND "quantity" IS NULL)
    OR
    ("donationType" = 'food' AND "foodID" IS NOT NULL AND "quantity" IS NOT NULL AND "amount" IS NULL)
    OR
    ("donationType" = 'food_direct' AND "foodKg" IS NOT NULL AND "foodID" IS NULL AND "quantity" IS NULL AND "amount" IS NULL)
);
