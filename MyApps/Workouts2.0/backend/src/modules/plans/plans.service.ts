import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { normalizeExerciseCanonicalName, toNumberOrNull } from '../workouts/exerciseProgression';

const normalizeDayOfWeek = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : fallback;
};

const normalizePlanDayKey = (day: any, idx: number) =>
  `${normalizeDayOfWeek(day.dayOfWeek, idx % 7)}:${Number(day.weekIndex ?? 0)}:${String(day.title ?? '').trim()}`;

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  private normalizeDays(dtoDays: any[] = []) {
    return dtoDays.map((d: any, idx: number) => ({
      dayOfWeek: normalizeDayOfWeek(d.dayOfWeek, idx % 7),
      weekIndex: Number(d.weekIndex ?? 0),
      title: String(d.title ?? '').trim(),
      position: idx,
      exercises: {
        create: (d.exercises || []).map((e: any, eidx: number) => ({
          exerciseName: normalizeExerciseCanonicalName(e.exerciseName),
          exerciseId: e.exerciseId ?? null,
          setsTarget: Number(e.setsTarget),
          repsTarget: Number(e.repsTarget),
          weightTarget: toNumberOrNull(e.weightTarget),
          order: eidx,
          notes: e.notes ?? null,
        })),
      },
    }));
  }

  private buildExerciseCreateData(e: any, eidx: number) {
    return {
      exerciseName: normalizeExerciseCanonicalName(e.exerciseName),
      exerciseId: e.exerciseId ?? null,
      setsTarget: Number(e.setsTarget),
      repsTarget: Number(e.repsTarget),
      weightTarget: toNumberOrNull(e.weightTarget),
      order: eidx,
      notes: e.notes ?? null,
    };
  }

  private async syncPlanDays(planId: string, existingDays: any[], incomingDays: any[]) {
    const existingById = new Map(existingDays.map((day) => [day.id, day]));
    const existingByKey = new Map(existingDays.map((day) => [normalizePlanDayKey(day, day.position ?? 0), day]));
    const usedExistingIds = new Set<string>();

    const operations: Promise<any>[] = [];

    for (let idx = 0; idx < incomingDays.length; idx++) {
      const incoming = incomingDays[idx] || {};
      const normalizedDay = {
        dayOfWeek: normalizeDayOfWeek(incoming.dayOfWeek, idx % 7),
        weekIndex: Number(incoming.weekIndex ?? 0),
        title: String(incoming.title ?? '').trim(),
        position: idx,
      };

      const incomingExercises = Array.isArray(incoming.exercises) ? incoming.exercises : [];
      const incomingKey = normalizePlanDayKey(normalizedDay, idx);
      const matchedExisting = incoming.id && existingById.get(incoming.id)
        ? existingById.get(incoming.id)
        : existingByKey.get(incomingKey);

      if (matchedExisting) {
        usedExistingIds.add(matchedExisting.id);
        const currentDay = await this.prisma.workoutPlanDay.findUnique({ where: { id: matchedExisting.id }, include: { exercises: true } });
        const currentExercises = currentDay?.exercises ?? [];
        const currentById = new Map(currentExercises.map((ex) => [ex.id, ex]));
        const currentByKey = new Map(currentExercises.map((ex) => [normalizeExerciseCanonicalName(ex.exerciseName) + ':' + ex.order, ex]));
        const keepIds = new Set<string>();
        const createData: any[] = [];
        const updateOps: Promise<any>[] = [];

        operations.push(this.prisma.workoutPlanDay.update({
          where: { id: matchedExisting.id },
          data: {
            ...normalizedDay,
          },
        }));

        for (let exIdx = 0; exIdx < incomingExercises.length; exIdx++) {
          const incomingEx = incomingExercises[exIdx] || {};
          const exKey = normalizeExerciseCanonicalName(incomingEx.exerciseName) + ':' + exIdx;
          const matchedEx = incomingEx.id && currentById.get(incomingEx.id)
            ? currentById.get(incomingEx.id)
            : currentByKey.get(exKey);

          if (matchedEx) {
            keepIds.add(matchedEx.id);
            updateOps.push(this.prisma.workoutPlanExercise.update({
              where: { id: matchedEx.id },
              data: {
                ...this.buildExerciseCreateData(incomingEx, exIdx),
              },
            }));
          } else {
            createData.push(this.buildExerciseCreateData(incomingEx, exIdx));
          }
        }

        operations.push((async () => {
          await Promise.all(updateOps);
          await this.prisma.workoutPlanExercise.deleteMany({ where: { planDayId: matchedExisting.id, id: { notIn: [...keepIds] } } });
          if (createData.length) {
            await this.prisma.workoutPlanExercise.createMany({ data: createData.map((d) => ({ ...d, planDayId: matchedExisting.id })) });
          }
        })());
      } else {
        operations.push(this.prisma.workoutPlanDay.create({
          data: {
            planId,
            ...normalizedDay,
            exercises: {
              create: incomingExercises.map((e: any, eidx: number) => this.buildExerciseCreateData(e, eidx)),
            },
          },
        }));
      }
    }

    const incomingIds = new Set(incomingDays.map((d: any) => d?.id).filter(Boolean));
    const idsToDelete = existingDays.filter((day) => !incomingIds.has(day.id) && !usedExistingIds.has(day.id)).map((day) => day.id);
    if (idsToDelete.length) {
      operations.push(this.prisma.workoutPlanDay.deleteMany({ where: { id: { in: idsToDelete }, planId } }));
    }

    await Promise.all(operations);
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
        durationWeeks,
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
    if (isActive) await this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true, id: { not: planId } }, data: { isActive: false } });

    const updatedPlan = await this.prisma.workoutPlan.update({
      where: { id: planId },
      data: {
        name: dto.name ?? plan.name,
        goals: dto.goals ?? plan.goals,
        progressiveOverloadEnabled: dto.progressiveOverloadEnabled ?? plan.progressiveOverloadEnabled,
        isActive,
        status: isActive ? 'active' : 'draft',
        durationWeeks: dto.durationWeeks ?? plan.durationWeeks,
      },
      include: { days: { include: { exercises: true } } },
    });

    if (dto.days !== undefined) {
      await this.syncPlanDays(planId, plan.days, dto.days);
    }

    return this.get(userId, planId);
  }

  async remove(userId: string, planId: string) { await this.get(userId, planId); await this.prisma.workoutPlan.delete({ where: { id: planId } }); return { success: true }; }
  async activate(userId: string, planId: string) { await this.get(userId, planId); await this.prisma.$transaction([this.prisma.workoutPlan.updateMany({ where: { userId, isActive: true, id: { not: planId } }, data: { isActive: false, status: 'draft' } }), this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: true, status: 'active' } })]); return this.get(userId, planId); }
  async deactivate(userId: string, planId: string) { await this.get(userId, planId); return this.prisma.workoutPlan.update({ where: { id: planId }, data: { isActive: false, status: 'draft' } }); }
}
