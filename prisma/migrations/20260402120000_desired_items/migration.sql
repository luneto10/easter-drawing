-- CreateTable
CREATE TABLE "DesiredItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "item_text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesiredItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesiredItem_roomId_idx" ON "DesiredItem"("roomId");

-- AddForeignKey
ALTER TABLE "DesiredItem" ADD CONSTRAINT "DesiredItem_userId_roomId_fkey" FOREIGN KEY ("userId", "roomId") REFERENCES "UserOnRoom"("userId", "roomId") ON DELETE CASCADE ON UPDATE CASCADE;
