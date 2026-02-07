// 🔄 RETENTION SIGNALS MONITORING - PHASE 3
// src/services/retention.service.ts

export interface RetentionSignals {
  repeatBidders: {
    totalUsers: number;
    repeatUsers: number;
    repeatRate: number;
    averageBidsPerUser: number;
    averageTimeBetweenBids: number;
  };
  repeatSellers: {
    totalSellers: number;
    repeatSellers: number;
    repeatRate: number;
    averageAuctionsPerSeller: number;
    averageTimeBetweenAuctions: number;
  };
  walletUsage: {
    totalWallets: number;
    activeWallets: number;
    walletReuseRate: number;
    averageBalance: number;
    totalTransactions: number;
  };
  platformEngagement: {
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    userRetentionRate: number;
    averageSessionDuration: number;
    returnUserRate: number;
  };
}

export interface UserActivity {
  userId: string;
  userType: 'buyer' | 'seller' | 'admin';
  lastActivity: Date;
  totalSessions: number;
  totalBids: number;
  totalAuctions: number;
  totalTransactions: number;
  walletBalance: number;
  registrationDate: Date;
  firstActivityDate: Date;
  lastBidDate?: Date;
  lastAuctionDate?: Date;
  lastTransactionDate?: Date;
}

export interface RetentionMetrics {
  weeklyMetrics: {
    weekNumber: number;
    year: number;
    startDate: Date;
    endDate: Date;
    signals: RetentionSignals;
  };
  trends: {
    bidRetentionTrend: 'increasing' | 'decreasing' | 'stable';
    sellerRetentionTrend: 'increasing' | 'decreasing' | 'stable';
    walletUsageTrend: 'increasing' | 'decreasing' | 'stable';
    overallRetentionTrend: 'increasing' | 'decreasing' | 'stable';
  };
  insights: RetentionInsight[];
  recommendations: RetentionRecommendation[];
}

export interface RetentionInsight {
  category: 'positive' | 'concern' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data?: any;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export interface RetentionRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'engagement' | 'retention' | 'monetization' | 'experience';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
}

export class RetentionService {
  private userActivities: Map<string, UserActivity> = new Map();
  private weeklyMetrics: Map<string, RetentionMetrics> = new Map();

  constructor() {
    this.initializeRetentionTracking();
  }

  // Initialize retention tracking
  private initializeRetentionTracking(): void {
    // Load from localStorage (will be replaced with backend API)
    const savedActivities = localStorage.getItem('userActivities');
    if (savedActivities) {
      const activities = JSON.parse(savedActivities);
      activities.forEach((activity: UserActivity) => {
        this.userActivities.set(activity.userId, activity);
      });
    }

    const savedMetrics = localStorage.getItem('weeklyRetentionMetrics');
    if (savedMetrics) {
      const metrics = JSON.parse(savedMetrics);
      metrics.forEach((metric: RetentionMetrics) => {
        this.weeklyMetrics.set(`${metric.weeklyMetrics.weekNumber}-${metric.weeklyMetrics.year}`, metric);
      });
    }
  }

  // Track user activity
  trackUserActivity(
    userId: string,
    userType: 'buyer' | 'seller' | 'admin',
    activityType: 'session' | 'bid' | 'auction' | 'transaction' | 'wallet',
    data?: any
  ): void {
    let activity = this.userActivities.get(userId);
    
    if (!activity) {
      // Create new user activity record
      activity = {
        userId,
        userType,
        lastActivity: new Date(),
        totalSessions: 0,
        totalBids: 0,
        totalAuctions: 0,
        totalTransactions: 0,
        walletBalance: 0,
        registrationDate: new Date(),
        firstActivityDate: new Date()
      };
      this.userActivities.set(userId, activity);
    }

    // Update activity based on type
    switch (activityType) {
      case 'session':
        activity.totalSessions++;
        break;
      case 'bid':
        activity.totalBids++;
        activity.lastBidDate = new Date();
        break;
      case 'auction':
        activity.totalAuctions++;
        activity.lastAuctionDate = new Date();
        break;
      case 'transaction':
        activity.totalTransactions++;
        activity.lastTransactionDate = new Date();
        break;
      case 'wallet':
        if (data?.balance !== undefined) {
          activity.walletBalance = data.balance;
        }
        break;
    }

    activity.lastActivity = new Date();
    
    // Save to localStorage
    const allActivities = Array.from(this.userActivities.values());
    localStorage.setItem('userActivities', JSON.stringify(allActivities));

    console.log('🔄 User activity tracked:', userId, activityType);
  }

