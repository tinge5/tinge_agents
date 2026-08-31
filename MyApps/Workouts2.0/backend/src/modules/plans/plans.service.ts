import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  private normalizeDays(dtoDays: any[] = []) {
    return dtoDays.map((d: any, idx: number) => ({
      dayOfWeek: Number(d.dayOfWeek),
      weekIndex: Number(d.weekIndex ?? 0),
      title: String(d.title ?? ''),
      position: idx,
      exercises: {
        create: (d.exercises || []).map((e: any, eidx: number) => ({
          exerciseName: String(e.exerciseName ?? '').trim(),
          exerciseId: e.exerciseId,
          setsTarget: Number(e.setsTarget),
          repsTarget: Number(e.repsTarget),
          weightTarget: e.weightTarget === '' || e.weightTarget === null || e.weightTarget === undefined ? null : Number(e.weightTarget),
          order: eidx,
          notes: e.notes,
        })),
      },
    }));
  }

  async list(userId: string) {
    return this.prisma.workoutPlan.findMany({ where: { userId }, include: { days: { include: { exercises: true } } } });
  }

  async create(userId: string, dto: any) {
    const durationWeeks = Number(dto.durationWeeks ?? 4);
    if (Number.isNaN(durationWeeks) || durationWeeks < 1) throw new BadRequestException('durationWeeks must be at least 1');
    if (dto.isActive) await this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
    return this.prisma.workoutPlan.create({
      data: {
        userId,
        name: dto.name,
        goals: dto.goals || [],
        progressiveOverloadEnabled: !!dto.progressiveOverloadEnabled,
        isActive: !!dto.isActive,
        status: dto.isActive ? 'active' : 'draft',
        currentWeekIndex: 0,
        days: { create: this.normalizeDays(dto.days) },
      },
      include: { days: { include: { exercises: true } } },
    });
  }

  async get(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({ where: { id: planId, userId }, include: { days: { include: { exercises: true } } } });
    if (!plan) throw new NotFoundException();
    return plan;
  }

  async update(userId: string, planId: string, dto: any) {
    const plan = await this.get(userId, planId);
    const isActive = dto.isActive ?? plan.isActive;
    if (dto.durationWeeks !== undefined && (Number(dto.durationWeeks) < 1 || Number.isNaN(Number(dto.durationWeeks)))) throw new BadRequestException('durationWeeks must be at least 1');
    if (isActive) {
      await this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true, id: { not: planId } }, data: { isActive: false } });
    }
    await this.prisma.workoutPlanDay.deleteMany({ where: { planId } });
    return this.prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        name: dto.name ?? plan.name,
        goals: dto.goals ?? plan.goals,
        progressiveOverloadEnabled: dto.progressiveOverloadEnabled ?? plan.progressiveOverloadEnabled,
        isActive,
        status: isActive ? 'active' : 'draft',
        days: { create: this.normalizeDays(dto.days ?? plan.days) },
      },
      include: { days: { include: { exercises: true } } },
    });
  }

  async activate(userId: string, planId: string) {
    await this.get(userId, planId);
    await this.prisma.$transaction([
      this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true, id: { not: planId } }, data: { isActive: false, status: 'draft' } }),
      this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: true, status: 'active' } }),
    ]);
    return this.get(userId, planId);
  }

  async deactivate(userId: string, planId: string) {
    await this.get(userId, planId);
    return this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: false, status: 'draft' } });
  }
}
