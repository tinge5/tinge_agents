import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SessionStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedSession(userId: string, sessionId: string) {
    const session = await this.prisma.workoutSession.findFirst({ where: { id: sessionId, userId }, include: { setResults: { orderBy: { setNumber: 'asc' } }, plan: { include: { days: { include: { exercises: { orderBy: { order: 'asc' } } } } } }, planDay: { include: { exercises: { orderBy: { order: 'asc' } } } } } });
    if (!session) throw new NotFoundException('Workout session not found');
    return session;
  }

  private async resolveCurrentPlan(userId: string) {
    return this.prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises: { orderBy: { order: 'asc' } } } } } });
  }

  async today(userId: string) {
    const plan = await this.resolveCurrentPlan(userId);
    if (!plan) return { status: 'no_active_plan' };
    const now = new Date();
    const dow = now.getDay();
    const day = plan.days.find((d) => d.dayOfWeek === dow && d.weekIndex === plan.currentWeekIndex);
    if (!day) return { status: 'no_schedule', planId: plan.id, currentWeekIndex: plan.currentWeekIndex };
    const session = await this.prisma.workoutSession.findFirst({ where: { userId, planId: plan.id, planDayId: day.id, weekIndex: plan.currentWeekIndex, scheduledDate: { gte: new Date(now.toDateString()), lt: new Date(new Date(now.toDateString()).getTime() + 86400000) } }, include: { setResults: true } });
    return { status: 'scheduled', planId: plan.id, plan, planDay: day, session };
  }

  async current(userId: string) {
    return this.today(userId);
  }

  async start(userId: string, workoutSessionId: string) {
    const session = await this.getOwnedSession(userId, workoutSessionId);
    if (session.status === SessionStatus.completed) throw new BadRequestException('Workout already completed');
    return this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: SessionStatus.in_progress, actualDate: new Date() }, include: { setResults: true } });
  }

  async addSet(userId: string, workoutSessionId: string, dto: any) {
    const session = await this.getOwnedSession(userId, workoutSessionId);
    return this.prisma.workoutSetResult.create({ data: { workoutSessionId: session.id, exerciseName: String(dto.exerciseName ?? '').trim(), exerciseId: dto.exerciseId ? String(dto.exerciseId) : null, setNumber: Number(dto.setNumber), reps: Number(dto.reps), weight: Number(dto.weight), completed: dto.completed === undefined ? true : !!dto.completed }, });
  }

  async updateSet(userId: string, workoutSessionId: string, setResultId: string, dto: any) {
    await this.getOwnedSession(userId, workoutSessionId);
    const setResult = await this.prisma.workoutSetResult.findFirst({ where: { id: setResultId, workoutSessionId } });
    if (!setResult) throw new NotFoundException('Set result not found');
    return this.prisma.workoutSetResult.update({ where: { id: setResultId }, data: { ...(dto.exerciseName !== undefined ? { exerciseName: String(dto.exerciseName).trim() } : {}), ...(dto.exerciseId !== undefined ? { exerciseId: dto.exerciseId ? String(dto.exerciseId) : null } : {}), ...(dto.setNumber !== undefined ? { setNumber: Number(dto.setNumber) } : {}), ...(dto.reps !== undefined ? { reps: Number(dto.reps) } : {}), ...(dto.weight !== undefined ? { weight: Number(dto.weight) } : {}), ...(dto.completed !== undefined ? { completed: !!dto.completed } : {}) } });
  }

  async complete(userId: string, workoutSessionId: string) {
    const session = await this.getOwnedSession(userId, workoutSessionId);
    if (session.status === SessionStatus.completed) return session;
    const completedAt = new Date();
    const updated = await this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: SessionStatus.completed, completedAt, actualDate: session.actualDate ?? completedAt }, include: { setResults: true, plan: { include: { days: { include: { exercises: true } } } }, planDay: true } });
    const generated = updated.setResults.map((set) => ({ userId, exerciseName: set.exerciseName, exerciseId: set.exerciseId, workoutSessionId: updated.id, date: completedAt, sets: 1, reps: set.reps, weight: set.weight, volume: set.reps * set.weight, rpe: null }));
    if (generated.length) await this.prisma.exerciseHistoryEntry.createMany({ data: generated });
    const plan = updated.plan;
    const totalPlanSessions = await this.prisma.workoutSession.count({ where: { userId, planId: plan.id, status: SessionStatus.completed } });
    const plannedDays = await this.prisma.workoutPlanDay.count({ where: { planId: plan.id } });
    if (plannedDays > 0 && totalPlanSessions >= plannedDays) {
      await this.prisma.workoutPlan.update({ where: { id: plan.id }, data: { status: 'completed', isActive: false } });
      await this.prisma.planCompletionArchive.create({ data: { userId, planId: plan.id, summarySnapshot: { plan: { id: plan.id, name: plan.name, goals: plan.goals, progressiveOverloadEnabled: plan.progressiveOverloadEnabled, currentWeekIndex: plan.currentWeekIndex }, completedAt, totals: { plannedDays, completedSessions: totalPlanSessions } } } });
    }
    return updated;
  }
}
