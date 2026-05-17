-- Add secRegistration to CharityApplication
ALTER TABLE "CharityApplication" ADD COLUMN "secRegistration" TEXT;

-- Add isPartner to Charity
ALTER TABLE "Charity" ADD COLUMN "isPartner" BOOLEAN DEFAULT FALSE;
