// 🎯 PHASE 3: RETENTION & SCALE SIGNALS
// src/services/phase3Retention.service.ts

export interface NorthStarMetric {
  type: 'repeat_transaction_rate';
  target: 'buyers' | 'sellers';
  threshold: number; // percentage
  timeframe: number; // days
  current: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  status: 'on_track' | 'needs_attention' | 'critical';
}

export interface CoreLoopMetrics {
  buyerLoop: {
    auctionDiscovery: {
      completionRate: number;
      averageTime: number; // minutes
      dropOffPoints: string[];
    };
    bidPlaced: {
      successRate: number;
      averageTime: number; // minutes
      uncertaintyLevel: number; // 0-100 scale
    };
    outcomeClear: {
      clarityScore: number; // 0-100 scale
      winnerConfirmationRate: number;
      loserNotificationRate: number;
    };
    walletUpdated: {
      updateSuccessRate: number;
      clarityScore: number;
      timeToDisplay: number; // seconds
    };
    return: {
      returnRate: number;
      timeToReturn: number; // days
      uncertaintyLevel: number;
    };
  };
  sellerLoop: {
    auctionCreated: {
      successRate: number;
      averageTime: number; // minutes
      uncertaintyLevel: number;
    };
    bidsReceived: {
      averageBidsPerAuction: number;
      bidQualityScore: number;
      timeToFirstBid: number; // hours
    };
    saleCompleted: {
      completionRate: number;
      averageSalePrice: number;
      sellerSatisfaction: number;
    };
    earningsVisible: {
      clarityScore: number;
      displayAccuracy: number;
      updateTimeliness: number; // minutes
    };
    return: {
      returnRate: number;
      timeToNextAuction: number; // days
      confidenceLevel: number;
    };
  };
}

export interface WeeklyRetentionMetrics {
  weekNumber: number;
  year: number;
  northStar: NorthStarMetric;
  coreLoops: CoreLoopMetrics;
  trust: {
    verifiedSellerCompletionRate: number;
    disputesPer100Auctions: number;
    disputeResolutionRate: number;
    trustScoreTrend: 'improving' | 'declining' | 'stable';
  };
  revenue: {
    revenuePerCompletedAuction: number;
    commissionDropOffRate: number;
    averageOrderValue: number;
    revenueGrowthRate: number;
  };
  retention: {
    repeatBidderRate: number;
    repeatSellerRate: number;
    timeBetweenFirstAndSecondAction: {
      buyers: number; // days
      sellers: number; // days
    };
    userRetentionRate: number;
  };
  insights: Phase3Insight[];
  recommendations: Phase3Recommendation[];
}

export interface Phase3Insight {
  category: 'positive' | 'concern' | 'opportunity';
  loop: 'buyer' | 'seller' | 'both';
  step: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data?: any;
  urgency: 'immediate' | 'this_week' | 'next_week';
}

export interface Phase3Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'core_loop' | 'trust' | 'revenue' | 'retention';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  type: 'clarity_improvement' | 'trust_enhancement' | 'revenue_optimization' | 'retention_boost';
}

export interface UncertaintyMeasurement {
  step: string;
  uncertaintyLevel: number; // 0-100
  uncertaintyFactors: string[];
  clarityScore: number; // 0-100
  userFeedback: {
    confused: number;
    uncertain: number;
    confident: number;
  };
}

export class Phase3RetentionService {
  private weeklyMetrics: Map<string, WeeklyRetentionMetrics> = new Map();
  private northStarMetric: NorthStarMetric = {
    type: 'repeat_transaction_rate',
    target: 'buyers',
    threshold: 0.8,
    timeframe: 30,
    current: 0,
    trend: 'stable',
    status: 'on_track'
  };
  private uncertaintyMeasurements: Map<string, UncertaintyMeasurement[]> = new Map();

  constructor() {
    this.initializePhase3Tracking();
  }

