import { Module } from '@nestjs/common';
import { FeeOverrideService } from './fee-override.service';
import { FeeOverrideController } from './fee-override.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';
import { LaunchCampaignModule } from '../launch-campaign/launch-campaign.module';

@Module({
  imports: [FeatureFlagModule, LaunchCampaignModule],
  controllers: [FeeOverrideController],
  providers: [FeeOverrideService, PrismaService],
  exports: [FeeOverrideService],
})
export class FeeOverrideModule {}
