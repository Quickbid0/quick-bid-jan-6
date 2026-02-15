import { Module } from '@nestjs/common';
import { AccountTierService } from './account-tier.service';
import { AccountTierController } from './account-tier.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AccountTierController],
  providers: [AccountTierService, PrismaService],
  exports: [AccountTierService],
})
export class AccountTierModule {}
