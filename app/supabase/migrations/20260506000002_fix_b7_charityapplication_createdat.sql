-- Fix B-7: Add createdAt column to CharityApplication table
ALTER TABLE "CharityApplication"
  ADD COLUMN "createdAt" TIMESTAMPTZ DEFAULT now();
