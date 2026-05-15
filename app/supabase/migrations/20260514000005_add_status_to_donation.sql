-- Migration: Add status to Donation table for L-1
ALTER TABLE "Donation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'completed' CHECK ("status" IN ('completed', 'refunded'));
