import { Module } from '@nestjs/common';
import { FraudAiService } from './fraud-ai.service';
import { AnomalyDetectionService } from './anomaly-detection.service';

@Module({
  providers: [FraudAiService, AnomalyDetectionService],
  exports: [FraudAiService, AnomalyDetectionService],
})
export class FraudModule {}
