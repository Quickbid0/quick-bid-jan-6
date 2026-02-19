import { Module } from '@nestjs/common';
import { BiddingAiService } from './bidding-ai.service';
import { WinProbabilityService } from './win-probability.service';

@Module({
  providers: [BiddingAiService, WinProbabilityService],
  exports: [BiddingAiService, WinProbabilityService],
})
export class BiddingModule {}
