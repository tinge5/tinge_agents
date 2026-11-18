import { Controller, Get, Headers, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me') me(@Req() req: any, @Headers('x-device-timezone') timeZone?: string) { return this.usersService.me(req.user.sub, timeZone); }
  @Get('me/completed-plans') completedPlans(@Req() req: any, @Headers('x-device-timezone') timeZone?: string) { return this.usersService.completedPlans(req.user.sub, timeZone); }
}
