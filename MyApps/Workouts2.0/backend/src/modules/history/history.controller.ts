import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { HistoryService } from './history.service';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController { constructor(private readonly service: HistoryService) {} @Get('workouts') workouts(@Req() req: any) { return this.service.workouts(req.user.sub); } @Get('workouts/:workoutSessionId') workout(@Req() req: any, @Param('workoutSessionId') id: string) { return this.service.workout(req.user.sub, id); } @Get('plans/:planId') plan(@Req() req: any, @Param('planId') planId: string) { return this.service.plan(req.user.sub, planId); } @Get('exercises/:exerciseName') exercise(@Req() req: any, @Param('exerciseName') exerciseName: string) { return this.service.exercise(req.user.sub, exerciseName); } }
