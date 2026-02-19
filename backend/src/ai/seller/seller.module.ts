import { Module } from '@nestjs/common';
import { SellerAiService } from './seller-ai.service';
import { PriceOptimizerService } from './price-optimizer.service';

@Module({
  providers: [SellerAiService, PriceOptimizerService],
  exports: [SellerAiService, PriceOptimizerService],
})
export class SellerModule {}
