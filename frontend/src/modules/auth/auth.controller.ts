import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') register(@Body() body: any) { return this.authService.register(body.email, body.password, body.displayName); }
  @Post('login') login(@Body() body: any) { return this.authService.login(body.email, body.password); }
  @Post('refresh') refresh() { return this.authService.refresh(); }
  @Post('logout') logout() { return this.authService.logout(); }
  @Get('session') session() { return this.authService.session(); }
}
