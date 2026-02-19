import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum SubscriptionPlan {
  BASIC = 'basic',
  PRO = 'ai_pro',
  ELITE = 'ai_elite',
}

export interface SubscriptionFeatures {
  winProbability: boolean;
  autoBid: boolean;
  fraudDetection: boolean;
  sellerOptimization: boolean;
  voiceAI: boolean;
  customInsights: boolean;
}

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async validateFeature(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    return subscription?.plan === SubscriptionPlan.ELITE ||
           (subscription?.plan === SubscriptionPlan.PRO && ['winProbability', 'autoBid', 'fraudDetection'].includes(feature));
  }

  async getARPU(): Promise<number> {
    const subscriptions = await this.prisma.subscription.findMany();
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + this.getPlanPrice(sub.plan), 0);
    return totalRevenue / subscriptions.length;
  }

  private getPlanPrice(plan: SubscriptionPlan): number {
    switch (plan) {
      case SubscriptionPlan.BASIC: return 9;
      case SubscriptionPlan.PRO: return 29;
      case SubscriptionPlan.ELITE: return 99;
      default: return 0;
    }
  }
}
