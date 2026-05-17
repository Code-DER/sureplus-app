-- Fix B-2: Change default donationMode to 'food'
ALTER TABLE "CharityPost" ALTER COLUMN "donationMode" SET DEFAULT 'food';
