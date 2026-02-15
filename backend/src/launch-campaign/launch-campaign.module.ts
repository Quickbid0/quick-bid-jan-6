import { Module } from '@nestjs/common';
import { LaunchCampaignService } from './launch-campaign.service';
import { LaunchCampaignController } from './launch-campaign.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';

@Module({
  imports: [FeatureFlagModule],
  controllers: [LaunchCampaignController],
  providers: [LaunchCampaignService, PrismaService],
  exports: [LaunchCampaignService],
})
export class LaunchCampaignModule {}
