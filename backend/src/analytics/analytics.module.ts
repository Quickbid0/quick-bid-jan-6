import { Module } from '@nestjs/common';
import { RecoveryOptimizationAIController } from './recovery-optimization-ai.controller';
import { RecoveryOptimizationAIService } from './recovery-optimization-ai.service';
import { BankRecoveryDashboardController } from './bank-recovery-dashboard.controller';
import { BankRecoveryDashboardService } from './bank-recovery-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecoveryOptimizationAIController, BankRecoveryDashboardController],
  providers: [RecoveryOptimizationAIService, BankRecoveryDashboardService],
  exports: [RecoveryOptimizationAIService, BankRecoveryDashboardService],
})
export class AnalyticsModule {}
