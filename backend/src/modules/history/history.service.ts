import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async workouts(userId: string) {
    return this.prisma.workoutSession.findMany({ where: { userId }, include: { setResults: { orderBy: { setNumber: 'asc' } }, planDay: { include: { exercises: { orderBy: { order: 'asc' } } } }, plan: true }, orderBy: { scheduledDate: 'desc' } });
  }

  async workout(userId: string, id: string) {
    const session = await this.prisma.workoutSession.findFirst({ where: { id, userId }, include: { setResults: { orderBy: { setNumber: 'asc' } }, planDay: { include: { exercises: { orderBy: { order: 'asc' } } } }, plan: true } });
    if (!session) throw new NotFoundException('Workout not found');
    return session;
  }

  async plan(userId: string, planId: string) {
    return this.prisma.planCompletionArchive.findMany({ where: { userId, planId }, orderBy: { completedAt: 'desc' } });
  }

  async exercise(userId: string, exerciseName: string) {
    return this.prisma.exerciseHistoryEntry.findMany({ where: { userId, exerciseName }, orderBy: { date: 'desc' } });
  }
}