  // Initialize Phase 3 tracking
  private initializePhase3Tracking(): void {
    // Set North Star Metric - Repeat Transaction Rate
    this.northStarMetric = {
      type: 'repeat_transaction_rate',
      target: 'buyers', // Can be switched to sellers based on data
      threshold: 30, // 30% repeat rate target
      timeframe: 14, // 14 days
      current: 0,
      trend: 'stable',
      status: 'needs_attention'
    };

    // Load from localStorage (will be replaced with backend API)
    const savedMetrics = localStorage.getItem('phase3WeeklyMetrics');
    if (savedMetrics) {
      const metrics = JSON.parse(savedMetrics);
      metrics.forEach((metric: WeeklyRetentionMetrics) => {
        this.weeklyMetrics.set(`${metric.weekNumber}-${metric.year}`, metric);
      });
    }

    const savedUncertainty = localStorage.getItem('uncertaintyMeasurements');
    if (savedUncertainty) {
      const uncertainty = JSON.parse(savedUncertainty);
      uncertainty.forEach((measurements: UncertaintyMeasurement[], key: string) => {
        this.uncertaintyMeasurements.set(key, measurements);
      });
    }
  }

  // THE SINGLE QUESTION: "Will users return and transact again without incentives?"
  answerTheSingleQuestion(): {
    answer: boolean;
    confidence: number;
    data: {
      repeatTransactionRate: number;
      incentiveDependency: number;
      organicReturnRate: number;
    };
    reasoning: string;
  } {
    const currentMetrics = this.calculateCurrentMetrics();
    
    const repeatTransactionRate = currentMetrics.retention.repeatBidderRate;
    const organicReturnRate = this.calculateOrganicReturnRate();
    const incentiveDependency = this.calculateIncentiveDependency();
    
    // Users will return without incentives if:
    // - Repeat transaction rate >= 30%
    // - Organic return rate >= 25%
    // - Incentive dependency <= 20%
    
    const willReturn = repeatTransactionRate >= 30 && organicReturnRate >= 25 && incentiveDependency <= 20;
    const confidence = Math.min(
      (repeatTransactionRate / 30) * 0.4 +
      (organicReturnRate / 25) * 0.4 +
      ((100 - incentiveDependency) / 80) * 0.2,
      100
    );

    let reasoning = '';
    if (willReturn) {
      reasoning = 'Users are returning organically with strong repeat transaction rates and low incentive dependency.';
    } else {
      reasoning = 'Users are not returning organically - need to improve core loops and reduce uncertainty.';
    }

    return {
      answer: willReturn,
      confidence,
      data: {
        repeatTransactionRate,
        incentiveDependency,
        organicReturnRate
      },
      reasoning
    };
  }

  // Calculate North Star Metric
  calculateNorthStarMetric(): NorthStarMetric {
    const currentMetrics = this.calculateCurrentMetrics();
    
    // Choose buyers or sellers based on which has better retention
    const buyerRate = currentMetrics.retention.repeatBidderRate;
    const sellerRate = currentMetrics.retention.repeatSellerRate;
    
    const target = buyerRate >= sellerRate ? 'buyers' : 'sellers';
    const current = target === 'buyers' ? buyerRate : sellerRate;
    
    // Calculate trend (simplified - would use historical data)
    const trend = current >= this.northStarMetric.current ? 'increasing' : 'decreasing';
    
    // Determine status
    let status: 'on_track' | 'needs_attention' | 'critical';
    if (current >= this.northStarMetric.threshold) {
      status = 'on_track';
    } else if (current >= this.northStarMetric.threshold * 0.7) {
      status = 'needs_attention';
    } else {
      status = 'critical';
    }

    this.northStarMetric = {
      ...this.northStarMetric,
      target,
      current,
      trend,
      status
    };

    return this.northStarMetric;
  }

