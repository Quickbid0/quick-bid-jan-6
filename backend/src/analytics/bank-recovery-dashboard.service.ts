import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecoveryOptimizationAIService } from '../analytics/recovery-optimization-ai.service';

export interface BankRecoveryMetrics {
  totalAssets: number;
  totalBaseValue: number;
  totalRecoveredValue: number;
  recoveryPercentage: number;
  averageRecoveryPercentage: number;
  timeToRecovery: number; // days
  recoveryRate: number; // percentage of assets recovered
  portfolioHealth: 'excellent' | 'good' | 'fair' | 'poor';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecoveryPerformanceAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };
  financialMetrics: {
    totalInvestment: number;
    totalRecovery: number;
    netRecovery: number;
    recoveryEfficiency: number;
    averageAssetValue: number;
    bestPerformingAsset: {
      id: string;
      recoveryPercentage: number;
      timeToSell: number;
    };
  };
  operationalMetrics: {
    totalAssetsProcessed: number;
    averageTimeToList: number;
    averageTimeToSell: number;
    auctionSuccessRate: number;
    disputeRate: number;
  };
  marketInsights: {
    demandTrends: Array<{
      category: string;
      demandIndex: number;
      priceVolatility: number;
      recoveryRate: number;
    }>;
    regionalPerformance: Array<{
      region: string;
      assetsProcessed: number;
      recoveryRate: number;
      averageTimeToSell: number;
      marketShare: number;
    }>;
    competitiveAnalysis: {
      marketPosition: string;
      competitorComparison: Array<{
        competitor: string;
        theirRecoveryRate: number;
        ourRecoveryRate: number;
        advantage: number;
      }>;
    };
  };
  aiRecommendations: {
    reservePriceOptimization: {
      currentAverageReserve: number;
      recommendedReserve: number;
      expectedImprovement: number;
      confidence: number;
    };
    portfolioStrategy: {
      highValueFocus: boolean;
      quickLiquidation: boolean;
      regionalExpansion: string[];
      diversificationNeeds: string[];
    };
    operationalImprovements: string[];
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    mitigationStrategies: string[];
    complianceStatus: {
      regulatory: 'compliant' | 'warning' | 'breach';
      operational: 'compliant' | 'warning' | 'breach';
      financial: 'compliant' | 'warning' | 'breach';
    };
  };
}

export interface RecoveryHeatmapData {
  regions: Array<{
    name: string;
    recoveryRate: number;
    averageTimeToSell: number;
    assetVolume: number;
    color: string; // for visualization
    trend: 'improving' | 'stable' | 'declining';
    opportunityScore: number; // 0-100, higher = better opportunity
  }>;
  categories: Array<{
    name: string;
    recoveryRate: number;
    demandIndex: number;
    priceRange: {
      min: number;
      max: number;
      optimal: number;
    };
  }>;
  timeBasedTrends: Array<{
    period: string;
    recoveryRate: number;
    averagePrice: number;
    volume: number;
  }>;
}

@Injectable()
export class BankRecoveryDashboardService {
  private readonly logger = new Logger(BankRecoveryDashboardService.name);

  constructor(
    private prisma: PrismaService,
    private recoveryAIService: RecoveryOptimizationAIService,
  ) {}

