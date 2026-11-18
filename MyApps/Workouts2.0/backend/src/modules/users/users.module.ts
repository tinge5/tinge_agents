import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PlansModule } from '../plans/plans.module';

@Module({ imports: [PrismaModule, PlansModule], controllers: [UsersController], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}
