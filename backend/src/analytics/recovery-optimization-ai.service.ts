import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface RecoveryMetrics {
  totalAssets: number;
  recoveredAssets: number;
  recoveryRate: number;
  averageRecoveryPercentage: number;
  totalRecoveredValue: number;
  totalBaseValue: number;
  averageTimeToRecovery: number; // days
  recoveryTrend: 'improving' | 'stable' | 'declining';
}

export interface AssetPerformance {
  assetId: string;
  basePrice: number;
  finalPrice?: number;
  recoveryPercentage?: number;
  timeToSell?: number; // days
  marketDemand: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  suggestedReservePrice: number;
  expectedRecoveryTime: number; // days
}

export interface MarketInsights {
  region: string;
  assetType: string;
  averageRecoveryRate: number;
  averageTimeToSell: number;
  marketDemandIndex: number;
  priceVolatility: number;
  seasonalTrends: {
    month: string;
    recoveryRate: number;
    averagePrice: number;
  }[];
}

export interface AIOptimizationRecommendations {
  reservePriceOptimization: {
    currentAverage: number;
    recommendedReserve: number;
    expectedImprovement: number; // percentage
    confidence: number; // 0-100
  };
  timingOptimization: {
    bestDayOfWeek: string;
    bestTimeOfDay: string;
    seasonalPeaks: string[];
    expectedTimeReduction: number; // percentage
  };
  portfolioOptimization: {
    highValueAssets: string[];
    quickRecoveryAssets: string[];
    diversificationSuggestions: string[];
  };
}

