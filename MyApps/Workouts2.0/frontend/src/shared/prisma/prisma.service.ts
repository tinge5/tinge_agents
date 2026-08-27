import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit {
  async onModuleInit() {}
  user = { findUnique: async () => null } as any;
  session = { create: async () => null, findUnique: async () => null, update: async () => null } as any;
  workoutPlan = { create: async () => null, findMany: async () => [], findUnique: async () => null, update: async () => null, delete: async () => null } as any;
  workoutPlanDay = { create: async () => null } as any;
  workoutPlanExercise = { create: async () => null } as any;
  workoutSession = { create: async () => null, findMany: async () => [], findUnique: async () => null, update: async () => null } as any;
  workoutSetResult = { create: async () => null, update: async () => null } as any;
  exerciseHistoryEntry = { create: async () => null, findMany: async () => [] } as any;
  planCompletionArchive = { create: async () => null, findMany: async () => [] } as any;
  recommendationSnapshot = { create: async () => null } as any;
}
