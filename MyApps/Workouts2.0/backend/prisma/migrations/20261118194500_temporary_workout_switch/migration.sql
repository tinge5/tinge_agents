ALTER TABLE "WorkoutSession"
ADD COLUMN "isTemporary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "temporaryDate" TEXT,
ADD COLUMN "creditedDayOfWeek" INTEGER,
ADD COLUMN "workoutSnapshot" JSONB;

CREATE UNIQUE INDEX "WorkoutSession_userId_planId_temporaryDate_key"
ON "WorkoutSession"("userId", "planId", "temporaryDate");

ALTER TABLE "WorkoutHistoryEntry"
ADD COLUMN "isTemporary" BOOLEAN NOT NULL DEFAULT false;