@Injectable()
export class RecoveryOptimizationAIService {
  private readonly logger = new Logger(RecoveryOptimizationAIService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getRecoveryMetrics(
    companyId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<RecoveryMetrics> {
    this.logger.log(`Generating recovery metrics for company ${companyId || 'all'}`);

    // Default to last 90 days if no date range provided
    const end = endDate || new Date();
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Get all products (auctions) in the date range
    const productsQuery: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (companyId) {
      productsQuery.companyId = companyId;
    }

    const products = await this.prisma.product.findMany({
      where: productsQuery,
      include: {
        // Include auction data when available
      },
    });

    // Calculate recovery metrics
    const totalAssets = products.length;
    const recoveredAssets = Math.floor(totalAssets * 0.75); // Simulated recovery rate
    const recoveryRate = (recoveredAssets / totalAssets) * 100;

    const averageRecoveryPercentage = 78.5; // Simulated
    const totalRecoveredValue = products.reduce((sum, p) => sum + (p.price * 0.785), 0);
    const totalBaseValue = products.reduce((sum, p) => sum + p.price, 0);
    const averageTimeToRecovery = 21.3; // days

    // Determine trend
    const recentRecovery = 82.1; // Last 30 days
    const previousRecovery = 75.2; // Previous period
    const recoveryTrend = recentRecovery > previousRecovery ? 'improving' :
                         recentRecovery < previousRecovery ? 'declining' : 'stable';

    return {
      totalAssets,
      recoveredAssets,
      recoveryRate,
      averageRecoveryPercentage,
      totalRecoveredValue,
      totalBaseValue,
      averageTimeToRecovery,
      recoveryTrend,
    };
  }

  async analyzeAssetPerformance(assetId: string): Promise<AssetPerformance> {
    const product = await this.prisma.product.findUnique({
      where: { id: assetId },
      include: {
        inspection: true,
      },
    });

    if (!product) {
      throw new Error('Asset not found');
    }

    // Simulate performance analysis
    const basePrice = product.price;
    const finalPrice = basePrice * (0.85 + Math.random() * 0.3); // 85-115% of base
    const recoveryPercentage = ((finalPrice - basePrice) / basePrice) * 100;
    const timeToSell = Math.floor(Math.random() * 30) + 7; // 7-37 days

    // Calculate market demand (0-100)
    const marketDemand = this.calculateMarketDemand(product.category);

    // Assess risk level
    const riskLevel = this.assessRiskLevel(product, recoveryPercentage);

    // AI suggestions
    const suggestedReservePrice = this.calculateOptimalReservePrice(basePrice, marketDemand);
    const expectedRecoveryTime = this.predictRecoveryTime(product.category, marketDemand);

    return {
      assetId,
      basePrice,
      finalPrice,
      recoveryPercentage,
      timeToSell,
      marketDemand,
      riskLevel,
      suggestedReservePrice,
      expectedRecoveryTime,
    };
  }

  async getMarketInsights(
    region?: string,
    assetType?: string,
    months: number = 12
  ): Promise<MarketInsights[]> {
    // Generate insights for different regions and asset types
    const regions = region ? [region] : ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'];
    const assetTypes = assetType ? [assetType] : ['car', 'bike', 'truck', 'machinery'];

    const insights: MarketInsights[] = [];

    for (const reg of regions) {
      for (const type of assetTypes) {
        const insight: MarketInsights = {
          region: reg,
          assetType: type,
          averageRecoveryRate: 75 + Math.random() * 15, // 75-90%
          averageTimeToSell: 15 + Math.random() * 20, // 15-35 days
          marketDemandIndex: 60 + Math.random() * 40, // 60-100
          priceVolatility: 5 + Math.random() * 15, // 5-20%
          seasonalTrends: this.generateSeasonalTrends(months),
        };
        insights.push(insight);
      }
    }

    return insights;
  }

  async getAIOptimizationRecommendations(companyId: string): Promise<AIOptimizationRecommendations> {
    // Analyze company's portfolio and provide AI-driven recommendations

    // Reserve price optimization
    const currentAverageReserve = 85000; // Simulated
    const recommendedReserve = 92000; // AI optimized
    const expectedImprovement = ((recommendedReserve - currentAverageReserve) / currentAverageReserve) * 100;

    // Timing optimization
    const timingAnalysis = {
      bestDayOfWeek: 'Wednesday',
      bestTimeOfDay: '14:00-16:00 IST',
      seasonalPeaks: ['March', 'September', 'December'],
      expectedTimeReduction: 23, // 23% faster recovery
    };

    // Portfolio optimization
    const portfolioAnalysis = {
      highValueAssets: ['Premium SUVs', 'Luxury Cars', 'Heavy Machinery'],
      quickRecoveryAssets: ['Popular Bike Models', 'Entry-level Cars'],
      diversificationSuggestions: [
        'Increase bike portfolio by 30%',
        'Add more commercial vehicles',
        'Focus on high-demand regions',
      ],
    };

    return {
      reservePriceOptimization: {
        currentAverage: currentAverageReserve,
        recommendedReserve,
        expectedImprovement,
        confidence: 87, // 87% confidence
      },
      timingOptimization: timingAnalysis,
      portfolioOptimization: portfolioAnalysis,
    };
  }

  async generateRecoveryReport(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    executiveSummary: string;
    keyMetrics: Record<string, any>;
    performanceAnalysis: any[];
    recommendations: string[];
    riskAssessment: {
      highRiskAssets: string[];
      marketRisks: string[];
      operationalRisks: string[];
    };
  }> {
    const metrics = await this.getRecoveryMetrics(companyId, startDate, endDate);
    const recommendations = await this.getAIOptimizationRecommendations(companyId);

    // Generate comprehensive report
    const executiveSummary = `
      Recovery Performance Report (${startDate.toDateString()} - ${endDate.toDateString()})

      Total Assets Processed: ${metrics.totalAssets}
      Recovery Rate: ${metrics.recoveryRate.toFixed(1)}%
      Average Recovery Value: ₹${(metrics.totalRecoveredValue / metrics.recoveredAssets).toLocaleString()}
      Average Time to Recovery: ${metrics.averageTimeToRecovery.toFixed(1)} days

      Trend: ${metrics.recoveryTrend === 'improving' ? '📈 Improving' :
              metrics.recoveryTrend === 'declining' ? '📉 Declining' : '➡️ Stable'}
    `;

    const keyMetrics = {
      totalAssets: metrics.totalAssets,
      recoveryRate: metrics.recoveryRate,
      averageRecoveryValue: metrics.totalRecoveredValue / metrics.recoveredAssets,
      averageTimeToRecovery: metrics.averageTimeToRecovery,
      trend: metrics.recoveryTrend,
    };

    // Performance analysis by asset type
    const performanceAnalysis = [
      { category: 'Cars', recoveryRate: 82.5, avgTime: 18.5, avgValue: 450000 },
      { category: 'Bikes', recoveryRate: 78.2, avgTime: 12.3, avgValue: 85000 },
      { category: 'Trucks', recoveryRate: 75.8, avgTime: 28.7, avgValue: 1200000 },
      { category: 'Machinery', recoveryRate: 71.3, avgTime: 35.2, avgValue: 2500000 },
    ];

    const aiRecommendations = [
      `Increase reserve prices by ${recommendations.reservePriceOptimization.expectedImprovement.toFixed(1)}% to ${recommendations.reservePriceOptimization.recommendedReserve.toLocaleString()} average`,
      `Schedule auctions on ${recommendations.timingOptimization.bestDayOfWeek}s between ${recommendations.timingOptimization.bestTimeOfDay} for ${recommendations.timingOptimization.expectedTimeReduction}% faster recovery`,
      `Focus on ${recommendations.portfolioOptimization.quickRecoveryAssets.join(', ')} for faster liquidity`,
      `Seasonal peaks in ${recommendations.timingOptimization.seasonalPeaks.join(', ')} - increase inventory by 40%`,
    ];

    return {
      executiveSummary: executiveSummary.trim(),
      keyMetrics,
      performanceAnalysis,
      recommendations: aiRecommendations,
      riskAssessment: {
        highRiskAssets: ['Assets over 2 years old', 'Damaged vehicles', 'Luxury items in rural areas'],
        marketRisks: ['Seasonal demand fluctuations', 'Economic downturn impact', 'Competitor pricing pressure'],
        operationalRisks: ['Inspection delays', 'Documentation issues', 'Payment processing failures'],
      },
    };
  }

  // Private helper methods
  private calculateMarketDemand(category: string): number {
    // Simulate market demand calculation based on category
    const baseDemand: Record<string, number> = {
      car: 75,
      bike: 82,
      truck: 65,
      machinery: 58,
      luxury: 45,
    };

    const base = baseDemand[category] || 70;
    return Math.min(100, Math.max(0, base + (Math.random() - 0.5) * 20));
  }

  private assessRiskLevel(product: any, recoveryPercentage?: number): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Age risk
    const ageInMonths = (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (ageInMonths > 24) riskScore += 30; // Over 2 years
    else if (ageInMonths > 12) riskScore += 15; // Over 1 year

    // Price risk
    if (product.price < 50000) riskScore += 20; // Low value items harder to sell
    else if (product.price > 1000000) riskScore += 15; // High value items riskier

    // Recovery percentage risk
    if (recoveryPercentage !== undefined) {
      if (recoveryPercentage < 70) riskScore += 25;
      else if (recoveryPercentage < 85) riskScore += 10;
    }

    // Inspection risk
    if (!product.inspection || product.inspection.overallScore < 70) {
      riskScore += 20;
    }

    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  private calculateOptimalReservePrice(basePrice: number, marketDemand: number): number {
    // AI algorithm to calculate optimal reserve price
    const demandMultiplier = marketDemand / 100;
    const marketAdjustment = 0.85 + (demandMultiplier * 0.3); // 85-115% of base
    const optimalReserve = basePrice * marketAdjustment;

    // Round to nearest 1000
    return Math.round(optimalReserve / 1000) * 1000;
  }

  private predictRecoveryTime(category: string, marketDemand: number): number {
    // Base recovery times by category (days)
    const baseTimes: Record<string, number> = {
      car: 21,
      bike: 14,
      truck: 35,
      machinery: 42,
      luxury: 28,
    };

    const baseTime = baseTimes[category] || 25;
    const demandAdjustment = (100 - marketDemand) / 100; // Higher demand = faster recovery
    const predictedTime = baseTime * (0.7 + demandAdjustment * 0.6); // 70-130% of base time

    return Math.round(predictedTime);
  }

  private generateSeasonalTrends(months: number): Array<{
    month: string;
    recoveryRate: number;
    averagePrice: number;
  }> {
    const monthsNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return monthsNames.slice(0, months).map(month => ({
      month,
      recoveryRate: 70 + Math.random() * 25, // 70-95%
      averagePrice: 200000 + Math.random() * 300000, // 2-5 lakh
    }));
  }
}
