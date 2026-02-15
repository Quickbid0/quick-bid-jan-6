import { Module } from '@nestjs/common';
import { WalletBonusService } from './wallet-bonus.service';
import { WalletBonusController } from './wallet-bonus.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WalletBonusController],
  providers: [WalletBonusService, PrismaService],
  exports: [WalletBonusService],
})
export class WalletBonusModule {}
