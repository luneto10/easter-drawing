-- Split internal user PK from the public participant/login identifier.
-- After this migration:
-- - `User.id` becomes a new internal UUID (used for relations/admin)
-- - `User.participantId` stores the previous `User.id` values (so old login links still work)

BEGIN;

-- 1) Add participantId and copy existing ids into it.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "participantId" TEXT;

UPDATE "User"
SET "participantId" = id
WHERE "participantId" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "participantId" SET NOT NULL;

-- 2) Ensure uniqueness for participantId.
CREATE UNIQUE INDEX IF NOT EXISTS "User_participantId_key" ON "User"("participantId");

-- 3) Re-key internal primary key values.
-- ON UPDATE CASCADE on foreign keys should update Room.creator_id and memberships.
UPDATE "User"
SET id = gen_random_uuid()::text;

COMMIT;

