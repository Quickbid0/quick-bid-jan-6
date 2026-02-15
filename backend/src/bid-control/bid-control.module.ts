import { Module } from '@nestjs/common';
import { BidControlService } from './bid-control.service';
import { BidControlController } from './bid-control.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';

@Module({
  imports: [FeatureFlagModule],
  controllers: [BidControlController],
  providers: [BidControlService, PrismaService],
  exports: [BidControlService],
})
export class BidControlModule {}
