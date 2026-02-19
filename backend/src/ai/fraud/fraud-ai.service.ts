import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnomalyDetectionService } from './anomaly-detection.service';

@Injectable()
export class FraudAiService {
  constructor(
    private prisma: PrismaService,
    private anomaly: AnomalyDetectionService,
  ) {}

  async calculateFraudScore(userId: string): Promise<number> {
    const bidRing = await this.calculateBidRingScore(userId);
    const similarity = await this.calculateBehaviorSimilarity(userId);
    const anomalyScore = await this.anomaly.detectWalletAnomaly(userId);
    const score = bidRing * 0.4 + similarity * 0.3 + anomalyScore * 0.3;

    if (score > 0.75) {
      await this.freezeUser(userId);
    }

    await this.prisma.fraudCluster.upsert({
      where: { userId },
      update: {
        fraudScore: score,
        bidRingScore: bidRing,
        behaviorSimilarity: similarity,
        walletAnomaly: anomalyScore,
      },
      create: {
        userId,
        clusterId: 'default',
        fraudScore: score,
        bidRingScore: bidRing,
        behaviorSimilarity: similarity,
        walletAnomaly: anomalyScore,
      },
    });

    return score;
  }

  private async calculateBidRingScore(userId: string): number {
    // Implement bid ring detection logic
    return 0.2;
  }

  private async calculateBehaviorSimilarity(userId: string): number {
    // Cosine similarity with embeddings
    return 0.1;
  }

  private async freezeUser(userId: string) {
    await this.prisma.fraudCluster.updateMany({
      where: { userId },
      data: { isFrozen: true, frozenAt: new Date() },
    });
  }
}
