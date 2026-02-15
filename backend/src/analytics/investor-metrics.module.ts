import { Module } from '@nestjs/common';
import { InvestorMetricsService } from './investor-metrics.service';
import { InvestorMetricsController } from './investor-metrics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InvestorMetricsController],
  providers: [InvestorMetricsService, PrismaService],
  exports: [InvestorMetricsService],
})
export class InvestorMetricsModule {}
