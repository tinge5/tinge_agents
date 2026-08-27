import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async me(userId: string) { return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true, createdAt: true, updatedAt: true, workoutPlans: true, sessions: true } }); }
  async ensure(userId: string) { const user = await this.prisma.user.findUnique({ where: { id: userId } }); if (!user) throw new NotFoundException(); return user; }
}
