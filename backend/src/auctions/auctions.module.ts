import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';
import { Auction } from './auction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction])],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService],
})
export class AuctionsModule {}
