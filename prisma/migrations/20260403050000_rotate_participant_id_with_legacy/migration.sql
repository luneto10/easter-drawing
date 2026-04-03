-- Rotate public participant IDs and keep the previous values for backward-compatible login.

-- Prisma already runs migrations in a transaction; don't nest BEGIN/COMMIT here.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Store current participantId values as legacy.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "legacyParticipantId" TEXT;

UPDATE "User"
SET "legacyParticipantId" = "participantId"
WHERE "legacyParticipantId" IS NULL;

-- 2) Generate a new participantId for everyone.
-- Uses gen_random_uuid() from pgcrypto; participantId keeps UUID format.
UPDATE "User"
SET "participantId" = gen_random_uuid()::text;

-- 3) Helpful index for legacy lookups.
CREATE INDEX IF NOT EXISTS "User_legacyParticipantId_idx"
ON "User"("legacyParticipantId");

