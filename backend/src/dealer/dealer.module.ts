import { Module } from '@nestjs/common';
import { DealerOnboardingController } from './dealer-onboarding.controller';
import { DealerOnboardingService } from './dealer-onboarding.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DealerOnboardingController],
  providers: [DealerOnboardingService],
  exports: [DealerOnboardingService],
})
export class DealerModule {}
