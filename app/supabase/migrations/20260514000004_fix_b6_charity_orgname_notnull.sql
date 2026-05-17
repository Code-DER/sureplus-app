-- Migration: Fix B-6 Option A
-- Enforce organizationName is NOT NULL in Charity table

UPDATE "Charity" SET "organizationName" = 'Unnamed Charity' WHERE "organizationName" IS NULL;
ALTER TABLE "Charity" ALTER COLUMN "organizationName" SET NOT NULL;
