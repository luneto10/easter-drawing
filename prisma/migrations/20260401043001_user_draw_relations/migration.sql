/*
  Warnings:

  - A unique constraint covering the columns `[recipient_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recipient_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_recipient_id_key" ON "User"("recipient_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
