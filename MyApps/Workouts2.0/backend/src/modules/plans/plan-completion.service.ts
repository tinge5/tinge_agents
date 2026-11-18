import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

const COMPLETION_CHECK_INTERVAL_MS = 15 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function calendarDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function hasReachedPlanEnd(plan: {
  createdAt: Date;
  startDate: Date | null;
  durationWeeks: number;
  timeZone: string | null;
}, now: Date) {
  const timeZone = plan.timeZone ?? 'UTC';
  const start = calendarDateParts(plan.startDate ?? plan.createdAt, timeZone);
  const today = calendarDateParts(now, timeZone);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const elapsedDays = Math.floor((todayUtc - startUtc) / MS_PER_DAY);

  return elapsedDays >= Math.max(1, plan.durationWeeks) * 7;
}

@Injectable()
export class PlanCompletionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlanCompletionService.name);
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.completeExpiredPlans().catch((error: unknown) => {
        this.logger.error('Unable to complete expired workout plans', error instanceof Error ? error.stack : String(error));
      });
    }, COMPLETION_CHECK_INTERVAL_MS);
    this.timer.unref?.();

    void this.completeExpiredPlans().catch((error: unknown) => {
      this.logger.error('Unable to complete expired workout plans', error instanceof Error ? error.stack : String(error));
    });
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async completeExpiredPlansForUser(userId: string, deviceTimeZone?: string) {
    const now = new Date();
    const plans = await this.prisma.workoutPlan.findMany({
      where: { userId, status: 'active', isActive: true },
      select: {
        id: true,
        userId: true,
        name: true,
        createdAt: true,
        startDate: true,
        durationWeeks: true,
        timeZone: true,
      },
    });

    for (const plan of plans) {
      const timeZone = plan.timeZone ?? deviceTimeZone ?? 'UTC';
      if (!plan.timeZone && deviceTimeZone) {
        await this.prisma.workoutPlan.updateMany({
          where: { id: plan.id, timeZone: null },
          data: { timeZone },
        });
      }
      if (hasReachedPlanEnd({ ...plan, timeZone }, now)) {
        await this.completePlan(plan.id, now, timeZone);
      }
    }
  }

  private async completeExpiredPlans() {
    const now = new Date();
    const plans = await this.prisma.workoutPlan.findMany({
      where: { status: 'active', isActive: true },
      select: {
        id: true,
        createdAt: true,
        startDate: true,
        durationWeeks: true,
        timeZone: true,
      },
    });

    for (const plan of plans) {
      if (hasReachedPlanEnd(plan, now)) {
        await this.completePlan(plan.id, now, plan.timeZone ?? 'UTC');
      }
    }
  }

  private async completePlan(planId: string, completedAt: Date, deviceTimeZone: string) {
    await this.prisma.$transaction(async (tx) => {
      const plan = await tx.workoutPlan.findFirst({
        where: { id: planId, status: 'active', isActive: true },
        include: {
          days: { select: { weekIndex: true } },
        },
      });
      if (!plan || !hasReachedPlanEnd({ ...plan, timeZone: plan.timeZone ?? deviceTimeZone }, completedAt)) return;

      const startDate = plan.startDate ?? plan.createdAt;
      const completedSessions = await tx.workoutSession.count({
        where: {
          planId: plan.id,
          userId: plan.userId,
          status: 'completed',
          completedAt: { gte: startDate },
        },
      });

      const completed = await tx.workoutPlan.updateMany({
        where: { id: plan.id, status: 'active', isActive: true },
        data: {
          status: 'completed',
          isActive: false,
          completedAt,
          timeZone: plan.timeZone ?? deviceTimeZone,
        },
      });
      if (completed.count === 0) return;

      const totalScheduledWorkouts = plan.days.filter((day) => (
        day.weekIndex >= 0 && day.weekIndex < Math.max(1, plan.durationWeeks)
      )).length;

      await tx.planCompletionArchive.create({
        data: {
          userId: plan.userId,
          planId: plan.id,
          completedAt,
          summarySnapshot: {
            planName: plan.name,
            startDate: startDate.toISOString(),
            completedAt: completedAt.toISOString(),
            completedWorkouts: completedSessions,
            totalScheduledWorkouts,
          },
        },
      });
    });
  }
}
