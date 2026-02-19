import { Injectable } from '@nestjs/common';
import { FeatureEngineeringService } from './training/feature-engineering.service';

@Injectable()
export class AiService {
  constructor(private featureEng: FeatureEngineeringService) {}

  getHealth() {
    return { status: 'AI Engine Running', timestamp: new Date() };
  }

  async buildFeaturesForPrediction(userId: string, auctionId: string): Promise<number[]> {
    return await this.featureEng.buildMLReadyVector(userId, auctionId, 1000);
  }

  async buildFraudFeatures(userId: string): Promise<number[]> {
    // Placeholder
    return [0.1, 0.2, 0.3];
  }
}
