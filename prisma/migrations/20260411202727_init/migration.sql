-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_owner_repo_idx" ON "Analysis"("owner", "repo");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_owner_repo_commitSha_key" ON "Analysis"("owner", "repo", "commitSha");
