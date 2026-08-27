import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { HistoryModule } from './modules/history/history.module';
import { ArchivalModule } from './modules/archival/archival.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PlansModule, WorkoutsModule, RecommendationsModule, HistoryModule, ArchivalModule],
})
export class AppModule {}