  // Tighten the Core Loop - Buyer Loop
  tightenBuyerLoop(): {
    auctionDiscovery: {
      completionRate: number;
      averageTime: number;
      dropOffPoints: string[];
    };
    bidPlaced: {
      successRate: number;
      averageTime: number;
      uncertaintyLevel: number;
    };
    outcomeClear: {
      clarityScore: number;
      winnerConfirmationRate: number;
      loserNotificationRate: number;
    };
    walletUpdated: {
      updateSuccessRate: number;
      clarityScore: number;
      timeToDisplay: number;
    };
    return: {
      returnRate: number;
      timeToReturn: number;
      uncertaintyLevel: number;
    };
  } {
    // Get buyer activity data
    const buyerActivities = this.getBuyerActivities();
    
    // Calculate metrics for each step
    const auctionDiscovery = this.calculateAuctionDiscoveryMetrics(buyerActivities);
    const bidPlaced = this.calculateBidPlacedMetrics(buyerActivities);
    const outcomeClear = this.calculateOutcomeClarityMetrics(buyerActivities);
    const walletUpdated = this.calculateWalletUpdatedMetrics(buyerActivities);
    const returnMetrics = this.calculateBuyerReturnMetrics(buyerActivities);

    return {
      auctionDiscovery,
      bidPlaced,
      outcomeClear,
      walletUpdated,
      return: returnMetrics
    };
  }

  // Tighten the Core Loop - Seller Loop
  tightenSellerLoop(): {
    auctionCreated: {
      successRate: number;
      averageTime: number;
      uncertaintyLevel: number;
    };
    bidsReceived: {
      averageBidsPerAuction: number;
      bidQualityScore: number;
      timeToFirstBid: number;
    };
    saleCompleted: {
      completionRate: number;
      averageSalePrice: number;
      sellerSatisfaction: number;
    };
    earningsVisible: {
      clarityScore: number;
      displayAccuracy: number;
      updateTimeliness: number;
    };
    return: {
      returnRate: number;
      timeToNextAuction: number;
      confidenceLevel: number;
    };
  } {
    // Get seller activity data
    const sellerActivities = this.getSellerActivities();
    
    // Calculate metrics for each step
    const auctionCreated = this.calculateAuctionCreatedMetrics(sellerActivities);
    const bidsReceived = this.calculateBidsReceivedMetrics(sellerActivities);
    const saleCompleted = this.calculateSaleCompletedMetrics(sellerActivities);
    const earningsVisible = this.calculateEarningsVisibleMetrics(sellerActivities);
    const returnMetrics = this.calculateSellerReturnMetrics(sellerActivities);

    return {
      auctionCreated,
      bidsReceived,
      saleCompleted,
      earningsVisible,
      return: returnMetrics
    };
  }

  // Measure uncertainty at each step
  measureUncertainty(step: string, userType: 'buyer' | 'seller'): UncertaintyMeasurement {
    const key = `${userType}-${step}`;
    const existingMeasurements = this.uncertaintyMeasurements.get(key) || [];
    
    // Calculate uncertainty based on:
    // 1. User feedback (confusion, trust concerns, pricing doubts)
    // 2. Time spent on step (longer = more uncertain)
    // 3. Error rates (higher = more uncertain)
    // 4. Drop-off rates (higher = more uncertain)
    
    const userFeedback = this.getUserFeedbackForStep(step, userType);
    const timeMetrics = this.getTimeMetricsForStep(step, userType);
    const errorRates = this.getErrorRatesForStep(step, userType);
    const dropOffRates = this.getDropOffRatesForStep(step, userType);
    
    // Calculate uncertainty level (0-100)
    const uncertaintyLevel = Math.min(
      (userFeedback.confused * 0.4) +
      (userFeedback.uncertain * 0.3) +
      (timeMetrics.averageTime / 10) * 0.1 +
      (errorRates * 0.1) +
      (dropOffRates * 0.1),
      100
    );
    
    // Calculate clarity score (inverse of uncertainty)
    const clarityScore = 100 - uncertaintyLevel;
    
    // Identify uncertainty factors
    const uncertaintyFactors = this.identifyUncertaintyFactors(step, userType, {
      userFeedback,
      timeMetrics,
      errorRates,
      dropOffRates
    });

    const measurement: UncertaintyMeasurement = {
      step,
      uncertaintyLevel,
      uncertaintyFactors,
      clarityScore,
      userFeedback
    };

    // Store measurement
    existingMeasurements.push(measurement);
    this.uncertaintyMeasurements.set(key, existingMeasurements);
    
    // Save to localStorage
    const allMeasurements = Array.from(this.uncertaintyMeasurements.entries()).flatMap(([key, measurements]) => 
      measurements.map(m => ({ ...m, key }))
    );
    localStorage.setItem('uncertaintyMeasurements', JSON.stringify(allMeasurements));

    return measurement;
  }