  // Calculate retention signals
  calculateRetentionSignals(): RetentionSignals {
    const allActivities = Array.from(this.userActivities.values());
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Repeat Bidders
    const buyers = allActivities.filter(a => a.userType === 'buyer');
    const repeatBidders = buyers.filter(b => b.totalBids > 1);
    const repeatBiddersRate = buyers.length > 0 ? (repeatBidders.length / buyers.length) * 100 : 0;
    const averageBidsPerUser = buyers.length > 0 ? buyers.reduce((sum, b) => sum + b.totalBids, 0) / buyers.length : 0;

    // Calculate average time between bids
    const bidTimes = buyers
      .filter(b => b.totalBids > 1 && b.firstActivityDate && b.lastBidDate)
      .map(b => (b.lastBidDate!.getTime() - b.firstActivityDate.getTime()) / (b.totalBids - 1));
    const averageTimeBetweenBids = bidTimes.length > 0 ? bidTimes.reduce((sum, time) => sum + time, 0) / bidTimes.length / (1000 * 60 * 60) : 0;

    // Repeat Sellers
    const sellers = allActivities.filter(a => a.userType === 'seller');
    const repeatSellers = sellers.filter(s => s.totalAuctions > 1);
    const repeatSellersRate = sellers.length > 0 ? (repeatSellers.length / sellers.length) * 100 : 0;
    const averageAuctionsPerSeller = sellers.length > 0 ? sellers.reduce((sum, s) => sum + s.totalAuctions, 0) / sellers.length : 0;

    // Calculate average time between auctions
    const auctionTimes = sellers
      .filter(s => s.totalAuctions > 1 && s.firstActivityDate && s.lastAuctionDate)
      .map(s => (s.lastAuctionDate!.getTime() - s.firstActivityDate.getTime()) / (s.totalAuctions - 1));
    const averageTimeBetweenAuctions = auctionTimes.length > 0 ? auctionTimes.reduce((sum, time) => sum + time, 0) / auctionTimes.length / (1000 * 60 * 60 * 24) : 0;

    // Wallet Usage
    const activeWallets = allActivities.filter(a => a.walletBalance > 0 || a.totalTransactions > 0);
    const walletReuseRate = allActivities.length > 0 ? (activeWallets.length / allActivities.length) * 100 : 0;
    const averageBalance = allActivities.length > 0 ? allActivities.reduce((sum, a) => sum + a.walletBalance, 0) / allActivities.length : 0;

    // Platform Engagement
    const weeklyActiveUsers = allActivities.filter(a => a.lastActivity >= oneWeekAgo).length;
    const monthlyActiveUsers = allActivities.filter(a => a.lastActivity >= oneMonthAgo).length;
    const userRetentionRate = monthlyActiveUsers > 0 ? (weeklyActiveUsers / monthlyActiveUsers) * 100 : 0;
    
    // Calculate return user rate (users who come back after first week)
    const returnUsers = allActivities.filter(a => {
      const firstWeek = new Date(a.firstActivityDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      return a.lastActivity > firstWeek;
    });
    const returnUserRate = allActivities.length > 0 ? (returnUsers.length / allActivities.length) * 100 : 0;

    return {
      repeatBidders: {
        totalUsers: buyers.length,
        repeatUsers: repeatBidders.length,
        repeatRate: repeatBiddersRate,
        averageBidsPerUser,
        averageTimeBetweenBids
      },
      repeatSellers: {
        totalSellers: sellers.length,
        repeatSellers: repeatSellers.length,
        repeatRate: repeatSellersRate,
        averageAuctionsPerSeller,
        averageTimeBetweenAuctions
      },
      walletUsage: {
        totalWallets: allActivities.length,
        activeWallets: activeWallets.length,
        walletReuseRate,
        averageBalance,
        totalTransactions: allActivities.reduce((sum, a) => sum + a.totalTransactions, 0)
      },
      platformEngagement: {
        weeklyActiveUsers,
        monthlyActiveUsers,
        userRetentionRate,
        averageSessionDuration: 15, // Placeholder - would be calculated from session data
        returnUserRate
      }
    };
  }

  // Generate weekly retention report
  generateWeeklyReport(weekNumber?: number, year?: number): RetentionMetrics {
    const now = new Date();
    const currentWeekNumber = weekNumber || this.getWeekNumber(now);
    const currentYear = year || now.getFullYear();
    
    const { startDate, endDate } = this.getWeekDates(currentWeekNumber, currentYear);
    
    console.log(`🔄 Generating retention report for week ${currentWeekNumber}, ${currentYear}`);

    // Calculate retention signals
    const signals = this.calculateRetentionSignals();

    // Generate insights
    const insights = this.generateRetentionInsights(signals);

    // Generate recommendations
    const recommendations = this.generateRetentionRecommendations(signals, insights);

    // Calculate trends
    const trends = this.calculateRetentionTrends(currentWeekNumber, currentYear);

    const metrics: RetentionMetrics = {
      weeklyMetrics: {
        weekNumber: currentWeekNumber,
        year: currentYear,
        startDate,
        endDate,
        signals
      },
      trends,
      insights,
      recommendations
    };

    // Store metrics
    this.weeklyMetrics.set(`${currentWeekNumber}-${currentYear}`, metrics);
    
    // Save to localStorage
    const allMetrics = Array.from(this.weeklyMetrics.values());
    localStorage.setItem('weeklyRetentionMetrics', JSON.stringify(allMetrics));

    console.log('🔄 Retention report generated:', metrics.weeklyMetrics.weekNumber, metrics.weeklyMetrics.year);
    
    return metrics;
  }

  // Get retention insights
  private generateRetentionInsights(signals: RetentionSignals): RetentionInsight[] {
    const insights: RetentionInsight[] = [];

    // Repeat Bidders Insights
    if (signals.repeatBidders.repeatRate > 60) {
      insights.push({
        category: 'positive',
        title: 'Strong Bidder Retention',
        description: `${signals.repeatBidders.repeatRate.toFixed(1)}% of bidders are repeat users`,
        impact: 'high',
        data: { repeatRate: signals.repeatBidders.repeatRate },
        trend: 'increasing'
      });
    } else if (signals.repeatBidders.repeatRate < 30) {
      insights.push({
        category: 'concern',
        title: 'Low Bidder Retention',
        description: `Only ${signals.repeatBidders.repeatRate.toFixed(1)}% of bidders return`,
        impact: 'high',
        data: { repeatRate: signals.repeatBidders.repeatRate },
        trend: 'decreasing'
      });
    }

    // Repeat Sellers Insights
    if (signals.repeatSellers.repeatRate > 50) {
      insights.push({
        category: 'positive',
        title: 'Healthy Seller Retention',
        description: `${signals.repeatSellers.repeatRate.toFixed(1)}% of sellers create multiple auctions`,
        impact: 'high',
        data: { repeatRate: signals.repeatSellers.repeatRate },
        trend: 'increasing'
      });
    } else if (signals.repeatSellers.repeatRate < 25) {
      insights.push({
        category: 'concern',
        title: 'Poor Seller Retention',
        description: `Only ${signals.repeatSellers.repeatRate.toFixed(1)}% of sellers return`,
        impact: 'high',
        data: { repeatRate: signals.repeatSellers.repeatRate },
        trend: 'decreasing'
      });
    }

    // Wallet Usage Insights
    if (signals.walletUsage.walletReuseRate > 40) {
      insights.push({
        category: 'positive',
        title: 'Good Wallet Adoption',
        description: `${signals.walletUsage.walletReuseRate.toFixed(1)}% of users actively use wallets`,
        impact: 'medium',
        data: { walletReuseRate: signals.walletUsage.walletReuseRate },
        trend: 'increasing'
      });
    } else if (signals.walletUsage.walletReuseRate < 20) {
      insights.push({
        category: 'opportunity',
        title: 'Low Wallet Usage',
        description: `Only ${signals.walletUsage.walletReuseRate.toFixed(1)}% of users use wallets`,
        impact: 'medium',
        data: { walletReuseRate: signals.walletUsage.walletReuseRate },
        trend: 'stable'
      });
    }

    // Platform Engagement Insights
    if (signals.platformEngagement.returnUserRate > 50) {
      insights.push({
        category: 'positive',
        title: 'Strong User Return Rate',
        description: `${signals.platformEngagement.returnUserRate.toFixed(1)}% of users return after first week`,
        impact: 'high',
        data: { returnUserRate: signals.platformEngagement.returnUserRate },
        trend: 'increasing'
      });
    } else if (signals.platformEngagement.returnUserRate < 30) {
      insights.push({
        category: 'concern',
        title: 'Poor User Return Rate',
        description: `Only ${signals.platformEngagement.returnUserRate.toFixed(1)}% of users return after first week`,
        impact: 'high',
        data: { returnUserRate: signals.platformEngagement.returnUserRate },
        trend: 'decreasing'
      });
    }

    return insights;
  }

  // Generate retention recommendations
  private generateRetentionRecommendations(signals: RetentionSignals, insights: RetentionInsight[]): RetentionRecommendation[] {
    const recommendations: RetentionRecommendation[] = [];

    // Based on repeat bidder rate
    if (signals.repeatBidders.repeatRate < 40) {
      recommendations.push({
        priority: 'high',
        category: 'engagement',
        title: 'Improve Bidder Experience',
        description: 'Enhance bidding process and add gamification elements',
        expectedImpact: 'Increase repeat bidder rate by 20%',
        effort: 'medium',
        timeframe: '2-4 weeks'
      });
    }

    // Based on repeat seller rate
    if (signals.repeatSellers.repeatRate < 35) {
      recommendations.push({
        priority: 'high',
        category: 'retention',
        title: 'Seller Success Program',
        description: 'Create seller onboarding and success programs',
        expectedImpact: 'Increase repeat seller rate by 25%',
        effort: 'high',
        timeframe: '4-6 weeks'
      });
    }

    // Based on wallet usage
    if (signals.walletUsage.walletReuseRate < 30) {
      recommendations.push({
        priority: 'medium',
        category: 'experience',
        title: 'Wallet Incentives',
        description: 'Add wallet bonuses and simplified funding options',
        expectedImpact: 'Increase wallet usage by 30%',
        effort: 'low',
        timeframe: '1-2 weeks'
      });
    }

    // Based on overall engagement
    if (signals.platformEngagement.returnUserRate < 40) {
      recommendations.push({
        priority: 'high',
        category: 'engagement',
        title: 'User Re-engagement Campaign',
        description: 'Implement email and notification campaigns for inactive users',
        expectedImpact: 'Increase return rate by 15%',
        effort: 'medium',
        timeframe: '2-3 weeks'
      });
    }

    return recommendations;
  }

  // Calculate retention trends
  private calculateRetentionTrends(currentWeek: number, currentYear: number): {
    bidRetentionTrend: 'increasing' | 'decreasing' | 'stable';
    sellerRetentionTrend: 'increasing' | 'decreasing' | 'stable';
    walletUsageTrend: 'increasing' | 'decreasing' | 'stable';
    overallRetentionTrend: 'increasing' | 'decreasing' | 'stable';
  } {
    // Get previous week's metrics
    const previousWeek = currentWeek === 1 ? 52 : currentWeek - 1;
    const previousYear = currentWeek === 1 ? currentYear - 1 : currentYear;
    
    const previousMetrics = this.weeklyMetrics.get(`${previousWeek}-${previousYear}`);
    const currentMetrics = this.calculateRetentionSignals();

    if (!previousMetrics) {
      return {
        bidRetentionTrend: 'stable',
        sellerRetentionTrend: 'stable',
        walletUsageTrend: 'stable',
        overallRetentionTrend: 'stable'
      };
    }

    // Use optional chaining for properties that might not exist
    const bidTrend = this.calculateTrend(
      (previousMetrics as any).repeatBidders?.repeatRate || 0, 
      (currentMetrics as any).repeatBidders?.repeatRate || 0
    );
    const sellerTrend = this.calculateTrend(
      (previousMetrics as any).repeatSellers?.repeatRate || 0, 
      (currentMetrics as any).repeatSellers?.repeatRate || 0
    );
    const walletTrend = this.calculateTrend(
      (previousMetrics as any).walletUsage?.walletReuseRate || 0, 
      (currentMetrics as any).walletUsage?.walletReuseRate || 0
    );
    const overallTrend = this.calculateTrend(
      (previousMetrics as any).platformEngagement?.returnUserRate || 0, 
      (currentMetrics as any).platformEngagement?.returnUserRate || 0
    );

    return {
      bidRetentionTrend: bidTrend,
      sellerRetentionTrend: sellerTrend,
      walletUsageTrend: walletTrend,
      overallRetentionTrend: overallTrend
    };
  }

  // Calculate trend direction
  private calculateTrend(previous: number, current: number): 'increasing' | 'decreasing' | 'stable' {
    const change = ((current - previous) / previous) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  // Get week number
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Get week dates
  private getWeekDates(weekNumber: number, year: number): { startDate: Date; endDate: Date } {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const startDate = new Date(firstDayOfYear.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    return { startDate, endDate };
  }

  // Get user activity
  getUserActivity(userId: string): UserActivity | null {
    return this.userActivities.get(userId) || null;
  }

  // Get all user activities
  getAllUserActivities(): UserActivity[] {
    return Array.from(this.userActivities.values());
  }

  // Get weekly metrics
  getWeeklyMetrics(weekNumber: number, year: number): RetentionMetrics | null {
    return this.weeklyMetrics.get(`${weekNumber}-${year}`) || null;
  }

  // Get retention health score
  getRetentionHealthScore(): number {
    const signals = this.calculateRetentionSignals();
    
    // Calculate weighted score
    const bidderScore = Math.min(signals.repeatBidders.repeatRate, 100);
    const sellerScore = Math.min(signals.repeatSellers.repeatRate, 100);
    const walletScore = Math.min(signals.walletUsage.walletReuseRate, 100);
    const engagementScore = Math.min(signals.platformEngagement.returnUserRate, 100);
    
    // Weighted average (bidder and seller are most important)
    const healthScore = (bidderScore * 0.3 + sellerScore * 0.3 + walletScore * 0.2 + engagementScore * 0.2);
    
    return Math.round(healthScore);
  }

  // Check if retention is weak (UX problem, not feature gap)
  isRetentionWeak(): boolean {
    const healthScore = this.getRetentionHealthScore();
    const signals = this.calculateRetentionSignals();
    
    // Consider retention weak if health score is low OR key metrics are poor
    return healthScore < 50 || 
           signals.repeatBidders.repeatRate < 30 || 
           signals.repeatSellers.repeatRate < 25 ||
           signals.platformEngagement.returnUserRate < 30;
  }

  // Get retention summary
  getRetentionSummary(): {
    healthScore: number;
    isWeak: boolean;
    keyMetrics: {
      repeatBidders: number;
      repeatSellers: number;
      walletUsage: number;
      returnUsers: number;
    };
    trend: 'improving' | 'declining' | 'stable';
  } {
    const healthScore = this.getRetentionHealthScore();
    const isWeak = this.isRetentionWeak();
    const signals = this.calculateRetentionSignals();
    
    // Calculate overall trend
    const currentMetrics = this.weeklyMetrics.get(`${this.getWeekNumber(new Date())}-${new Date().getFullYear()}`);
    const trend = currentMetrics?.trends.overallRetentionTrend || 'stable';
    
    return {
      healthScore,
      isWeak,
      keyMetrics: {
        repeatBidders: signals.repeatBidders.repeatRate,
        repeatSellers: signals.repeatSellers.repeatRate,
        walletUsage: signals.walletUsage.walletReuseRate,
        returnUsers: signals.platformEngagement.returnUserRate
      },
      trend: trend as 'improving' | 'declining' | 'stable'
    };
  }
}

export default RetentionService;
