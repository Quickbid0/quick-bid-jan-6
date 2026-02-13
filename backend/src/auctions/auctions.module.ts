import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';

@Module({
  imports: [],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService],
})
export class AuctionsModule {}