  // Generate weekly Phase 3 report
  generateWeeklyReport(weekNumber?: number, year?: number): WeeklyRetentionMetrics {
    const now = new Date();
    const currentWeekNumber = weekNumber || this.getWeekNumber(now);
    const currentYear = year || now.getFullYear();
    
    const { startDate, endDate } = this.getWeekDates(currentWeekNumber, currentYear);
    
    console.log(`🎯 Generating Phase 3 report for week ${currentWeekNumber}, ${currentYear}`);

    // Calculate North Star Metric
    const northStar = this.calculateNorthStarMetric();

    // Calculate Core Loop Metrics
    const coreLoops = {
      buyerLoop: this.tightenBuyerLoop(),
      sellerLoop: this.tightenSellerLoop()
    };

    // Calculate Trust Metrics
    const trust = this.calculateTrustMetrics();

    // Calculate Revenue Metrics
    const revenue = this.calculateRevenueMetrics();

    // Calculate Retention Metrics
    const retention = this.calculateRetentionMetrics();

    // Generate insights
    const insights = this.generatePhase3Insights(northStar, coreLoops, trust, revenue, retention);

    // Generate recommendations
    const recommendations = this.generatePhase3Recommendations(northStar, coreLoops, trust, revenue, retention, insights);

    const metrics: WeeklyRetentionMetrics = {
      weekNumber: currentWeekNumber,
      year: currentYear,
      northStar,
      coreLoops,
      trust,
      revenue,
      retention,
      insights,
      recommendations
    };

    // Store metrics
    this.weeklyMetrics.set(`${currentWeekNumber}-${currentYear}`, metrics);
    
    // Save to localStorage
    const allMetrics = Array.from(this.weeklyMetrics.values());
    localStorage.setItem('phase3WeeklyMetrics', JSON.stringify(allMetrics));

    console.log('🎯 Phase 3 report generated:', metrics.weekNumber, metrics.weekNumber, metrics.year);
    
    return metrics;
  }

  // Check if ready for Phase 4
  readyForPhase4(): {
    ready: boolean;
    criteria: {
      repeatUsage: boolean;
      revenueGrowth: boolean;
      lowDisputes: boolean;
      clearFeedback: boolean;
    };
    summary: string;
    nextSteps: string[];
  } {
    const currentMetrics = this.calculateCurrentMetrics();
    
    const criteria = {
      repeatUsage: currentMetrics.retention.repeatBidderRate >= 30 || currentMetrics.retention.repeatSellerRate >= 30,
      revenueGrowth: currentMetrics.revenue.revenueGrowthRate >= 10, // 10% weekly growth
      lowDisputes: currentMetrics.trust.disputesPer100Auctions <= 3,
      clearFeedback: this.hasClearFeedbackPattern()
    };

    const ready = Object.values(criteria).every(c => c);
    
    let summary = '';
    if (ready) {
      summary = '✅ Ready for Phase 4: Growth & Expansion';
    } else {
      summary = '⚠️ Continue Phase 3: Need to improve core loops and retention';
    }

    const nextSteps = ready ? [
      'Begin Phase 4: Growth & Expansion',
      'Add new features based on user patterns',
      'Scale infrastructure based on demand',
      'Expand to new markets or segments'
    ] : [
      'Focus on core loop improvements',
      'Reduce uncertainty in key steps',
      'Improve trust and safety signals',
      'Increase repeat usage rates'
    ];

    return {
      ready,
      criteria,
      summary,
      nextSteps
    };
  }

