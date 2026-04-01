-- Add optional email (not present in older migration files; safe if already applied manually).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "admin_key" TEXT NOT NULL,
    "creator_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnRoom" (
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "recipient_id" TEXT,

    CONSTRAINT "UserOnRoom_pkey" PRIMARY KEY ("userId","roomId")
);

-- Default room for existing users (preserves prior single-room assignments).
INSERT INTO "Room" ("id", "title", "admin_key", "creator_id", "createdAt", "updatedAt")
VALUES (
    '00000000-0000-4000-8000-000000000001',
    'Default room',
    replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "UserOnRoom" ("userId", "roomId", "recipient_id")
SELECT "id", '00000000-0000-4000-8000-000000000001', "recipient_id"
FROM "User";

-- Drop old self-relation on User
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_recipient_id_fkey";

DROP INDEX IF EXISTS "User_recipient_id_key";

ALTER TABLE "User" DROP COLUMN IF EXISTS "recipient_id";

-- CreateIndex
CREATE UNIQUE INDEX "Room_admin_key_key" ON "Room"("admin_key");

CREATE UNIQUE INDEX "UserOnRoom_roomId_recipient_id_key" ON "UserOnRoom"("roomId", "recipient_id");

CREATE INDEX "UserOnRoom_roomId_idx" ON "UserOnRoom"("roomId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserOnRoom" ADD CONSTRAINT "UserOnRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserOnRoom" ADD CONSTRAINT "UserOnRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserOnRoom" ADD CONSTRAINT "UserOnRoom_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
