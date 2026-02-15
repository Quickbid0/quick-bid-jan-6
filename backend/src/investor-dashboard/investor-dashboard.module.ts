import { Module } from '@nestjs/common';
import { InvestorDashboardService } from './investor-dashboard.service';
import { InvestorDashboardController } from './investor-dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';
import { InvestorMetricsModule } from '../analytics/investor-metrics.module';
import { LaunchCampaignModule } from '../launch-campaign/launch-campaign.module';
import { FeeOverrideModule } from '../fee-override/fee-override.module';
import { WalletBonusModule } from '../wallet-bonus/wallet-bonus.module';

@Module({
  imports: [
    InvestorMetricsModule,
    LaunchCampaignModule,
    FeeOverrideModule,
    WalletBonusModule,
  ],
  controllers: [InvestorDashboardController],
  providers: [InvestorDashboardService, PrismaService],
  exports: [InvestorDashboardService],
})
export class InvestorDashboardModule {}
