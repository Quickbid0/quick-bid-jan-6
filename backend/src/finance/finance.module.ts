import { Module } from '@nestjs/common';
import { EMIEligibilityController } from './emi-eligibility.controller';
import { EMIEligibilityService } from './emi-eligibility.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EMIEligibilityController],
  providers: [EMIEligibilityService],
  exports: [EMIEligibilityService],
})
export class FinanceModule {}
