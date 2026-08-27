import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}
  async list(userId: string) { return this.prisma.workoutPlan.findMany({ where: { userId }, include: { days: { include: { exercises: true } } } }); }
  async create(userId: string, dto: any) { if (dto.isActive) await this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true }, data: { isActive: false } }); return this.prisma.workoutPlan.create({ data: { userId, name: dto.name, goals: dto.goals || [], progressiveOverloadEnabled: !!dto.progressiveOverloadEnabled, isActive: !!dto.isActive, status: dto.isActive ? 'active' : 'draft', days: { create: dto.days?.map((d: any, idx: number) => ({ dayOfWeek: d.dayOfWeek, weekIndex: d.weekIndex ?? 0, title: d.title, position: idx, exercises: { create: (d.exercises || []).map((e: any, eidx: number) => ({ exerciseName: e.exerciseName, exerciseId: e.exerciseId, setsTarget: e.setsTarget, repsTarget: e.repsTarget, weightTarget: e.weightTarget, order: eidx, notes: e.notes })) } })) || [] } }, include: { days: { include: { exercises: true } } } }); }
  async get(userId: string, planId: string) { const plan = await this.prisma.workoutPlan.findFirst({ where: { id: planId, userId }, include: { days: { include: { exercises: true } } } }); if (!plan) throw new NotFoundException(); return plan; }
  async activate(userId: string, planId: string) { const plan = await this.get(userId, planId); await this.prisma.$transaction([this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true }, data: { isActive: false } }), this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: true, status: 'active' } })]); return this.get(userId, planId); }
  async deactivate(userId: string, planId: string) { await this.get(userId, planId); return this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: false, status: 'draft' } }); }
}
