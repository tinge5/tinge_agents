import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: any) { return this.usersService.me(req.user.sub); }

  @Get('me/history')
  history(@Req() req: any) { return this.usersService.meHistory(req.user.sub); }

  @Get('me/completed-plans')
  completedPlans(@Req() req: any) { return this.usersService.completedPlans(req.user.sub); }
}
