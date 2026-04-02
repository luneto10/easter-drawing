-- Backfill organizer: use an existing member when creator_id is missing.
UPDATE "Room" AS r
SET creator_id = sub."userId"
FROM (
    SELECT DISTINCT ON (ur."roomId") ur."roomId", ur."userId"
    FROM "UserOnRoom" ur
    ORDER BY ur."roomId", ur."userId" ASC
) AS sub
WHERE r.id = sub."roomId"
  AND r.creator_id IS NULL;

-- Drop rooms that have no members (cannot have an admin).
DELETE FROM "Room" AS r
WHERE NOT EXISTS (
    SELECT 1 FROM "UserOnRoom" ur WHERE ur."roomId" = r.id
);

-- Any room still without creator_id cannot be fixed here.
DELETE FROM "Room" WHERE creator_id IS NULL;

ALTER TABLE "Room" DROP CONSTRAINT "Room_creator_id_fkey";

ALTER TABLE "Room" ALTER COLUMN "creator_id" SET NOT NULL;

ALTER TABLE "Room" ADD CONSTRAINT "Room_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
