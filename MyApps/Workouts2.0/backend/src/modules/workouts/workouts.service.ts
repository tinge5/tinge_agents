import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
function startOfDay(date: Date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
function calculateWeekIndex(plan: { createdAt: Date; currentWeekIndex: number; startDate?: Date | null; durationWeeks?: number | null }, today = new Date()) { const anchor = plan.startDate ?? plan.createdAt; const daysSinceStart = Math.floor((startOfDay(today).getTime() - startOfDay(anchor).getTime()) / MS_PER_DAY); const weekIndex = Math.max(0, Math.floor(daysSinceStart / 7)); const maxWeek = Math.max(0, Number(plan.durationWeeks ?? 1) - 1); return Math.min(weekIndex, maxWeek); }
function applyProgression(exercise: any, weekIndex: number, enabled: boolean) { if (!enabled || weekIndex <= 0) return exercise; const weightTarget = typeof exercise.weightTarget === 'number' ? Number((exercise.weightTarget * (1 + 0.025 * weekIndex)).toFixed(1)) : null; return { ...exercise, setsTarget: Math.max(1, Number(exercise.setsTarget ?? 0)), repsTarget: Math.max(1, Number(exercise.repsTarget ?? 0) + weekIndex), weightTarget }; }

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}
  async today(userId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises: true } } } });
    if (!plan) return { status: 'no_active_plan' };
    const weekIndex = calculateWeekIndex(plan as any);
    const dow = new Date().getDay();
    const day = plan.days.find((d) => d.dayOfWeek === dow && d.weekIndex === weekIndex);
    if (!day) return { status: 'no_schedule', planId: plan.id, currentWeekIndex: weekIndex, plan };
    const exercises = day.exercises.map((exercise) => applyProgression(exercise, weekIndex, plan.progressiveOverloadEnabled)).map((exercise) => ({ name: exercise.exerciseName, sets: exercise.setsTarget, reps: exercise.repsTarget, weight: exercise.weightTarget }));
    return { status: 'scheduled', planId: plan.id, planDay: day, plan, weekIndex, title: day.title, day: `Day ${day.dayOfWeek}`, exercises };
  }
  async current(userId: string) { return this.today(userId); }
  async start(userId: string, workoutSessionId: string) { const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId } }); if (!session) throw new NotFoundException(); return this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: 'in_progress', actualDate: new Date() } }); }
  async complete(userId: string, workoutSessionId: string) { const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId }, include: { setResults: true, plan: { include: { days: { include: { exercises: true } } } } } }); if (!session) throw new NotFoundException(); if (session.status === 'completed') return session; await this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: 'completed', completedAt: new Date(), actualDate: session.actualDate || new Date() } }); return { success: true }; }
}
