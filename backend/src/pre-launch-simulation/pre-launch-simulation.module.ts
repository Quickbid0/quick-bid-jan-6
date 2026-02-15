import { Module } from '@nestjs/common';
import { PreLaunchSimulationService } from './pre-launch-simulation.service';
import { PreLaunchSimulationController } from './pre-launch-simulation.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';
import { LaunchCampaignModule } from '../launch-campaign/launch-campaign.module';
import { AccountTierModule } from '../account-tier/account-tier.module';
import { FeeOverrideModule } from '../fee-override/fee-override.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { BidControlModule } from '../bid-control/bid-control.module';
import { WalletBonusModule } from '../wallet-bonus/wallet-bonus.module';

@Module({
  imports: [
    AuthModule,
    WalletModule,
    AuctionsModule,
    FeatureFlagModule,
    LaunchCampaignModule,
    AccountTierModule,
    FeeOverrideModule,
    SubscriptionModule,
    BidControlModule,
    WalletBonusModule,
  ],
  controllers: [PreLaunchSimulationController],
  providers: [PreLaunchSimulationService, PrismaService],
  exports: [PreLaunchSimulationService],
})
export class PreLaunchSimulationModule {}
