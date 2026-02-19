import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SubscriptionService } from './subscription.service';
import { BiddingModule } from './bidding/bidding.module';
import { FraudModule } from './fraud/fraud.module';
import { SellerModule } from './seller/seller.module';
import { VoiceModule } from './voice/voice.module';
import { TrainingModule } from './training/training.module';

@Module({
  imports: [BiddingModule, FraudModule, SellerModule, VoiceModule, TrainingModule, HttpModule],
  controllers: [AiController],
  providers: [AiService, SubscriptionService],
  exports: [AiService, SubscriptionService],
})
export class AiModule {}
