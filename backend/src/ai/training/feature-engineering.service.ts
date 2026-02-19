import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeatureEngineeringService {
  constructor(private prisma: PrismaService) {}

  async calculateAggressionScore(userId: string): Promise<number> {
    // Calculate based on recent bid increments and frequency
    const recentBids = await this.prisma.bid.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (recentBids.length < 10) return 0.1;

    const increments = recentBids.slice(1).map((bid, i) => bid.amount - recentBids[i].amount);
    const avgIncrement = increments.reduce((sum, inc) => sum + inc, 0) / increments.length;
    const timeSpan = (recentBids[0].createdAt.getTime() - recentBids[recentBids.length - 1].createdAt.getTime()) / (1000 * 60); // minutes
    const bidFrequency = recentBids.length / Math.max(timeSpan, 1);

    // Aggression score: higher increment and frequency = higher aggression
    return Math.min(1, (avgIncrement / 1000) + (bidFrequency / 10));
  }

  async calculateWalletStrengthRatio(userId: string, currentPrice: number): Promise<number> {
    // Assume user has balance in User model or Wallet
    // Placeholder: assume balance is stored
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const balance = (user as any).balance || 0; // Assume added to User
    return balance / currentPrice;
  }

  async calculateTimePressureFactor(auctionEndTime: Date): Promise<number> {
    const now = new Date();
    const totalDuration = 24 * 60 * 60 * 1000; // Assume 24 hours
    const remaining = auctionEndTime.getTime() - now.getTime();
    return Math.max(0, 1 - (remaining / totalDuration));
  }

  async calculateVolatilityScore(auctionId: string): Promise<number> {
    const bids = await this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'asc' },
    });

    if (bids.length < 5) return 0;

    const increments = bids.slice(1).map((bid, i) => bid.amount - bids[i].amount);
    const mean = increments.reduce((sum, inc) => sum + inc, 0) / increments.length;
    const variance = increments.reduce((sum, inc) => sum + Math.pow(inc - mean, 2), 0) / increments.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  async buildMLReadyVector(userId: string, auctionId: string, bidAmount: number): Promise<number[]> {
    const aggression = await this.calculateAggressionScore(userId);
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    const walletRatio = await this.calculateWalletStrengthRatio(userId, bidAmount);
    const timePressure = await this.calculateTimePressureFactor(auction.endTime);
    const volatility = await this.calculateVolatilityScore(auctionId);
    const competitors = await this.prisma.bid.groupBy({
      by: ['userId'],
      where: { auctionId },
      _count: true,
    });
    const numCompetitors = competitors.length;

    // Normalize
    const features = [aggression, walletRatio, timePressure, volatility, numCompetitors];
    const normalized = features.map(f => (f - 0) / (1 - 0)); // Simple min-max, adjust as needed

    return normalized;
  }

  async insertTrainingData(userId: string, auctionId: string, bidData: any, outcome: string) {
    await this.prisma.auctionTrainingData.create({
      data: {
        userId,
        auctionId,
        bidAmount: bidData.amount,
        previousBidAmount: bidData.previousAmount,
        bidIncrement: bidData.increment,
        timeRemainingSeconds: bidData.timeRemaining,
        totalAuctionDuration: bidData.totalDuration,
        walletBalance: bidData.walletBalance,
        walletToCurrentPriceRatio: bidData.walletRatio,
        userHistoricalWinRate: bidData.winRate,
        userAggressionScore: bidData.aggression,
        auctionVolatilityScore: bidData.volatility,
        numberOfCompetitors: bidData.competitors,
        wasHighestBid: bidData.wasHighest,
        finalOutcome: outcome,
      },
    });
  }
}
