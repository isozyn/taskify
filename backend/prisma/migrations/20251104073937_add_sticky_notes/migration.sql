-- CreateTable
CREATE TABLE "StickyNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'bg-yellow-50 border-yellow-200',
    "position" JSONB NOT NULL,
    "isMinimized" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StickyNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StickyNote_userId_idx" ON "StickyNote"("userId");

-- CreateIndex
CREATE INDEX "StickyNote_projectId_idx" ON "StickyNote"("projectId");

-- AddForeignKey
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
