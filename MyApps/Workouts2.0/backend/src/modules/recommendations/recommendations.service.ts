import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class RecommendationsService { constructor(private prisma: PrismaService) {} async plan(userId: string) { return { recommendations: [] }; } async workout(userId: string, planId: string) { return { recommendations: [] }; } async exercises(userId: string) { return { recommendations: [] }; } async progressive(userId: string, exerciseName: string) { return { exerciseName, insufficientHistory: true, recommendedWeight: null }; } }
