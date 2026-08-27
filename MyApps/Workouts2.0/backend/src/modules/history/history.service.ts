import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class HistoryService { constructor(private prisma: PrismaService) {} async workouts(userId: string) { return this.prisma.workoutSession.findMany({ where: { userId }, include: { setResults: true, planDay: true, plan: true } }); } async workout(userId: string, id: string) { const session = await this.prisma.workoutSession.findFirst({ where: { id, userId }, include: { setResults: true, planDay: true, plan: true } }); if (!session) throw new NotFoundException(); return session; } async plan(userId: string, planId: string) { return this.prisma.planCompletionArchive.findMany({ where: { userId, planId } }); } async exercise(userId: string, exerciseName: string) { return this.prisma.exerciseHistoryEntry.findMany({ where: { userId, exerciseName } }); } }
