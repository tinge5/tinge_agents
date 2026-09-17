import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsNumber, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { WorkoutsService } from './workouts.service';

class SaveWorkoutSetResultBody {
  @IsString()
  exerciseName!: string;

  @IsNumber()
  @Min(0)
  sets!: number;

  @IsNumber()
  @Min(0)
  reps!: number;

  @IsNumber()
  @Min(0)
  weight!: number;
}

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get('today')
  today(@Req() req: any, @Headers('x-device-timezone') deviceTimeZone?: string) {
    return this.workoutsService.today(req.user.sub, deviceTimeZone);
  }

  @Get('current')
  current(@Req() req: any, @Headers('x-device-timezone') deviceTimeZone?: string) {
    return this.workoutsService.current(req.user.sub, deviceTimeZone);
  }

  @Post('start')
  start(@Req() req: any, @Headers('x-device-timezone') deviceTimeZone?: string) {
    return this.workoutsService.start(req.user.sub, undefined, deviceTimeZone);
  }

  @Post(':workoutSessionId/start')
  startExisting(@Req() req: any, @Param('workoutSessionId') id: string, @Headers('x-device-timezone') deviceTimeZone?: string) {
    return this.workoutsService.start(req.user.sub, id, deviceTimeZone);
  }

  @Post(':workoutSessionId/set-results')
  saveSetResult(@Req() req: any, @Param('workoutSessionId') workoutSessionId: string, @Body() body: SaveWorkoutSetResultBody) {
    return this.workoutsService.saveWorkoutSetResult(req.user.sub, workoutSessionId, body);
  }

  @Post(':workoutSessionId/complete')
  complete(@Req() req: any, @Param('workoutSessionId') id: string) {
    return this.workoutsService.complete(req.user.sub, id);
  }
}
