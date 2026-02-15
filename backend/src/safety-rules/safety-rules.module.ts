import { Module } from '@nestjs/common';
import { SafetyRulesService } from './safety-rules.service';
import { SafetyRulesController } from './safety-rules.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';

@Module({
  imports: [FeatureFlagModule],
  controllers: [SafetyRulesController],
  providers: [SafetyRulesService, PrismaService],
  exports: [SafetyRulesService],
})
export class SafetyRulesModule {}
