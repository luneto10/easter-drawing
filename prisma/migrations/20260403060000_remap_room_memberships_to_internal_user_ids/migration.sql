-- Backfill existing data where Room/UserOnRoom were still pointing at the old
-- participant/login identifier instead of the internal User PK.
--
-- After our participant-id split:
-- - internal primary key: User.id
-- - public login identifier: User.participantId (and User.legacyParticipantId for old codes)
--
-- This migration updates:
-- - Room.creator_id
-- - UserOnRoom.userId
-- - UserOnRoom.recipient_id
-- - DesiredItem.userId

-- Room organizer (creator_id)
UPDATE "Room" AS r
SET "creator_id" = u.id
FROM "User" AS u
WHERE
    (r."creator_id" = u."participantId" OR r."creator_id" = u."legacyParticipantId")
    AND r."creator_id" <> u.id;

-- Membership owner (userId)
UPDATE "UserOnRoom" AS ur
SET "userId" = u.id
FROM "User" AS u
WHERE
    (ur."userId" = u."participantId" OR ur."userId" = u."legacyParticipantId")
    AND ur."userId" <> u.id;

-- Membership draw recipient (recipient_id)
UPDATE "UserOnRoom" AS ur
SET "recipient_id" = .uid
FROM "User" AS u
WHERE
    ur."recipient_id" IS NOT NULL
    AND (ur."recipient_id" = u."participantId" OR ur."recipient_id" = u."legacyParticipantId")
    AND ur."recipient_id" <> u.id;

-- Wish list rows (DesiredItem.userId)
UPDATE "DesiredItem" AS di
SET "userId" = u.id
FROM "User" AS u
WHERE
    (di."userId" = u."participantId" OR di."userId" = u."legacyParticipantId")
    AND di."userId" <> u.id;

