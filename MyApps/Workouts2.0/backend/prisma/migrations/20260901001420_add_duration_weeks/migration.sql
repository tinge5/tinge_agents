-- AlterTable
ALTER TABLE "WorkoutPlan" ADD COLUMN     "durationWeeks" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "startDate" TIMESTAMP(3);