  // Private helper methods
  private calculateCurrentMetrics(): WeeklyRetentionMetrics {
    // This would calculate current metrics from real data
    // For now, return placeholder values
    return {
      weekNumber: this.getWeekNumber(new Date()),
      year: new Date().getFullYear(),
      northStar: this.northStarMetric,
      coreLoops: {
        buyerLoop: this.tightenBuyerLoop(),
        sellerLoop: this.tightenSellerLoop()
      },
      trust: this.calculateTrustMetrics(),
      revenue: this.calculateRevenueMetrics(),
      retention: this.calculateRetentionMetrics(),
      insights: [],
      recommendations: []
    };
  }

  private calculateTrustMetrics() {
    return {
      verifiedSellerCompletionRate: 85,
      disputesPer100Auctions: 2.5,
      disputeResolutionRate: 92,
      trustScoreTrend: 'improving' as const
    };
  }

  private calculateRevenueMetrics() {
    return {
      revenuePerCompletedAuction: 15.50,
      commissionDropOffRate: 8,
      averageOrderValue: 125.00,
      revenueGrowthRate: 12
    };
  }

  private calculateRetentionMetrics() {
    return {
      repeatBidderRate: 28,
      repeatSellerRate: 22,
      timeBetweenFirstAndSecondAction: {
        buyers: 7,
        sellers: 14
      },
      userRetentionRate: 65
    };
  }

  private generatePhase3Insights(northStar: NorthStarMetric, coreLoops: CoreLoopMetrics, trust: any, revenue: any, retention: any): Phase3Insight[] {
    const insights: Phase3Insight[] = [];

    // North Star insights
    if (northStar.status === 'critical') {
      insights.push({
        category: 'concern',
        loop: 'both',
        step: 'north_star',
        title: 'Critical: Low Repeat Transaction Rate',
        description: `Repeat transaction rate is ${northStar.current.toFixed(1)}%, below target of ${northStar.threshold}%`,
        impact: 'high',
        data: { current: northStar.current, target: northStar.threshold },
        urgency: 'immediate'
      });
    }

    // Core loop insights
    if (coreLoops.buyerLoop.bidPlaced.uncertaintyLevel > 70) {
      insights.push({
        category: 'concern',
        loop: 'buyer',
        step: 'bid_placed',
        title: 'High Uncertainty in Bidding',
        description: `Buyers show ${coreLoops.buyerLoop.bidPlaced.uncertaintyLevel}% uncertainty when placing bids`,
        impact: 'high',
        data: { uncertaintyLevel: coreLoops.buyerLoop.bidPlaced.uncertaintyLevel },
        urgency: 'this_week'
      });
    }

    if (coreLoops.sellerLoop.auctionCreated.uncertaintyLevel > 70) {
      insights.push({
        category: 'concern',
        loop: 'seller',
        step: 'auction_created',
        title: 'High Uncertainty in Auction Creation',
        description: `Sellers show ${coreLoops.sellerLoop.auctionCreated.uncertaintyLevel}% uncertainty when creating auctions`,
        impact: 'high',
        data: { uncertaintyLevel: coreLoops.sellerLoop.auctionCreated.uncertaintyLevel },
        urgency: 'this_week'
      });
    }

    return insights;
  }

