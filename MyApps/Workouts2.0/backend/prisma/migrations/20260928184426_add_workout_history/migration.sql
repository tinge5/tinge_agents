-- CreateTable
CREATE TABLE "WorkoutHistoryEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "originalPlanId" TEXT,
    "planName" TEXT NOT NULL,
    "workoutName" TEXT NOT NULL,
    "dayName" TEXT NOT NULL,
    "weekIndex" INTEGER,
    "dayOfWeek" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutHistorySetResult" (
    "id" TEXT NOT NULL,
    "workoutHistoryId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "exerciseId" TEXT,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkoutHistorySetResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutHistoryEntry_workoutSessionId_key" ON "WorkoutHistoryEntry"("workoutSessionId");

-- CreateIndex
CREATE INDEX "WorkoutHistoryEntry_userId_completedAt_idx" ON "WorkoutHistoryEntry"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "WorkoutHistoryEntry_userId_originalPlanId_idx" ON "WorkoutHistoryEntry"("userId", "originalPlanId");

-- CreateIndex
CREATE INDEX "WorkoutHistorySetResult_workoutHistoryId_idx" ON "WorkoutHistorySetResult"("workoutHistoryId");

-- AddForeignKey
ALTER TABLE "WorkoutHistoryEntry" ADD CONSTRAINT "WorkoutHistoryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutHistoryEntry" ADD CONSTRAINT "WorkoutHistoryEntry_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutHistorySetResult" ADD CONSTRAINT "WorkoutHistorySetResult_workoutHistoryId_fkey" FOREIGN KEY ("workoutHistoryId") REFERENCES "WorkoutHistoryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
