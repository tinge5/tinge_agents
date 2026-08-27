import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') register(@Body() body: any) { return this.authService.register(body.email, body.password, body.displayName); }
  @Post('login') login(@Body() body: any) { return this.authService.login(body.email, body.password); }
  @Post('refresh') refresh(@Body() body: any) { return this.authService.refresh(body.refreshToken); }
  @UseGuards(JwtAuthGuard)
  @Post('logout') logout(@Req() req: any) { return this.authService.logout(req.user.sub); }
  @UseGuards(JwtAuthGuard)
  @Get('session') session(@Req() req: any) { return this.authService.session(req.user); }
}