  private generatePhase3Recommendations(northStar: NorthStarMetric, coreLoops: CoreLoopMetrics, trust: any, revenue: any, retention: any, insights: Phase3Insight[]): Phase3Recommendation[] {
    const recommendations: Phase3Recommendation[] = [];

    // Based on North Star metric
    if (northStar.status === 'critical') {
      recommendations.push({
        priority: 'critical',
        category: 'retention',
        title: 'Improve Core Loop Experience',
        description: 'Focus on reducing uncertainty and improving clarity in core user journeys',
        expectedImpact: 'Increase repeat transaction rate by 15%',
        effort: 'high',
        timeframe: '2-3 weeks',
        type: 'clarity_improvement'
      });
    }

    // Based on uncertainty measurements
    const highUncertaintySteps = Array.from(this.uncertaintyMeasurements.values())
      .flat()
      .filter(m => m.uncertaintyLevel > 70);

    highUncertaintySteps.forEach(step => {
      recommendations.push({
        priority: 'high',
        category: 'core_loop',
        title: `Reduce Uncertainty in ${step.step}`,
        description: `Address uncertainty factors: ${step.uncertaintyFactors.join(', ')}`,
        expectedImpact: `Reduce uncertainty by 30% in ${step.step}`,
        effort: 'medium',
        timeframe: '1-2 weeks',
        type: 'clarity_improvement'
      });
    });

    return recommendations;
  }

  // Placeholder methods - would be implemented with real data
  private getBuyerActivities() { return []; }
  private getSellerActivities() { return []; }
  private calculateAuctionDiscoveryMetrics(activities: any) { return { completionRate: 85, averageTime: 3, dropOffPoints: [] }; }
  private calculateBidPlacedMetrics(activities: any) { return { successRate: 95, averageTime: 2, uncertaintyLevel: 25 }; }
  private calculateOutcomeClarityMetrics(activities: any) { return { clarityScore: 90, winnerConfirmationRate: 98, loserNotificationRate: 95 }; }
  private calculateWalletUpdatedMetrics(activities: any) { return { updateSuccessRate: 97, clarityScore: 88, timeToDisplay: 5 }; }
  private calculateBuyerReturnMetrics(activities: any) { return { returnRate: 28, timeToReturn: 7, uncertaintyLevel: 20 }; }
  private calculateAuctionCreatedMetrics(activities: any) { return { successRate: 90, averageTime: 8, uncertaintyLevel: 30 }; }
  private calculateBidsReceivedMetrics(activities: any) { return { averageBidsPerAuction: 4.5, bidQualityScore: 85, timeToFirstBid: 2 }; }
  private calculateSaleCompletedMetrics(activities: any) { return { completionRate: 75, averageSalePrice: 125, sellerSatisfaction: 88 }; }
  private calculateEarningsVisibleMetrics(activities: any) { return { clarityScore: 92, displayAccuracy: 95, updateTimeliness: 1 }; }
  private calculateSellerReturnMetrics(activities: any) { return { returnRate: 22, timeToNextAuction: 14, confidenceLevel: 75 }; }
  private getUserFeedbackForStep(step: string, userType: string) { return { confused: 15, uncertain: 20, confident: 65 }; }
  private getTimeMetricsForStep(step: string, userType: string) { return { averageTime: 3 }; }
  private getErrorRatesForStep(step: string, userType: string) { return 5; }
  private getDropOffRatesForStep(step: string, userType: string) { return 12; }
  private identifyUncertaintyFactors(step: string, userType: string, data: any) { return ['Complex interface', 'Unclear pricing', 'Missing information']; }
  private calculateOrganicReturnRate() { return 28; }
  private calculateIncentiveDependency() { return 15; }
  private hasClearFeedbackPattern() { return true; }
  private getWeekNumber(date: Date) { return Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)); }
  private getWeekDates(weekNumber: number, year: number) { 
    const firstDay = new Date(year, 0, 1);
    const startDate = new Date(firstDay.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }

  // Public methods for dashboard
  getNorthStarMetric(): NorthStarMetric {
    return this.calculateNorthStarMetric();
  }

  getCoreLoopMetrics(): CoreLoopMetrics {
    return {
      buyerLoop: this.tightenBuyerLoop(),
      sellerLoop: this.tightenSellerLoop()
    };
  }

  getUncertaintyMeasurements(): UncertaintyMeasurement[] {
    return Array.from(this.uncertaintyMeasurements.values()).flat();
  }

  getWeeklyReport(weekNumber: number, year: number): WeeklyRetentionMetrics | null {
    return this.weeklyMetrics.get(`${weekNumber}-${year}`) || null;
  }
}

export default Phase3RetentionService;
