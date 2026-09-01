/*
  Warnings:

  - Added the required column `planDayId` to the `ExerciseHistoryEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `ExerciseHistoryEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExerciseHistoryEntry" ADD COLUMN     "planDayId" TEXT NOT NULL,
ADD COLUMN     "planId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ExerciseHistoryEntry_userId_planId_planDayId_exerciseName_idx" ON "ExerciseHistoryEntry"("userId", "planId", "planDayId", "exerciseName");

-- AddForeignKey
ALTER TABLE "ExerciseHistoryEntry" ADD CONSTRAINT "ExerciseHistoryEntry_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseHistoryEntry" ADD CONSTRAINT "ExerciseHistoryEntry_planDayId_fkey" FOREIGN KEY ("planDayId") REFERENCES "WorkoutPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
