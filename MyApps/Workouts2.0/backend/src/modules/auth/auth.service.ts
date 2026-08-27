import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private accessToken(user: any) { return this.jwt.sign({ sub: user.id, email: user.email, displayName: user.displayName }); }
  private async refreshToken(userId: string) { return this.jwt.signAsync({ sub: userId }, { expiresIn: '30d' }); }

  async register(email: string, password: string, displayName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await argon2.hash(password);
    const user = await this.prisma.user.create({ data: { email, passwordHash, displayName } });
    const refreshToken = await this.refreshToken(user.id);
    await this.prisma.session.create({ data: { userId: user.id, tokenHash: await argon2.hash(refreshToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken: this.accessToken(user), refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException();
    const refreshToken = await this.refreshToken(user.id);
    await this.prisma.session.create({ data: { userId: user.id, tokenHash: await argon2.hash(refreshToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken: this.accessToken(user), refreshToken };
  }

  async refresh(refreshToken: string) {
    try { const payload: any = await this.jwt.verifyAsync(refreshToken); const session = await this.prisma.session.findFirst({ where: { userId: payload.sub, revokedAt: null } }); if (!session) throw new UnauthorizedException(); return { accessToken: this.jwt.sign({ sub: payload.sub }), refreshToken }; } catch { throw new UnauthorizedException(); }
  }

  async logout(userId: string) { await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }); return { success: true }; }
  async session(user: any) { return { user: { id: user.sub, email: user.email, displayName: user.displayName } }; }
}
