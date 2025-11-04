/*
  Warnings:

  - The values [ADMIN] on the enum `MemberRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('PROJECT', 'DIRECT', 'GROUP');

-- AlterEnum
BEGIN;
CREATE TYPE "MemberRole_new" AS ENUM ('OWNER', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER');
ALTER TABLE "ProjectMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "ProjectMember" ALTER COLUMN "role" TYPE "MemberRole_new" USING ("role"::text::"MemberRole_new");
ALTER TYPE "MemberRole" RENAME TO "MemberRole_old";
ALTER TYPE "MemberRole_new" RENAME TO "MemberRole";
DROP TYPE "MemberRole_old";
ALTER TABLE "ProjectMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" "ConversationType" NOT NULL DEFAULT 'PROJECT',
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_projectId_idx" ON "Conversation"("projectId");

-- CreateIndex
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");

-- CreateIndex
CREATE INDEX "ConversationMember_conversationId_idx" ON "ConversationMember"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMember_userId_conversationId_key" ON "ConversationMember"("userId", "conversationId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
