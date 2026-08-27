import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [WorkoutsController], providers: [WorkoutsService], exports: [WorkoutsService] })
export class WorkoutsModule {}
