import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PlanStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

export type PlanGoalInput = string[];

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertPlanOwner(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  private mapDayCreate(day: any, index: number) {
    const exercises = Array.isArray(day.exercises) ? day.exercises : [];
    return {
      dayOfWeek: this.toInt(day.dayOfWeek, 'dayOfWeek', 0, 6),
      weekIndex: this.toInt(day.weekIndex ?? 0, 'weekIndex', 0),
      title: String(day.title ?? '').trim(),
      position: this.toInt(day.position ?? index, 'position', 0),
      exercises: {
        create: exercises.map((e: any, eidx: number) => ({
          exerciseName: this.nonEmptyString(e.exerciseName, 'exerciseName'),
          exerciseId: e.exerciseId ? String(e.exerciseId) : null,
          setsTarget: this.toInt(e.setsTarget, 'setsTarget', 1),
          repsTarget: this.toInt(e.repsTarget, 'repsTarget', 1),
          weightTarget: e.weightTarget === undefined || e.weightTarget === null || e.weightTarget === '' ? null : Number(e.weightTarget),
          order: this.toInt(e.order ?? eidx, 'order', 0),
          notes: e.notes ? String(e.notes) : null,
        })),
      },
    };
  }

  private nonEmptyString(value: any, field: string) {
    const v = String(value ?? '').trim();
    if (!v) throw new BadRequestException(`${field} is required`);
    return v;
  }

  private toInt(value: any, field: string, min?: number, max?: number) {
    const n = Number(value);
    if (!Number.isInteger(n)) throw new BadRequestException(`${field} must be an integer`);
    if (min !== undefined && n < min) throw new BadRequestException(`${field} must be >= ${min}`);
    if (max !== undefined && n > max) throw new BadRequestException(`${field} must be <= ${max}`);
    return n;
  }

  async list(userId: string) {
    return this.prisma.workoutPlan.findMany({ where: { userId }, include: { days: { orderBy: [{ weekIndex: 'asc' }, { position: 'asc' }], include: { exercises: { orderBy: { order: 'asc' } } } } }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, dto: any) {
    const name = this.nonEmptyString(dto.name, 'name');
    const goals = Array.isArray(dto.goals) ? dto.goals.map((g: any) => String(g).trim()).filter(Boolean) : [];
    const days = Array.isArray(dto.days) ? dto.days : [];
    const isActive = !!dto.isActive;
    return this.prisma.$transaction(async (tx) => {
      if (isActive) await tx.workoutPlan.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
      return tx.workoutPlan.create({
        data: {
          userId,
          name,
          goals,
          progressiveOverloadEnabled: !!dto.progressiveOverloadEnabled,
          isActive,
          status: isActive ? PlanStatus.active : PlanStatus.draft,
          days: { create: days.map((d: any, idx: number) => this.mapDayCreate(d, idx)) },
        },
        include: { days: { orderBy: [{ weekIndex: 'asc' }, { position: 'asc' }], include: { exercises: { orderBy: { order: 'asc' } } } } },
      });
    });
  }

  async get(userId: string, planId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({ where: { id: planId, userId }, include: { days: { orderBy: [{ weekIndex: 'asc' }, { position: 'asc' }], include: { exercises: { orderBy: { order: 'asc' } } } } } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(userId: string, planId: string, dto: any) {
    const plan = await this.assertPlanOwner(userId, planId);
    const data: Prisma.WorkoutPlanUpdateInput = {};
    if (dto.name !== undefined) data.name = this.nonEmptyString(dto.name, 'name');
    if (dto.goals !== undefined) data.goals = Array.isArray(dto.goals) ? dto.goals.map((g: any) => String(g).trim()).filter(Boolean) : [];
    if (dto.progressiveOverloadEnabled !== undefined) data.progressiveOverloadEnabled = !!dto.progressiveOverloadEnabled;
    return this.prisma.workoutPlan.update({ where: { id: plan.id }, data, include: { days: { orderBy: [{ weekIndex: 'asc' }, { position: 'asc' }], include: { exercises: { orderBy: { order: 'asc' } } } } } });
  }

  async delete(userId: string, planId: string) {
    await this.assertPlanOwner(userId, planId);
    return this.prisma.workoutPlan.delete({ where: { id: planId } });
  }

  async activate(userId: string, planId: string) {
    await this.assertPlanOwner(userId, planId);
    return this.prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({ where: { userId, isActive: true, id: { not: planId } }, data: { isActive: false } });
      await tx.workoutPlan.update({ where: { id: planId }, data: { isActive: true, status: PlanStatus.active } });
      return tx.workoutPlan.findUnique({ where: { id: planId }, include: { days: { include: { exercises: true } } } });
    });
  }

  async deactivate(userId: string, planId: string) {
    await this.assertPlanOwner(userId, planId);
    return this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: false, status: PlanStatus.draft } });
  }

  async createDay(userId: string, planId: string, dto: any) {
    await this.assertPlanOwner(userId, planId);
    return this.prisma.workoutPlanDay.create({ data: { planId, dayOfWeek: this.toInt(dto.dayOfWeek, 'dayOfWeek', 0, 6), weekIndex: this.toInt(dto.weekIndex ?? 0, 'weekIndex', 0), title: this.nonEmptyString(dto.title, 'title'), position: this.toInt(dto.position ?? 0, 'position', 0) }, include: { exercises: true } });
  }

  async updateDay(userId: string, planId: string, dayId: string, dto: any) {
    await this.assertPlanOwner(userId, planId);
    const day = await this.prisma.workoutPlanDay.findFirst({ where: { id: dayId, planId } });
    if (!day) throw new NotFoundException('Day not found');
    return this.prisma.workoutPlanDay.update({ where: { id: dayId }, data: { ...(dto.dayOfWeek !== undefined ? { dayOfWeek: this.toInt(dto.dayOfWeek, 'dayOfWeek', 0, 6) } : {}), ...(dto.weekIndex !== undefined ? { weekIndex: this.toInt(dto.weekIndex, 'weekIndex', 0) } : {}), ...(dto.title !== undefined ? { title: this.nonEmptyString(dto.title, 'title') } : {}), ...(dto.position !== undefined ? { position: this.toInt(dto.position, 'position', 0) } : {}) }, include: { exercises: true } });
  }

  async deleteDay(userId: string, planId: string, dayId: string) {
    await this.assertPlanOwner(userId, planId);
    const day = await this.prisma.workoutPlanDay.findFirst({ where: { id: dayId, planId } });
    if (!day) throw new NotFoundException('Day not found');
    return this.prisma.workoutPlanDay.delete({ where: { id: dayId } });
  }

  async createExercise(userId: string, planId: string, dayId: string, dto: any) {
    await this.assertPlanOwner(userId, planId);
    const day = await this.prisma.workoutPlanDay.findFirst({ where: { id: dayId, planId } });
    if (!day) throw new NotFoundException('Day not found');
    return this.prisma.workoutPlanExercise.create({ data: { planDayId: dayId, exerciseName: this.nonEmptyString(dto.exerciseName, 'exerciseName'), exerciseId: dto.exerciseId ? String(dto.exerciseId) : null, setsTarget: this.toInt(dto.setsTarget, 'setsTarget', 1), repsTarget: this.toInt(dto.repsTarget, 'repsTarget', 1), weightTarget: dto.weightTarget === undefined || dto.weightTarget === null || dto.weightTarget === '' ? null : Number(dto.weightTarget), order: this.toInt(dto.order ?? 0, 'order', 0), notes: dto.notes ? String(dto.notes) : null } });
  }

  async updateExercise(userId: string, planId: string, dayId: string, exerciseId: string, dto: any) {
    await this.assertPlanOwner(userId, planId);
    const exercise = await this.prisma.workoutPlanExercise.findFirst({ where: { id: exerciseId, planDayId: dayId } });
    if (!exercise) throw new NotFoundException('Exercise not found');
    return this.prisma.workoutPlanExercise.update({ where: { id: exerciseId }, data: { ...(dto.exerciseName !== undefined ? { exerciseName: this.nonEmptyString(dto.exerciseName, 'exerciseName') } : {}), ...(dto.exerciseId !== undefined ? { exerciseId: dto.exerciseId ? String(dto.exerciseId) : null } : {}), ...(dto.setsTarget !== undefined ? { setsTarget: this.toInt(dto.setsTarget, 'setsTarget', 1) } : {}), ...(dto.repsTarget !== undefined ? { repsTarget: this.toInt(dto.repsTarget, 'repsTarget', 1) } : {}), ...(dto.weightTarget !== undefined ? { weightTarget: dto.weightTarget === null || dto.weightTarget === '' ? null : Number(dto.weightTarget) } : {}), ...(dto.order !== undefined ? { order: this.toInt(dto.order, 'order', 0) } : {}), ...(dto.notes !== undefined ? { notes: dto.notes ? String(dto.notes) : null } : {}) } });
  }

  async deleteExercise(userId: string, planId: string, dayId: string, exerciseId: string) {
    await this.assertPlanOwner(userId, planId);
    const exercise = await this.prisma.workoutPlanExercise.findFirst({ where: { id: exerciseId, planDayId: dayId } });
    if (!exercise) throw new NotFoundException('Exercise not found');
    return this.prisma.workoutPlanExercise.delete({ where: { id: exerciseId } });
  }
}