  async getBankRecoveryMetrics(companyId: string): Promise<BankRecoveryMetrics> {
    this.logger.log(`Generating recovery metrics for bank/company: ${companyId}`);

    // Get all products (assets) for this company
    const assets = await this.prisma.product.findMany({
      where: { companyId },
    });

    const totalAssets = assets.length;
    const totalBaseValue = assets.reduce((sum, asset) => sum + asset.price, 0);

    // Calculate recovery metrics (simulated - would be based on actual auction results)
    const recoveredAssets = Math.floor(totalAssets * 0.78); // 78% recovery rate
    const averageRecoveryPercentage = 72.5; // 72.5% of base price recovered
    const totalRecoveredValue = totalBaseValue * (averageRecoveryPercentage / 100);
    const recoveryPercentage = (totalRecoveredValue / totalBaseValue) * 100;
    const timeToRecovery = 24.5; // days
    const recoveryRate = (recoveredAssets / totalAssets) * 100;

    // Determine portfolio health
    let portfolioHealth: 'excellent' | 'good' | 'fair' | 'poor';
    if (recoveryPercentage >= 75) portfolioHealth = 'excellent';
    else if (recoveryPercentage >= 65) portfolioHealth = 'good';
    else if (recoveryPercentage >= 55) portfolioHealth = 'fair';
    else portfolioHealth = 'poor';

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (recoveryPercentage >= 70 && recoveryRate >= 80) riskLevel = 'low';
    else if (recoveryPercentage >= 60 && recoveryRate >= 70) riskLevel = 'medium';
    else if (recoveryPercentage >= 50 && recoveryRate >= 60) riskLevel = 'high';
    else riskLevel = 'critical';

    return {
      totalAssets,
      totalBaseValue,
      totalRecoveredValue,
      recoveryPercentage,
      averageRecoveryPercentage,
      timeToRecovery,
      recoveryRate,
      portfolioHealth,
      riskLevel,
    };
  }

  async generateRecoveryPerformanceAnalysis(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RecoveryPerformanceAnalysis> {
    const period = {
      startDate,
      endDate,
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    };

    // Get financial metrics
    const financialMetrics = await this.calculateFinancialMetrics(companyId, startDate, endDate);

    // Get operational metrics
    const operationalMetrics = await this.calculateOperationalMetrics(companyId, startDate, endDate);

    // Get market insights
    const marketInsights = await this.generateMarketInsights(companyId);

    // Get AI recommendations
    const aiRecommendations = await this.recoveryAIService.getAIOptimizationRecommendations(companyId);

    // Get risk assessment
    const riskAssessment = await this.generateRiskAssessment(companyId);

    return {
      period,
      financialMetrics,
      operationalMetrics,
      marketInsights,
      aiRecommendations,
      riskAssessment,
    };
  }

  async getRecoveryHeatmapData(companyId: string): Promise<RecoveryHeatmapData> {
    // Generate regional performance data
    const regions = [
      {
        name: 'Delhi NCR',
        recoveryRate: 82.5,
        averageTimeToSell: 18.5,
        assetVolume: 1250,
        color: '#10B981', // green
        trend: 'improving' as const,
        opportunityScore: 85,
      },
      {
        name: 'Mumbai',
        recoveryRate: 79.2,
        averageTimeToSell: 22.1,
        assetVolume: 980,
        color: '#10B981',
        trend: 'stable' as const,
        opportunityScore: 78,
      },
      {
        name: 'Bangalore',
        recoveryRate: 76.8,
        averageTimeToSell: 19.7,
        assetVolume: 750,
        color: '#F59E0B', // yellow
        trend: 'improving' as const,
        opportunityScore: 82,
      },
      {
        name: 'Chennai',
        recoveryRate: 74.3,
        averageTimeToSell: 25.2,
        assetVolume: 620,
        color: '#F59E0B',
        trend: 'stable' as const,
        opportunityScore: 71,
      },
      {
        name: 'Hyderabad',
        recoveryRate: 77.9,
        averageTimeToSell: 21.8,
        assetVolume: 580,
        color: '#10B981',
        trend: 'improving' as const,
        opportunityScore: 79,
      },
      {
        name: 'Pune',
        recoveryRate: 72.1,
        averageTimeToSell: 28.3,
        assetVolume: 450,
        color: '#EF4444', // red
        trend: 'declining' as const,
        opportunityScore: 65,
      },
      {
        name: 'Kolkata',
        recoveryRate: 69.7,
        averageTimeToSell: 32.1,
        assetVolume: 380,
        color: '#EF4444',
        trend: 'stable' as const,
        opportunityScore: 58,
      },
    ];

    // Generate category performance data
    const categories = [
      {
        name: 'Luxury Cars',
        recoveryRate: 68.5,
        demandIndex: 45,
        priceRange: { min: 1500000, max: 5000000, optimal: 2500000 },
      },
      {
        name: 'Sedans',
        recoveryRate: 78.2,
        demandIndex: 72,
        priceRange: { min: 300000, max: 1200000, optimal: 650000 },
      },
      {
        name: 'SUVs',
        recoveryRate: 82.1,
        demandIndex: 85,
        priceRange: { min: 500000, max: 2000000, optimal: 950000 },
      },
      {
        name: 'Hatchbacks',
        recoveryRate: 76.8,
        demandIndex: 78,
        priceRange: { min: 200000, max: 800000, optimal: 425000 },
      },
      {
        name: 'Motorcycles',
        recoveryRate: 74.3,
        demandIndex: 82,
        priceRange: { min: 50000, max: 300000, optimal: 125000 },
      },
      {
        name: 'Commercial Vehicles',
        recoveryRate: 71.9,
        demandIndex: 55,
        priceRange: { min: 800000, max: 3000000, optimal: 1500000 },
      },
    ];

    // Generate time-based trends (last 12 months)
    const timeBasedTrends = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      timeBasedTrends.push({
        period: monthName,
        recoveryRate: 70 + Math.random() * 15, // 70-85%
        averagePrice: 600000 + Math.random() * 400000, // 6-10 lakh
        volume: 50 + Math.floor(Math.random() * 100), // 50-150 assets
      });
    }

    return {
      regions,
      categories,
      timeBasedTrends,
    };
  }

