import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { WorkoutsService } from './workouts.service';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}
  @Get('today') today(@Req() req: any) { return this.workoutsService.today(req.user.sub); }
  @Get('current') current(@Req() req: any) { return this.workoutsService.current(req.user.sub); }
  @Post(':workoutSessionId/start') start(@Req() req: any, @Param('workoutSessionId') id: string) { return this.workoutsService.start(req.user.sub, id); }
  @Post(':workoutSessionId/complete') complete(@Req() req: any, @Param('workoutSessionId') id: string) { return this.workoutsService.complete(req.user.sub, id); }
}
