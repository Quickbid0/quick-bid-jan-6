import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService],
})
export class AuctionsModule {}
