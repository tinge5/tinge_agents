import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async workouts(userId: string) {
    return this.prisma.workoutHistoryEntry.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      include: {
        setResults: {
          orderBy: [{ setNumber: 'asc' }, { id: 'asc' }],
        },
      },
    });
  }

  async workout(userId: string, id: string) {
    const session = await this.prisma.workoutHistoryEntry.findFirst({
      where: { id, userId },
      include: {
        setResults: {
          orderBy: [{ setNumber: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!session) throw new NotFoundException();
    return session;
  }

  async plan(userId: string, planId: string) {
    return this.prisma.planCompletionArchive.findMany({ where: { userId, planId } });
  }

  async exercise(userId: string, exerciseName: string) {
    return this.prisma.exerciseHistoryEntry.findMany({ where: { userId, exerciseName } });
  }
}
