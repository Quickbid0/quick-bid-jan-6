import { Module } from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagController } from './feature-flag.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService, PrismaService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
