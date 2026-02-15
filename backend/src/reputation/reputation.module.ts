import { Module } from '@nestjs/common';
import { ReputationController } from './reputation.controller';
import { BuyerBadgeController } from './buyer-badge.controller';
import { ReputationService } from './reputation.service';
import { BuyerBadgeService } from './buyer-badge.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReputationController, BuyerBadgeController],
  providers: [ReputationService, BuyerBadgeService],
  exports: [ReputationService, BuyerBadgeService],
})
export class ReputationModule {}
