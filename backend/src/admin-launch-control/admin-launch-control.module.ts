import { Module } from '@nestjs/common';
import { AdminLaunchControlController } from './admin-launch-control.controller';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';
import { LaunchCampaignModule } from '../launch-campaign/launch-campaign.module';
import { FeeOverrideModule } from '../fee-override/fee-override.module';
import { BidControlModule } from '../bid-control/bid-control.module';
import { WalletBonusModule } from '../wallet-bonus/wallet-bonus.module';
import { InvestorDashboardModule } from '../investor-dashboard/investor-dashboard.module';
import { MarketplaceMetricsModule } from '../marketplace-metrics/marketplace-metrics.module';
import { SafetyRulesModule } from '../safety-rules/safety-rules.module';

@Module({
  imports: [
    FeatureFlagModule,
    LaunchCampaignModule,
    FeeOverrideModule,
    BidControlModule,
    WalletBonusModule,
    InvestorDashboardModule,
    MarketplaceMetricsModule,
    SafetyRulesModule,
  ],
  controllers: [AdminLaunchControlController],
})
export class AdminLaunchControlModule {}
