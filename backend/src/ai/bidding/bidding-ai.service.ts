import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Redis } from 'ioredis';
import { WinProbabilityService } from './win-probability.service';

@Injectable()
export class BiddingAiService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private winProb: WinProbabilityService,
  ) {}

  async calculateWinProbability(userId: string, auctionId: string): Promise<number> {
    const metrics = await this.prisma.aIUserMetrics.findUnique({ where: { userId } });
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });

    const userAggression = metrics?.aggressionScore || 0;
    const timePressure = this.calculateTimePressure(auction);
    const walletStrength = metrics?.walletStrength || 0;
    const bidPosition = await this.calculateBidPosition(auctionId, userId);
    const historicalWinRate = metrics?.winRate || 0;

    const winProb = this.winProb.calculate(
      userAggression,
      timePressure,
      walletStrength,
      bidPosition,
      historicalWinRate,
    );

    await this.prisma.aIPredictionLog.create({
      data: {
        auctionId,
        userId,
        predictionType: 'win_probability',
        predictionValue: winProb,
        confidence: 0.8,
        factors: { userAggression, timePressure, walletStrength, bidPosition, historicalWinRate },
      },
    });

    return winProb;
  }

  async processAutoBid(auctionId: string) {
    const configs = await this.prisma.autoBidConfig.findMany({
      where: { auctionId, isActive: true },
    });

    for (const config of configs) {
      const winProb = await this.calculateWinProbability(config.userId, auctionId);
      const fraudRisk = await this.getFraudRisk(config.userId, auctionId);

      if (winProb > config.winProbabilityThreshold && fraudRisk < config.fraudRiskThreshold) {
        const currentBid = await this.getCurrentBid(auctionId);
        const newBid = currentBid + config.increment;

        if (newBid <= config.maxAmount) {
          await this.prisma.$transaction(async (tx) => {
            await tx.bid.create({
              data: {
                auctionId,
                userId: config.userId,
                amount: newBid,
              },
            });

            await this.redis.publish('auction:' + auctionId, JSON.stringify({ type: 'new_bid', amount: newBid, userId: config.userId }));

            await tx.aIPredictionLog.create({
              data: {
                auctionId,
                userId: config.userId,
                predictionType: 'auto_bid',
                predictionValue: winProb,
                result: 'bid_placed',
              },
            });
          });
        }
      }
    }
  }

  private calculateTimePressure(auction: any): number {
    const now = new Date();
    const end = new Date(auction.endTime);
    const total = auction.duration * 60 * 1000;
    const remaining = end.getTime() - now.getTime();
    return Math.max(0, 1 - (remaining / total));
  }

  private async calculateBidPosition(auctionId: string, userId: string): number {
    const bids = await this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { amount: 'desc' },
    });
    const userBidIndex = bids.findIndex(b => b.userId === userId);
    if (userBidIndex === -1) return 0;
    return 1 / (userBidIndex + 1);
  }

  private async getFraudRisk(userId: string, auctionId: string): Promise<number> {
    // Inject FraudAiService
    return 0.1;
  }

  private async getCurrentBid(auctionId: string): Promise<number> {
    const bid = await this.prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
    });
    return bid?.amount || 0;
  }
}
