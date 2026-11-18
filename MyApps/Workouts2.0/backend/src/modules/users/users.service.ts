import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { PlanCompletionService } from '../plans/plan-completion.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private planCompletionService: PlanCompletionService,
  ) {}

  async me(userId: string, deviceTimeZone?: string) {
    await this.planCompletionService.completeExpiredPlansForUser(userId, deviceTimeZone);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
        workoutPlans: true,
        sessions: true,
      },
    });

    if (!user) return null;

    const activePlan = await this.prisma.workoutPlan.findFirst({
      where: { userId, status: 'active' },
      include: { days: { include: { exercises: true } } },
    });

    return {
      ...user,
      activePlan,
    };
  }

  async completedPlans(userId: string, deviceTimeZone?: string) {
    await this.planCompletionService.completeExpiredPlansForUser(userId, deviceTimeZone);
    const archives = await this.prisma.planCompletionArchive.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      include: {
        plan: {
          select: {
            name: true,
            startDate: true,
            createdAt: true,
          },
        },
      },
    });

    return archives.map((archive) => {
      const snapshot = archive.summarySnapshot;
      const snapshotValue = (key: string): Prisma.JsonValue | undefined => (
        snapshot !== null && typeof snapshot === 'object' && !Array.isArray(snapshot)
          ? snapshot[key]
          : undefined
      );
      const snapshotName = snapshotValue('planName');
      const snapshotStartDate = snapshotValue('startDate');
      const snapshotCompletedWorkouts = snapshotValue('completedWorkouts') ?? snapshotValue('completedSessions');
      const snapshotTotalWorkouts = snapshotValue('totalScheduledWorkouts');

      return {
        id: archive.id,
        planId: archive.planId,
        name: typeof snapshotName === 'string' ? snapshotName : archive.plan.name,
        startDate: typeof snapshotStartDate === 'string'
          ? snapshotStartDate
          : (archive.plan.startDate ?? archive.plan.createdAt).toISOString(),
        completedAt: archive.completedAt.toISOString(),
        completedWorkouts: typeof snapshotCompletedWorkouts === 'number' ? snapshotCompletedWorkouts : 0,
        totalScheduledWorkouts: typeof snapshotTotalWorkouts === 'number' ? snapshotTotalWorkouts : 0,
      };
    });
  }

  async ensure(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return user;
  }
}
