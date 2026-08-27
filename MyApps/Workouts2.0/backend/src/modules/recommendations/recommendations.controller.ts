import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController { constructor(private readonly service: RecommendationsService) {} @Get('plan') plan(@Req() req: any) { return this.service.plan(req.user.sub); } @Get('workout/:planId') workout(@Req() req: any, @Param('planId') planId: string) { return this.service.workout(req.user.sub, planId); } @Get('exercises') exercises(@Req() req: any) { return this.service.exercises(req.user.sub); } @Get('progressive-overload') progressive(@Req() req: any, @Query('exerciseName') exerciseName: string) { return this.service.progressive(req.user.sub, exerciseName); } }
