import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}
  async today(userId: string) { const plan = await this.prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises: true } } } }); if (!plan) return { status: 'no_active_plan' }; const dow = new Date().getDay(); const day = plan.days.find(d => d.dayOfWeek === dow && d.weekIndex === plan.currentWeekIndex); if (!day) return { status: 'no_schedule', planId: plan.id, currentWeekIndex: plan.currentWeekIndex }; return { status: 'scheduled', planId: plan.id, planDay: day, plan, weekIndex: plan.currentWeekIndex }; }
  async current(userId: string) { return this.today(userId); }
  async start(userId: string, workoutSessionId: string) { const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId } }); if (!session) throw new NotFoundException(); return this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: 'in_progress', actualDate: new Date() } }); }
  async complete(userId: string, workoutSessionId: string) { const session = await this.prisma.workoutSession.findFirst({ where: { id: workoutSessionId, userId }, include: { setResults: true, plan: { include: { days: { include: { exercises: true } } } } } }); if (!session) throw new NotFoundException(); if (session.status === 'completed') return session; await this.prisma.workoutSession.update({ where: { id: workoutSessionId }, data: { status: 'completed', completedAt: new Date(), actualDate: session.actualDate || new Date() } }); return { success: true }; }
}
