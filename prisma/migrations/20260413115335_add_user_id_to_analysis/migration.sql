-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Analysis_userId_createdAt_idx" ON "Analysis"("userId", "createdAt");
