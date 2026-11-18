import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { PlanCompletionService } from '../plans/plan-completion.service';
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
  setResults?: Array<{
    setNumber: number;
    reps: number | null;
    weight: number | null;
  }>;
};

type TemporaryWorkoutExercise = {
  id: string;
  name: string;
  exerciseId: string | null;
  sets: number;
  reps: number;
  weight: number | null;
  setsTarget: number;
  repsTarget: number;
  suggestedTarget: {
    sets: number;
    reps: number;
    weight: number | null;
  };
};

type TemporaryWorkoutSnapshot = {
  title: string;
  exercises: TemporaryWorkoutExercise[];
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

function getCalendarDateParts(date: Date, deviceTimeZone?: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: deviceTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function calendarDateToUtcMs(parts: { year: number; month: number; day: number }) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function getCalendarDateKey(date: Date, deviceTimeZone?: string) {
  const { year, month, day } = getCalendarDateParts(date, deviceTimeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function readTemporaryWorkoutSnapshot(value: Prisma.JsonValue | null): TemporaryWorkoutSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InternalServerErrorException('Temporary workout snapshot is missing or invalid');
  }

  const title = value.title;
  const exercises = value.exercises;
  if (typeof title !== 'string' || !Array.isArray(exercises)) {
    throw new InternalServerErrorException('Temporary workout snapshot is missing or invalid');
  }

  return {
    title,
    exercises: exercises.map((exercise) => {
      if (!exercise || typeof exercise !== 'object' || Array.isArray(exercise)) {
        throw new InternalServerErrorException('Temporary workout exercise is invalid');
      }

      const { id, name, exerciseId, sets, reps, weight } = exercise;
      if (
        typeof id !== 'string' ||
        typeof name !== 'string' ||
        (exerciseId !== null && typeof exerciseId !== 'string') ||
        typeof sets !== 'number' ||
        typeof reps !== 'number' ||
        (weight !== null && typeof weight !== 'number')
      ) {
        throw new InternalServerErrorException('Temporary workout exercise is invalid');
      }
      const normalizedExerciseId = typeof exerciseId === 'string' ? exerciseId : null;
      const normalizedWeight = typeof weight === 'number' ? weight : null;

      return {
        id,
        name,
        exerciseId: normalizedExerciseId,
        sets,
        reps,
        weight: normalizedWeight,
        setsTarget: sets,
        repsTarget: reps,
        suggestedTarget: { sets, reps, weight: normalizedWeight },
      };
    }),
  };
}

function calculateWeekIndex(
  plan: { createdAt: Date; currentWeekIndex: number; startDate?: Date | null; durationWeeks?: number | null; timeZone?: string },
  today = new Date(),
  deviceTimeZone?: string,
) {
  const anchor = plan.startDate ?? plan.createdAt;
  const timeZone = plan.timeZone ?? deviceTimeZone;
  const currentDateParts = getCalendarDateParts(today, timeZone);
  const anchorDateParts = getCalendarDateParts(anchor, timeZone);
  const daysSinceStart = Math.floor((calendarDateToUtcMs(currentDateParts) - calendarDateToUtcMs(anchorDateParts)) / MS_PER_DAY);
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
  const where: Prisma.ExerciseHistoryEntryWhereInput = {
    userId: params.userId,
    exerciseName: normalizeExerciseCanonicalName(params.exerciseName),
    exerciseId: params.exerciseId ?? null,
  };

  if (params.planId !== undefined) where.planId = params.planId;
  if (params.planDayId !== undefined) where.planDayId = params.planDayId;

  return where;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeWorkoutSetValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function aggregateSetResults(setResults: { setNumber: number; reps: number; weight: number }[]) {
  if (setResults.length === 0) return null;
  const hasWeights = setResults.some(set => set.weight != null);
  const bestSet = hasWeights
    ? setResults.reduce((best, current) =>
        (current.weight ?? 0) > (best.weight ?? 0) ? current : best
      )
    : setResults.reduce((best, current) =>
        current.reps > best.reps ? current : best
      );
  const sets = setResults.length;
  const reps =  bestSet.reps;
  const weight = bestSet.weight ?? null;
  const prevReps = setResults[0].reps;
  const prevWeight = setResults[0].weight;
  return { sets, reps, weight, prevWeight, prevReps, setResults };
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

function getScheduledWorkoutCount(plan: {
  days: { weekIndex: number; dayOfWeek: number }[];
  durationWeeks: number;
}) {
  const durationWeeks = Math.max(1, Number(plan.durationWeeks ?? 1));
  return plan.days.filter((day) => {
    const weekIndex = Number(day.weekIndex ?? 0);
    return weekIndex >= 0 && weekIndex < durationWeeks;
  }).length;
}

function getDeviceLocalDayInfo(deviceTimeZone?: string) {
  const utcNow = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: deviceTimeZone,
    weekday: 'long',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(utcNow).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  const weekday = parts.weekday;
  const dayIndex = weekday ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday) : utcNow.getDay();
  const deviceLocalTime = formatter.format(utcNow);
  return { utcNow, deviceLocalTime, dayIndex };
}

@Injectable()
export class WorkoutsService {
  constructor(
    private prisma: PrismaService,
    private planCompletionService: PlanCompletionService,
  ) {}

 async saveWorkoutSetResult(
  userId: string,
  workoutSessionId: string,
  input: {
    exerciseName: string;
    exerciseId?: string | null;
    setNumber: number;
    reps?: number | null;
    weight?: number | null;
    completed?: boolean;
  },
) {
  const session = await this.prisma.workoutSession.findFirst({
    where: { id: workoutSessionId, userId },
  });

  if (!session) {
    throw new NotFoundException('Workout session not found');
  }

  if (session.status === 'completed') {
    return { success: true };
  }

  const canonicalExerciseName = normalizeExerciseCanonicalName(
    input.exerciseName,
  );

  const setNumber = Math.max(1, Math.floor(Number(input.setNumber) || 1));
  const normalizedReps = input.reps == null ? null : sanitizeWorkoutSetValue(input.reps, 0);
  const normalizedWeight = input.weight == null ? null : sanitizeWorkoutSetValue(input.weight, 0);
  const completed = input.completed ?? true;

  if (normalizedReps == null && normalizedWeight == null && completed) {
    return { success: true };
  }

  const reps = normalizedReps ?? 0;
  const weight = normalizedWeight ?? 0;

  const existing = await this.prisma.workoutSetResult.findFirst({
    where: {
      workoutSessionId,
      exerciseName: canonicalExerciseName,
      setNumber,
    },
  });

  if (existing) {
    await this.prisma.workoutSetResult.update({
      where: { id: existing.id },
      data: {
        reps,
        weight,
        exerciseId: input.exerciseId ?? null,
        completed,
      },
    });
  } else {
    await this.prisma.workoutSetResult.create({
      data: {
        workoutSessionId,
        exerciseName: canonicalExerciseName,
        exerciseId: input.exerciseId ?? null,
        setNumber,
        reps,
        weight,
        completed,
      },
    });
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
        isTemporary: false,
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

  async today(userId: string, deviceTimeZone?: string) {
    await this.planCompletionService.completeExpiredPlansForUser(userId, deviceTimeZone);
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: { days: { include: { exercises: true } } },
    });

    if (!plan) return { status: 'no_active_plan' };

    const weekIndex = calculateWeekIndex(plan as any, new Date(), deviceTimeZone);
    const timeZone = plan.timeZone ?? deviceTimeZone;
    const { utcNow, deviceLocalTime, dayIndex } = getDeviceLocalDayInfo(timeZone);
    // Temporary verification log for Render logs
    // eslint-disable-next-line no-console
    console.log('[workouts.today timezone check]', {
      deviceTimeZone: deviceTimeZone ?? null,
      currentUtcTime: utcNow.toISOString(),
        displayedWeek: weekIndex + 1,
      deviceLocalTime,
      calculatedDayOfWeek: dayIndex,
    });
    const day = plan.days
      .filter((d) => Number(d.weekIndex ?? 0) === 0 || Number(d.weekIndex ?? 0) === weekIndex)
      .find((d) => Number(d.dayOfWeek) === dayIndex);

    const temporaryDate = getCalendarDateKey(utcNow, timeZone);
    const temporarySession = await this.prisma.workoutSession.findFirst({
      where: {
        userId,
        planId: plan.id,
        isTemporary: true,
        temporaryDate,
      },
      include: { setResults: true },
    });

    if (temporarySession) {
      const snapshot = readTemporaryWorkoutSnapshot(temporarySession.workoutSnapshot);
      const selectedDay = plan.days.find((planDay) => planDay.id === temporarySession.planDayId);
      return {
        status: temporarySession.status,
        isTemporary: true,
        workoutSessionId: temporarySession.id,
        planId: plan.id,
        planDay: selectedDay ? { ...selectedDay, dayOfWeek: day?.dayOfWeek ?? dayIndex } : undefined,
        plan,
        weekIndex: temporarySession.weekIndex,
        title: snapshot.title,
        day: day
          ? `Day ${day.dayOfWeek + 1} (${DAY_LABELS[day.dayOfWeek] ?? 'Day'})`
          : `Today (${DAY_LABELS[dayIndex] ?? 'Day'})`,
        exercises: snapshot.exercises,
        setResults: temporarySession.setResults,
      };
    }

    if (!day) return { status: 'no_schedule', planId: plan.id, currentWeekIndex: weekIndex, plan };

    const latestRelevantSession = await this.prisma.workoutSession.findFirst({
      where: {
        userId,
        planId: plan.id,
        planDayId: day.id,
        weekIndex,
        isTemporary: false,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        status: true,
        setResults: {
          select: {
            id: true,
            exerciseName: true,
            exerciseId: true,
            setNumber: true,
            reps: true,
            weight: true,
            completed: true,
          },
        },
      },
    });

    const hasCompletedSessionBeforeToday = await this.prisma.workoutSession.findFirst({
      where: {
        userId,
        planId: plan.id,
        planDayId: day.id,
        isTemporary: false,
        status: 'completed',
        completedAt: {
          not: null,
          lte: new Date(),
        },
      },
      orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        completedAt: true,
      },
    });

    const planUpdatedAfterLastCompletion =
      !!hasCompletedSessionBeforeToday &&
      new Date(plan.updatedAt).getTime() > new Date(hasCompletedSessionBeforeToday.completedAt as Date).getTime();

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
          exerciseId: exercise.exerciseId,
          name: exercise.exerciseName,
          previousPerformance: previousPerformance && previousPerformance.source !== 'plan_target'
            ? previousPerformance
            : null,
          suggestedTarget,
          sets: suggestedTarget.sets,
          reps: suggestedTarget.reps,
          weight: suggestedTarget.weight,
          setsTarget: exercise.setsTarget,
          repsTarget: exercise.repsTarget,
        };
      }),
    );

    if (latestRelevantSession?.status === 'completed' && !planUpdatedAfterLastCompletion) {
      return {
        status: 'completed',
        workoutSessionId: latestRelevantSession.id,
        planId: plan.id,
        planDay: day,
        plan,
        weekIndex,
        title: day.title,
        day: `Day ${day.dayOfWeek + 1} (${DAY_LABELS[day.dayOfWeek] ?? 'Day'})`,
        exercises,
        setResults: latestRelevantSession.setResults,
      };
    }

    if (latestRelevantSession?.status === 'in_progress') {
      return {
        status: 'in_progress',
        workoutSessionId: latestRelevantSession.id,
        planId: plan.id,
        planDay: day,
        plan,
        weekIndex,
        title: day.title,
        day: `Day ${day.dayOfWeek + 1} (${DAY_LABELS[day.dayOfWeek] ?? 'Day'})`,
        exercises,
        setResults: latestRelevantSession.setResults,
      };
    }

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

  async switchTemporaryWorkout(userId: string, planDayId: string, deviceTimeZone?: string) {
    await this.planCompletionService.completeExpiredPlansForUser(userId, deviceTimeZone);
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { userId, isActive: true, status: 'active' },
      include: {
        days: {
          include: { exercises: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!plan) throw new NotFoundException('No active plan');

    const selectedDay = plan.days.find((planDay) => planDay.id === planDayId);
    if (!selectedDay) throw new NotFoundException('Workout day not found in the active plan');

    const now = new Date();
    const timeZone = plan.timeZone ?? deviceTimeZone;
    const { dayIndex } = getDeviceLocalDayInfo(timeZone);
    const weekIndex = calculateWeekIndex(plan, now, timeZone);
    const scheduledDay = plan.days
      .filter((planDay) => Number(planDay.weekIndex ?? 0) === 0 || Number(planDay.weekIndex ?? 0) === weekIndex)
      .find((planDay) => Number(planDay.dayOfWeek) === dayIndex);
    const temporaryDate = getCalendarDateKey(now, timeZone);

    const existingTemporarySession = await this.prisma.workoutSession.findFirst({
      where: { userId, planId: plan.id, isTemporary: true, temporaryDate },
    });
    if (existingTemporarySession) {
      return this.today(userId, timeZone);
    }

    if (scheduledDay) {
      const completedScheduledSession = await this.prisma.workoutSession.findFirst({
        where: {
          userId,
          planId: plan.id,
          planDayId: scheduledDay.id,
          weekIndex,
          isTemporary: false,
          status: 'completed',
        },
        select: { id: true },
      });
      if (completedScheduledSession) {
        throw new BadRequestException("Today's scheduled workout is already completed");
      }
    }

    const workoutSnapshot = {
      title: selectedDay.title,
      exercises: selectedDay.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.exerciseName,
        exerciseId: exercise.exerciseId,
        sets: exercise.setsTarget,
        reps: exercise.repsTarget,
        weight: exercise.weightTarget,
      })),
    };

    await this.prisma.workoutSession.create({
      data: {
        userId,
        planId: plan.id,
        planDayId: selectedDay.id,
        scheduledDate: now,
        actualDate: now,
        weekIndex,
        status: 'in_progress',
        isTemporary: true,
        temporaryDate,
        creditedDayOfWeek: scheduledDay?.dayOfWeek ?? null,
        workoutSnapshot,
      },
    });

    return this.today(userId, timeZone);
  }

  async current(userId: string, deviceTimeZone?: string) {
    return this.today(userId, deviceTimeZone);
  }

  async start(userId: string, workoutSessionId?: string, deviceTimeZone?: string) {
    if (workoutSessionId) {
      await this.planCompletionService.completeExpiredPlansForUser(userId, deviceTimeZone);
    }
    if (!workoutSessionId) {
      const today = await this.today(userId, deviceTimeZone);
      if (!today || !['scheduled', 'in_progress'].includes(today.status) || !today.planId || !today.planDay?.id) {
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
          include: { setResults: true },
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
        include: { setResults: true },
      });
    }

    const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId } });
    if (!session) throw new NotFoundException();
    return this.prisma.workoutSession.update({
      where: { id: workoutSessionId },
      data: { status: 'in_progress', actualDate: new Date() },
      include: { setResults: true },
    });
  }

  async complete(userId: string, workoutSessionId: string) {
    const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId }, include: { plan: true } });
    if (!session) throw new NotFoundException();
    if (session.status === 'completed') return { success: true };

    return this.prisma.$transaction(async (tx) => {
      const completedSession = await tx.workoutSession.update({
        where: { id: workoutSessionId },
        data: { status: 'completed', completedAt: new Date(), actualDate: session.actualDate ?? new Date() },
      });

      const historyEntry = await tx.workoutHistoryEntry.findUnique({
        where: { workoutSessionId },
      });

      if (!historyEntry) {
        const setResults = await tx.workoutSetResult.findMany({
          where: { workoutSessionId },
          orderBy: [{ setNumber: 'asc' }, { id: 'asc' }],
        });

        if (session.planId && session.planDayId) {
          const completedAt = completedSession.completedAt ?? new Date();
          const planDay = await tx.workoutPlanDay.findUnique({
            where: { id: session.planDayId },
            select: {
              title: true,
              dayOfWeek: true,
              weekIndex: true,
            },
          });

          const plan = await tx.workoutPlan.findUnique({
            where: { id: session.planId },
            select: {
              name: true,
            },
          });

          if (planDay && plan) {
            const temporarySnapshot = completedSession.isTemporary
              ? readTemporaryWorkoutSnapshot(completedSession.workoutSnapshot)
              : null;
            const historyDayOfWeek = completedSession.isTemporary
              ? completedSession.creditedDayOfWeek
              : planDay.dayOfWeek;
            const createdHistory = await tx.workoutHistoryEntry.create({
              data: {
                userId,
                workoutSessionId: completedSession.id,
                originalPlanId: session.planId,
                planName: plan.name,
                workoutName: temporarySnapshot?.title ?? planDay.title,
                dayName: completedSession.isTemporary
                  ? historyDayOfWeek == null
                    ? 'Temporary workout'
                    : `Temporary • Day ${historyDayOfWeek + 1}`
                  : `Day ${planDay.dayOfWeek + 1}`,
                weekIndex: completedSession.weekIndex,
                dayOfWeek: historyDayOfWeek,
                isTemporary: completedSession.isTemporary,
                completedAt,
                setResults: {
                  create: setResults.map((setResult) => ({
                    exerciseName: setResult.exerciseName,
                    exerciseId: setResult.exerciseId,
                    setNumber: setResult.setNumber,
                    reps: setResult.reps,
                    weight: setResult.weight,
                    completed: setResult.completed,
                  })),
                },
              },
              include: {
                setResults: true,
              },
            });
            return { success: true, planResult: { planCompleted: false, archiveCreated: false }, history: createdHistory };
          }
        }

        return { success: true, planResult: { planCompleted: false, archiveCreated: false } };
      }

      return { success: true, planResult: { planCompleted: false, archiveCreated: false } };
    });
  }
}