  async generateExecutiveSummary(companyId: string): Promise<{
    summary: string;
    keyAchievements: string[];
    challenges: string[];
    recommendations: string[];
    nextQuarterFocus: string[];
  }> {
    const metrics = await this.getBankRecoveryMetrics(companyId);

    const summary = `
      Executive Summary - Recovery Performance

      Portfolio Overview:
      - Total Assets Processed: ${metrics.totalAssets.toLocaleString()}
      - Total Investment: ₹${metrics.totalBaseValue.toLocaleString()}
      - Total Recovery: ₹${metrics.totalRecoveredValue.toLocaleString()}
      - Recovery Rate: ${metrics.recoveryPercentage.toFixed(1)}%

      Performance Metrics:
      - Average Recovery: ${metrics.averageRecoveryPercentage.toFixed(1)}% of base price
      - Average Time to Recovery: ${metrics.timeToRecovery.toFixed(1)} days
      - Asset Recovery Rate: ${metrics.recoveryRate.toFixed(1)}%
      - Portfolio Health: ${metrics.portfolioHealth.toUpperCase()}
      - Risk Level: ${metrics.riskLevel.toUpperCase()}
    `;

    const keyAchievements = [
      `Successfully recovered ₹${metrics.totalRecoveredValue.toLocaleString()} from repossessed assets`,
      `${metrics.recoveryRate.toFixed(1)}% of total assets liquidated within ${metrics.timeToRecovery.toFixed(1)} days average`,
      `Portfolio classified as ${metrics.portfolioHealth} health with ${metrics.riskLevel} risk exposure`,
      'Implemented AI-powered recovery optimization achieving above-market performance',
    ];

    const challenges = [
      'Market volatility affecting luxury vehicle recovery rates',
      'Regional demand variations requiring localized strategies',
      'Competition from traditional auction houses',
      'Documentation and compliance requirements for bank assets',
    ];

    const recommendations = [
      'Implement AI-driven reserve price optimization across all asset categories',
      'Expand operations to high-opportunity regions (Delhi NCR, Bangalore)',
      'Develop specialized strategies for luxury and commercial vehicle segments',
      'Strengthen dealer network partnerships for faster liquidation',
    ];

    const nextQuarterFocus = [
      'Launch AI-powered recovery optimization platform',
      'Expand regional presence to 15+ cities',
      'Implement automated valuation and pricing systems',
      'Develop bank-specific dashboard and reporting tools',
      'Establish strategic partnerships with authorized dealerships',
    ];

    return {
      summary: summary.trim(),
      keyAchievements,
      challenges,
      recommendations,
      nextQuarterFocus,
    };
  }

