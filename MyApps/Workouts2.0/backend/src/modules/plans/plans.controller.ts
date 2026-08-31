import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { PlansService } from './plans.service';

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}
  @Get() list(@Req() req: any) { return this.plansService.list(req.user.sub); }
  @Post() create(@Req() req: any, @Body() body: any) { return this.plansService.create(req.user.sub, body); }
  @Get(':planId') get(@Req() req: any, @Param('planId') planId: string) { return this.plansService.get(req.user.sub, planId); }
  @Post(':planId/activate') activate(@Req() req: any, @Param('planId') planId: string) { return this.plansService.activate(req.user.sub, planId); }
  @Post(':planId/deactivate') deactivate(@Req() req: any, @Param('planId') planId: string) { return this.plansService.deactivate(req.user.sub, planId); }
  @Patch(':planId') patch(@Req() req: any, @Param('planId') planId: string, @Body() body: any) { return this.plansService.update(req.user.sub, planId, body); }
}
