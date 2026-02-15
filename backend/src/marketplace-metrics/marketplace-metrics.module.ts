import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketplaceMetricsService } from './marketplace-metrics.service';
import { MarketplaceMetricsController } from './marketplace-metrics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [MarketplaceMetricsController],
  providers: [MarketplaceMetricsService, PrismaService],
  exports: [MarketplaceMetricsService],
})
export class MarketplaceMetricsModule {}
