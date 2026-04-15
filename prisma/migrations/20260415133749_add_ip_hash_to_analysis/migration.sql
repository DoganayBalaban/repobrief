-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "ipHash" TEXT;

-- CreateIndex
CREATE INDEX "Analysis_ipHash_createdAt_idx" ON "Analysis"("ipHash", "createdAt");
