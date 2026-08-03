-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weeklyScore" INTEGER NOT NULL DEFAULT 0,
    "totalPuntpoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixtures" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "resultTime" TIMESTAMP(3),
    "result" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixtures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odds" (
    "id" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "odds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "predictedOutcome" TEXT NOT NULL,
    "stake" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_weeklyScore_idx" ON "users"("weeklyScore");

-- CreateIndex
CREATE INDEX "users_totalPuntpoints_idx" ON "users"("totalPuntpoints");

-- CreateIndex
CREATE INDEX "fixtures_startTime_idx" ON "fixtures"("startTime");

-- CreateIndex
CREATE INDEX "fixtures_status_idx" ON "fixtures"("status");

-- CreateIndex
CREATE INDEX "fixtures_category_idx" ON "fixtures"("category");

-- CreateIndex
CREATE INDEX "odds_fixtureId_idx" ON "odds"("fixtureId");

-- CreateIndex
CREATE INDEX "odds_platform_idx" ON "odds"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "predictions_userId_fixtureId_key" ON "predictions"("userId", "fixtureId");

-- CreateIndex
CREATE INDEX "predictions_userId_idx" ON "predictions"("userId");

-- CreateIndex
CREATE INDEX "predictions_fixtureId_idx" ON "predictions"("fixtureId");

-- CreateIndex
CREATE INDEX "predictions_isCorrect_idx" ON "predictions"("isCorrect");

-- AddForeignKey
ALTER TABLE "odds" ADD CONSTRAINT "odds_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "fixtures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "fixtures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
