-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('CUSTOM', 'AUTOMATED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "workflowType" "WorkflowType" NOT NULL DEFAULT 'CUSTOM';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "columnId" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CustomColumn" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'slate',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "CustomColumn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_columnId_idx" ON "Task"("columnId");

-- CreateIndex
CREATE INDEX "CustomColumn_projectId_idx" ON "CustomColumn"("projectId");

-- AddForeignKey
ALTER TABLE "CustomColumn" ADD CONSTRAINT "CustomColumn_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;