import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { applyProgression, getExerciseProgressionRule, normalizeExerciseCanonicalName } from './exerciseProgression';

type WorkoutPlanExerciseLike = {
  id: string;
  exerciseName: string;
  exerciseId?: string | null;
  setsTarget: number;
  repsTarget: number;
  weightTarget: number | null;
  order: number;
  notes?: string | null;
};

type PreviousPerformance = {
  sets: number | null;
  reps: number | null;
  weight: number | null;
  source: 'exercise_history' | 'set_results' | 'plan_target';
  workoutSessionId?: string;
  completedAt?: Date | null;
  rpe?: number | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateWeekIndex(
  plan: { createdAt: Date; currentWeekIndex: number; startDate?: Date | null; durationWeeks?: number | null },
  today = new Date(),
) {
  const anchor = plan.startDate ?? plan.createdAt;
  const daysSinceStart = Math.floor((startOfDay(today).getTime() - startOfDay(anchor).getTime()) / MS_PER_DAY);
  const weekIndex = Math.max(0, Math.floor(daysSinceStart / 7));
  const maxWeek = Math.max(0, Number(plan.durationWeeks ?? 1) - 1);
  return Math.min(weekIndex, maxWeek);
}

function buildProgressionWhere(params: {
  userId: string;
  planId?: string | null;
  planDayId?: string | null;
  exerciseName: string;
  exerciseId?: string | null;
}) {
  return {
    userId: params.userId,
    planId: params.planId ?? null,
    planDayId: params.planDayId ?? null,
    exerciseName: normalizeExerciseCanonicalName(params.exerciseName),
    exerciseId: params.exerciseId ?? null,
  } satisfies Prisma.ExerciseHistoryEntryWhereInput;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function aggregateSetResults(setResults: { setNumber: number; reps: number; weight: number }[]) {
  if (setResults.length === 0) return null;
  const sets = setResults.length;
  const reps = setResults[0].reps;
  const weight = setResults[0].weight;
  return { sets, reps, weight };
}

function getPerformanceFromHistory(history: {
  sets: number;
  reps: number;
  weight: number;
  workoutSessionId: string;
  date: Date;
  rpe: number | null;
}) {
  return {
    sets: history.sets,
    reps: history.reps,
    weight: history.weight,
    source: 'exercise_history' as const,
    workoutSessionId: history.workoutSessionId,
    completedAt: history.date,
    rpe: history.rpe,
  };
}

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async saveWorkoutSetResult(userId: string, workoutSessionId: string, input: { exerciseName: string; sets: number; reps: number; weight: number }) {
    const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId } });
    if (!session) throw new NotFoundException('Workout session not found');
    if (session.status === 'completed') return { success: true };

    const canonicalExerciseName = normalizeExerciseCanonicalName(input.exerciseName);
    const desiredSets = Math.max(0, Math.floor(Number(input.sets) || 0));
    if (desiredSets === 0) return { success: true };

    const existing = await this.prisma.workoutSetResult.findMany({
      where: { workoutSessionId, exerciseName: canonicalExerciseName, completed: true },
      orderBy: [{ setNumber: 'asc' }, { id: 'asc' }],
    });

    const missingSetNumbers = new Set<number>();
    for (let i = 1; i <= desiredSets; i += 1) missingSetNumbers.add(i);
    for (const row of existing) missingSetNumbers.delete(row.setNumber);

    const rowsToCreate = Array.from(missingSetNumbers)
      .sort((a, b) => a - b)
      .map((setNumber) => ({
        workoutSessionId,
        exerciseName: canonicalExerciseName,
        setNumber,
        reps: Number(input.reps),
        weight: Number(input.weight),
        completed: true,
      }));

    if (rowsToCreate.length > 0) {
      await this.prisma.workoutSetResult.createMany({ data: rowsToCreate });
    }

    return { success: true };
  }

  private async getPreviousPerformance(userId: string, exercise: WorkoutPlanExerciseLike, planId?: string | null, planDayId?: string | null): Promise<PreviousPerformance | null> {
    const progressionWhere = buildProgressionWhere({
      userId,
      planId,
      planDayId,
      exerciseName: exercise.exerciseName,
      exerciseId: exercise.exerciseId ?? null,
    });

    const latestHistory = await this.prisma.exerciseHistoryEntry.findFirst({
      where: progressionWhere,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    if (latestHistory) return getPerformanceFromHistory(latestHistory as any);

    const latestCompletedSession = await this.prisma.workoutSession.findFirst({
      where: {
        userId,
        status: 'completed',
        planId: planId ?? undefined,
        planDayId: planDayId ?? undefined,
        setResults: {
          some: {
            exerciseName: normalizeExerciseCanonicalName(exercise.exerciseName),
            exerciseId: exercise.exerciseId ?? null,
            completed: true,
          },
        },
      },
      orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
      include: {
        setResults: {
          where: {
            exerciseName: normalizeExerciseCanonicalName(exercise.exerciseName),
            exerciseId: exercise.exerciseId ?? undefined,
            completed: true,
          },
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    const aggregated = latestCompletedSession ? aggregateSetResults(latestCompletedSession.setResults) : null;
    if (aggregated) {
      return {
        ...aggregated,
        source: 'set_results',
        workoutSessionId: latestCompletedSession!.id,
        completedAt: latestCompletedSession!.completedAt ?? null,
      };
    }

    return {
      sets: toNullableNumber(exercise.setsTarget),
      reps: toNullableNumber(exercise.repsTarget),
      weight: toNullableNumber(exercise.weightTarget),
      source: 'plan_target',
    };
  }

  private buildSuggestedTarget(exercise: WorkoutPlanExerciseLike, previousPerformance: PreviousPerformance | null, progressiveOverloadEnabled: boolean) {
    if (!previousPerformance || previousPerformance.source === 'plan_target') {
      return {
        ...exercise,
        suggestedTarget: {
          sets: exercise.setsTarget,
          reps: exercise.repsTarget,
          weight: exercise.weightTarget,
        },
      };
    }

    const completedPerformance = {
      ...exercise,
      setsTarget: previousPerformance.sets ?? exercise.setsTarget,
      repsTarget: previousPerformance.reps ?? exercise.repsTarget,
      weightTarget: previousPerformance.weight ?? exercise.weightTarget,
    };

    const suggested = applyProgression(completedPerformance, 1, progressiveOverloadEnabled);

    return {
      ...exercise,
      suggestedTarget: {
        sets: suggested.setsTarget,
        reps: suggested.repsTarget,
        weight: suggested.weightTarget,
      },
    };
  }

  async today(userId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: { days: { include: { exercises: true } } },
    });

    if (!plan) return { status: 'no_active_plan' };

    const weekIndex = calculateWeekIndex(plan as any);
    const dow = new Date().getDay();
    const day = plan.days
      .filter((d) => Number(d.weekIndex ?? 0) === 0 || Number(d.weekIndex ?? 0) === weekIndex)
      .find((d) => Number(d.dayOfWeek) === dow);

    if (!day) return { status: 'no_schedule', planId: plan.id, currentWeekIndex: weekIndex, plan };

    const exercises = await Promise.all(
      day.exercises.map(async (exercise) => {
        const previousPerformance = await this.getPreviousPerformance(userId, exercise as WorkoutPlanExerciseLike, plan.id, day.id);
        const exerciseName = normalizeExerciseCanonicalName(exercise.exerciseName);
        const progressionRule = getExerciseProgressionRule(exerciseName);
        const suggestedBase = previousPerformance && previousPerformance.source !== 'plan_target'
          ? applyProgression(
              {
                ...exercise,
                setsTarget: previousPerformance.sets ?? exercise.setsTarget,
                repsTarget: previousPerformance.reps ?? exercise.repsTarget,
                weightTarget: previousPerformance.weight ?? exercise.weightTarget,
              },
              1,
              plan.progressiveOverloadEnabled && progressionRule.strategy !== 'generic',
            )
          : exercise;

        const suggestedTarget = previousPerformance && previousPerformance.source !== 'plan_target'
          ? {
              sets: suggestedBase.setsTarget,
              reps: suggestedBase.repsTarget,
              weight: suggestedBase.weightTarget,
            }
          : {
              sets: exercise.setsTarget,
              reps: exercise.repsTarget,
              weight: exercise.weightTarget,
            };

        return {
          id: exercise.id,
          name: exercise.exerciseName,
          previousPerformance: previousPerformance && previousPerformance.source !== 'plan_target'
            ? previousPerformance
            : null,
          suggestedTarget,
          sets: suggestedTarget.sets,
          reps: suggestedTarget.reps,
          weight: suggestedTarget.weight,
        };
      }),
    );

    return {
      status: 'scheduled',
      planId: plan.id,
      planDay: day,
      plan,
      weekIndex,
      title: day.title,
      day: `Day ${day.dayOfWeek + 1} (${DAY_LABELS[day.dayOfWeek] ?? 'Day'})`,
      exercises,
    };
  }

  async current(userId: string) {
    return this.today(userId);
  }

  async start(userId: string, workoutSessionId?: string) {
    if (!workoutSessionId) {
      const today = await this.today(userId);
      if (!today || today.status !== 'scheduled' || !today.planId || !today.planDay?.id) {
        throw new NotFoundException('No workout session available to start');
      }

      const existingSession = await this.prisma.workoutSession.findFirst({
        where: {
          userId,
          planId: today.planId,
          planDayId: today.planDay.id,
          status: { in: ['in_progress'] },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });

      if (existingSession) {
        return this.prisma.workoutSession.update({
          where: { id: existingSession.id },
          data: { status: 'in_progress', actualDate: existingSession.actualDate ?? new Date() },
        });
      }

      return this.prisma.workoutSession.create({
        data: {
          userId,
          planId: today.planId,
          planDayId: today.planDay.id,
          scheduledDate: new Date(),
          weekIndex: today.weekIndex,
          status: 'in_progress',
          actualDate: new Date(),
        },
      });
    }

    const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId } });
    if (!session) throw new NotFoundException();
    return this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: 'in_progress', actualDate: new Date() } });
  }

  async complete(userId: string, workoutSessionId: string) {
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: workoutSessionId, userId },
      include: { setResults: true },
    });
    if (!session) throw new NotFoundException();
    if (session.status === 'completed') return session;

    const completedAt = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.workoutSession.update({ where: { id: workoutSessionId }, data: { status: 'completed', completedAt, actualDate: session.actualDate || completedAt } });

      const existingHistory = await tx.exerciseHistoryEntry.findMany({ where: { workoutSessionId } });
      if (existingHistory.length > 0) return;

      const setResultsByExercise = new Map<string, typeof session.setResults>();
      for (const setResult of session.setResults) {
        const key = `${normalizeExerciseCanonicalName(setResult.exerciseName)}::${setResult.exerciseId ?? ''}`;
        const list = setResultsByExercise.get(key) ?? [];
        list.push(setResult);
        setResultsByExercise.set(key, list);
      }

      for (const [key, setResults] of setResultsByExercise.entries()) {
        const [exerciseName, exerciseId] = key.split('::');
        const sets = setResults.length;
        const reps = setResults[0]?.reps ?? 0;
        const weight = setResults[0]?.weight ?? 0;
        const volume = setResults.reduce((sum, row) => sum + row.reps * row.weight, 0);
        const avgRpe = null;

        await tx.exerciseHistoryEntry.create({
          data: {
            userId,
            planId: session.planId,
            planDayId: session.planDayId,
            exerciseName,
            exerciseId: exerciseId || null,
            workoutSessionId,
            date: completedAt,
            sets,
            reps,
            weight,
            volume,
            rpe: avgRpe,
          },
        });
      }
    });

    return { success: true };
  }
}
