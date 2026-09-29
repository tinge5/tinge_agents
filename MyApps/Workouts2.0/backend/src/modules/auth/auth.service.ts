import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Resend } from 'resend';

const PASSWORD_MIN_LENGTH = 8;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private accessToken(user: any) {
    return this.jwt.sign({ sub: user.id, email: user.email, displayName: user.displayName });
  }

  private async refreshToken(userId: string) {
    return this.jwt.signAsync({ sub: userId }, { expiresIn: '30d' });
  }

  private validatePassword(password: string) {
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      throw new BadRequestException(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
    }
  }

  private async createSession(userId: string, refreshToken: string) {
    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });
  }

  async register(email: string, password: string, displayName: string) {
    this.validatePassword(password);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await argon2.hash(password);
    const user = await this.prisma.user.create({ data: { email, passwordHash, displayName } });
    const refreshToken = await this.refreshToken(user.id);
    await this.createSession(user.id, refreshToken);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken: this.accessToken(user), refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException();
    const refreshToken = await this.refreshToken(user.id);
    await this.createSession(user.id, refreshToken);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken: this.accessToken(user), refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload: any = await this.jwt.verifyAsync(refreshToken);
      const session = await this.prisma.session.findFirst({ where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } } });
      if (!session) throw new UnauthorizedException();
      return { accessToken: this.jwt.sign({ sub: payload.sub, email: payload.email, displayName: payload.displayName }), refreshToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string) {
    await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true };
  }

  async session(user: any) {
    return { user: { id: user.sub, email: user.email, displayName: user.displayName } };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = await argon2.hash(token);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
      await this.sendPasswordResetEmail(user.email, user.displayName, token);
    }
    return { success: true };
  }

  async resetPassword(token: string, password: string) {
    this.validatePassword(password);
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    let match: any = null;
    for (const resetToken of tokens) {
      if (await argon2.verify(resetToken.tokenHash, token)) {
        match = resetToken;
        break;
      }
    }

    if (!match) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(password);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: match.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: match.id }, data: { usedAt: new Date() } }),
      this.prisma.session.updateMany({ where: { userId: match.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return { success: true };
  }

  private async sendPasswordResetEmail(email: string, displayName: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || process.env.WEB_APP_URL || '';
    const resetUrl = frontendUrl ? `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}` : `reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Workouts2.0 Password Reset';
    const text = `Hi ${displayName},\n\nWe received a request to reset your password. Use the link below to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour and can only be used once. If you did not request this, you can ignore this email.`;
    const html = `<p>Hi ${displayName},</p><p>We received a request to reset your password. Use the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour and can only be used once. If you did not request this, you can ignore this email.</p>`;
    await this.sendEmail(email, subject, text, html);
  }

private async sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  const { BrevoClient } = await import('@getbrevo/brevo');

  const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY!,
  });

  const result = await client.transactionalEmails.sendTransacEmail({
    sender: {
      name: 'Workouts2.0',
      email: process.env.BREVO_FROM_EMAIL!,
    },
    to: [
      {
        email: to,
      },
    ],
    subject,
    textContent: text,
    htmlContent: html,
  });

  console.log(`Email sent successfully: ${result.messageId}`);
}}