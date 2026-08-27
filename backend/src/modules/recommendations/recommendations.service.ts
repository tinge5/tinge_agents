import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SessionStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async plan(userId: string) {
    const plans = await this.prisma.workoutPlan.findMany({ where: { userId }, include: { days: { include: { exercises: true } } } });
    const payload = plans.map((plan) => ({ planId: plan.id, name: plan.name, goals: plan.goals, exerciseCount: plan.days.reduce((sum, d) => sum + d.exercises.length, 0), progressiveOverloadEnabled: plan.progressiveOverloadEnabled }));
    await this.prisma.recommendationSnapshot.create({ data: { userId, planId: plans[0]?.id ?? null, contextType: 'plan_creation', payload } });
    return { recommendations: payload };
  }

  async workout(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({ where: { id: planId, userId }, include: { days: { include: { exercises: { orderBy: { order: 'asc' } } } } } });
    if (!plan) throw new NotFoundException('Plan not found');
    const payload = plan.days.map((day) => ({ dayId: day.id, dayOfWeek: day.dayOfWeek, weekIndex: day.weekIndex, title: day.title, exercises: day.exercises }));
    await this.prisma.recommendationSnapshot.create({ data: { userId, planId, contextType: 'daily_workout', payload } });
    return { recommendations: payload };
  }

  async exercises(userId: string) {
    const histories = await this.prisma.exerciseHistoryEntry.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 });
    return { recommendations: histories.map((h) => ({ exerciseName: h.exerciseName, lastWeight: h.weight, lastReps: h.reps, lastVolume: h.volume })) };
  }

  async progressive(userId: string, exerciseName: string) {
    const history = await this.prisma.exerciseHistoryEntry.findMany({ where: { userId, exerciseName }, orderBy: { date: 'desc' }, take: 5 });
    if (!history.length) return { exerciseName, insufficientHistory: true, recommendedWeight: null };
    const avgWeight = history.reduce((sum, h) => sum + h.weight, 0) / history.length;
    const maxReps = Math.max(...history.map((h) => h.reps));
    const recommendedWeight = maxReps >= 10 ? Number((avgWeight * 1.025).toFixed(2)) : Number(avgWeight.toFixed(2));
    const payload = { exerciseName, insufficientHistory: history.length < 2, recommendedWeight, basedOn: history.map((h) => ({ date: h.date, weight: h.weight, reps: h.reps })) };
    await this.prisma.recommendationSnapshot.create({ data: { userId, planId: null, contextType: 'progressive_overload', payload } });
    return payload;
  }
}
