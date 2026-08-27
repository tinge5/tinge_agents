import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { PlansService } from './plans.service';

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  list(@Req() req: any) { return this.plansService.list(req.user.sub); }

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.plansService.create(req.user.sub, body); }

  @Get(':planId')
  get(@Req() req: any, @Param('planId') planId: string) { return this.plansService.get(req.user.sub, planId); }

  @Patch(':planId')
  update(@Req() req: any, @Param('planId') planId: string, @Body() body: any) { return this.plansService.update(req.user.sub, planId, body); }

  @Delete(':planId')
  delete(@Req() req: any, @Param('planId') planId: string) { return this.plansService.delete(req.user.sub, planId); }

  @Post(':planId/activate')
  activate(@Req() req: any, @Param('planId') planId: string) { return this.plansService.activate(req.user.sub, planId); }

  @Post(':planId/deactivate')
  deactivate(@Req() req: any, @Param('planId') planId: string) { return this.plansService.deactivate(req.user.sub, planId); }

  @Post(':planId/days')
  createDay(@Req() req: any, @Param('planId') planId: string, @Body() body: any) { return this.plansService.createDay(req.user.sub, planId, body); }

  @Patch(':planId/days/:dayId')
  updateDay(@Req() req: any, @Param('planId') planId: string, @Param('dayId') dayId: string, @Body() body: any) { return this.plansService.updateDay(req.user.sub, planId, dayId, body); }

  @Delete(':planId/days/:dayId')
  deleteDay(@Req() req: any, @Param('planId') planId: string, @Param('dayId') dayId: string) { return this.plansService.deleteDay(req.user.sub, planId, dayId); }

  @Post(':planId/days/:dayId/exercises')
  createExercise(@Req() req: any, @Param('planId') planId: string, @Param('dayId') dayId: string, @Body() body: any) { return this.plansService.createExercise(req.user.sub, planId, dayId, body); }

  @Patch(':planId/days/:dayId/exercises/:exerciseId')
  updateExercise(@Req() req: any, @Param('planId') planId: string, @Param('dayId') dayId: string, @Param('exerciseId') exerciseId: string, @Body() body: any) { return this.plansService.updateExercise(req.user.sub, planId, dayId, exerciseId, body); }

  @Delete(':planId/days/:dayId/exercises/:exerciseId')
  deleteExercise(@Req() req: any, @Param('planId') planId: string, @Param('dayId') dayId: string, @Param('exerciseId') exerciseId: string) { return this.plansService.deleteExercise(req.user.sub, planId, dayId, exerciseId); }
}