  // Private helper methods
  private async calculateFinancialMetrics(companyId: string, startDate: Date, endDate: Date) {
    // Mock financial calculations - would use actual transaction data
    const totalInvestment = 50000000; // ₹5 crore
    const totalRecovery = 36250000; // ₹3.625 crore
    const netRecovery = totalRecovery - (totalInvestment * 0.025); // Subtract fees
    const recoveryEfficiency = (netRecovery / totalInvestment) * 100;

    return {
      totalInvestment,
      totalRecovery,
      netRecovery,
      recoveryEfficiency,
      averageAssetValue: 625000, // ₹6.25 lakh
      bestPerformingAsset: {
        id: 'asset_001',
        recoveryPercentage: 92.5,
        timeToSell: 12,
      },
    };
  }

  private async calculateOperationalMetrics(companyId: string, startDate: Date, endDate: Date) {
    return {
      totalAssetsProcessed: 800,
      averageTimeToList: 2.3, // days
      averageTimeToSell: 21.7, // days
      auctionSuccessRate: 78.5, // percentage
      disputeRate: 3.2, // percentage
    };
  }

  private async generateMarketInsights(companyId: string) {
    const demandTrends = [
      { category: 'SUVs', demandIndex: 85, priceVolatility: 8.5, recoveryRate: 82.1 },
      { category: 'Sedans', demandIndex: 72, priceVolatility: 12.3, recoveryRate: 78.2 },
      { category: 'Hatchbacks', demandIndex: 78, priceVolatility: 6.7, recoveryRate: 76.8 },
      { category: 'Luxury', demandIndex: 45, priceVolatility: 18.9, recoveryRate: 68.5 },
      { category: 'Commercial', demandIndex: 55, priceVolatility: 14.2, recoveryRate: 71.9 },
    ];

    const regionalPerformance = [
      { region: 'Delhi NCR', assetsProcessed: 180, recoveryRate: 82.5, averageTimeToSell: 18.5, marketShare: 22.5 },
      { region: 'Mumbai', assetsProcessed: 145, recoveryRate: 79.2, averageTimeToSell: 22.1, marketShare: 18.1 },
      { region: 'Bangalore', assetsProcessed: 120, recoveryRate: 76.8, averageTimeToSell: 19.7, marketShare: 15.0 },
      { region: 'Chennai', assetsProcessed: 98, recoveryRate: 74.3, averageTimeToSell: 25.2, marketShare: 12.3 },
      { region: 'Hyderabad', assetsProcessed: 85, recoveryRate: 77.9, averageTimeToSell: 21.8, marketShare: 10.6 },
    ];

    const competitiveAnalysis = {
      marketPosition: 'Market Leader',
      competitorComparison: [
        { competitor: 'ABC Auctions', theirRecoveryRate: 65.2, ourRecoveryRate: 78.5, advantage: 13.3 },
        { competitor: 'XYZ Liquidators', theirRecoveryRate: 71.8, ourRecoveryRate: 78.5, advantage: 6.7 },
        { competitor: 'Traditional Banks', theirRecoveryRate: 58.9, ourRecoveryRate: 78.5, advantage: 19.6 },
      ],
    };

    return {
      demandTrends,
      regionalPerformance,
      competitiveAnalysis,
    };
  }

  private async generateRiskAssessment(companyId: string) {
    // Mock risk assessment
    const riskFactors = [
      'Market volatility in luxury vehicle segment',
      'Regional demand variations',
      'Competition from established players',
      'Documentation compliance requirements',
    ];

    const mitigationStrategies = [
      'Diversify asset portfolio across categories',
      'Implement AI-driven pricing optimization',
      'Strengthen regional presence and partnerships',
      'Enhance compliance monitoring and reporting',
    ];

    return {
      overallRisk: 'medium' as const,
      riskFactors,
      mitigationStrategies,
      complianceStatus: {
        regulatory: 'compliant' as const,
        operational: 'compliant' as const,
        financial: 'compliant' as const,
      },
    };
  }
}
