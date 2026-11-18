import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanCompletionService } from './plan-completion.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlansController],
  providers: [PlansService, PlanCompletionService],
  exports: [PlansService, PlanCompletionService],
})
export class PlansModule {}
