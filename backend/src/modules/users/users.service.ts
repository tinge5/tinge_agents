import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true, createdAt: true, updatedAt: true, workoutPlans: { include: { days: { include: { exercises: true } } } } } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async meHistory(userId: string) {
    return {
      workouts: await this.prisma.workoutSession.findMany({ where: { userId }, include: { setResults: true, plan: true, planDay: true }, orderBy: { scheduledDate: 'desc' } }),
      exerciseHistory: await this.prisma.exerciseHistoryEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      planArchives: await this.prisma.planCompletionArchive.findMany({ where: { userId }, orderBy: { completedAt: 'desc' } }),
    };
  }

  async completedPlans(userId: string) {
    return this.prisma.planCompletionArchive.findMany({ where: { userId }, orderBy: { completedAt: 'desc' } });
  }
}
