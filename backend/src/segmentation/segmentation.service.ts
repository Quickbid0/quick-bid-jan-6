import { Injectable } from '@nestjs/common';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  userCount: number;
  createdAt: Date;
  lastUpdated: Date;
}

interface UserProfile {
  userId: string;
  demographics: {
    age?: number;
    location?: string;
    gender?: string;
    income?: string;
  };
  behavior: {
    totalBids: number;
    totalWins: number;
    totalSpent: number;
    avgBidAmount: number;
    favoriteCategories: string[];
    biddingFrequency: 'low' | 'medium' | 'high';
    sessionDuration: number;
    deviceType: string;
    lastActive: Date;
  };
  preferences: {
    priceRange: { min: number; max: number };
    auctionTypes: string[];
    notificationPreferences: string[];
  };
  engagement: {
    emailOpenRate: number;
    clickThroughRate: number;
    conversionRate: number;
    loyaltyScore: number;
  };
}

interface TargetingCampaign {
  id: string;
  name: string;
  description: string;
  targetSegments: string[];
  content: {
    type: 'email' | 'notification' | 'recommendation';
    title: string;
    message: string;
    imageUrl?: string;
    ctaUrl?: string;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
}

@Injectable()
export class UserSegmentationService {
  // Mock data for demonstration
  private mockUserProfiles: UserProfile[] = [
    {
      userId: 'user1',
      demographics: { age: 25, location: 'Mumbai', gender: 'male' },
      behavior: {
        totalBids: 45, totalWins: 8, totalSpent: 125000, avgBidAmount: 2778,
        favoriteCategories: ['Electronics', 'Fashion'], biddingFrequency: 'high',
        sessionDuration: 1200, deviceType: 'mobile', lastActive: new Date()
      },
      preferences: {
        priceRange: { min: 1000, max: 50000 }, auctionTypes: ['standard', 'reserve'],
        notificationPreferences: ['bid_updates', 'auction_ending']
      },
      engagement: {
        emailOpenRate: 0.75, clickThroughRate: 0.15, conversionRate: 0.08, loyaltyScore: 85
      }
    },
    {
      userId: 'user2',
      demographics: { age: 35, location: 'Delhi', gender: 'female' },
      behavior: {
        totalBids: 12, totalWins: 3, totalSpent: 45000, avgBidAmount: 3750,
        favoriteCategories: ['Jewelry', 'Art'], biddingFrequency: 'medium',
        sessionDuration: 800, deviceType: 'desktop', lastActive: new Date(Date.now() - 86400000)
      },
      preferences: {
        priceRange: { min: 5000, max: 100000 }, auctionTypes: ['reserve', 'tender'],
        notificationPreferences: ['new_auctions', 'price_alerts']
      },
      engagement: {
        emailOpenRate: 0.60, clickThroughRate: 0.12, conversionRate: 0.05, loyaltyScore: 70
      }
    }
  ];

  private segments: UserSegment[] = [
    {
      id: 'high-value-bidders',
      name: 'High-Value Bidders',
      description: 'Users who frequently bid on expensive items and have high conversion rates',
      criteria: { totalSpent: { min: 50000 }, biddingFrequency: 'high' },
      userCount: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    },
    {
      id: 'new-users',
      name: 'New Users',
      description: 'Recently registered users who need onboarding and engagement',
      criteria: { accountAgeDays: { max: 30 } },
      userCount: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    },
    {
      id: 'electronics-enthusiasts',
      name: 'Electronics Enthusiasts',
      description: 'Users primarily interested in electronics and gadgets',
      criteria: { favoriteCategories: { includes: 'Electronics' } },
      userCount: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    }
  ];

  private campaigns: TargetingCampaign[] = [];

  /**
   * Analyze user behavior and create/update user profiles
   */
  async analyzeUserBehavior(userId: string): Promise<UserProfile> {
    // In production, this would fetch real user data from database
    const existingProfile = this.mockUserProfiles.find(p => p.userId === userId);

    if (existingProfile) {
      // Update with latest behavior data
      return this.updateUserProfile(existingProfile);
    } else {
      // Create new profile
      return this.createUserProfile(userId);
    }
  }

  /**
   * Create dynamic user segments based on behavior patterns
   */
  async createDynamicSegments(): Promise<UserSegment[]> {
    const allUsers = await this.getAllUserProfiles();

    // Analyze behavior patterns to create segments
    const behaviorSegments = this.analyzeBehaviorPatterns(allUsers);

    // Update segment user counts
    this.segments.forEach(segment => {
      segment.userCount = this.countUsersInSegment(allUsers, segment.criteria);
      segment.lastUpdated = new Date();
    });

    return [...this.segments, ...behaviorSegments];
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userId: string, context: {
    currentPage?: string;
    viewedItems?: string[];
    searchQuery?: string;
  } = {}): Promise<any[]> {
    const userProfile = await this.analyzeUserBehavior(userId);

    // Generate recommendations based on user profile and context
    const recommendations = [];

    // Category-based recommendations
    const categoryRecommendations = await this.getCategoryRecommendations(userProfile);
    recommendations.push(...categoryRecommendations);

    // Price-based recommendations
    const priceRecommendations = await this.getPriceBasedRecommendations(userProfile);
    recommendations.push(...priceRecommendations);

    // Behavioral recommendations
    const behavioralRecommendations = await this.getBehavioralRecommendations(userProfile, context);
    recommendations.push(...behavioralRecommendations);

    // Remove duplicates and limit results
    const uniqueRecommendations = this.deduplicateRecommendations(recommendations);

    return uniqueRecommendations.slice(0, 10);
  }

  /**
   * Create and manage targeting campaigns
   */
  async createTargetingCampaign(campaignData: Omit<TargetingCampaign, 'id' | 'performance' | 'status'>): Promise<TargetingCampaign> {
    const campaign: TargetingCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaignData,
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      },
      status: 'draft'
    };

    this.campaigns.push(campaign);
    return campaign;
  }

  /**
   * Execute targeting campaigns
   */
  async executeCampaign(campaignId: string): Promise<any> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const targetUsers = await this.getUsersForCampaign(campaign);

    // Send campaign to target users
    const results = await this.sendCampaignToUsers(campaign, targetUsers);

    // Update campaign performance
    campaign.performance.impressions += results.impressions;
    campaign.performance.clicks += results.clicks;
    campaign.performance.conversions += results.conversions;
    campaign.performance.revenue += results.revenue;

    return results;
  }

  /**
   * Analyze campaign performance and provide insights
   */
  async analyzeCampaignPerformance(campaignId: string): Promise<any> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const performance = campaign.performance;
    const metrics = {
      impressions: performance.impressions,
      clicks: performance.clicks,
      conversions: performance.conversions,
      revenue: performance.revenue,
      ctr: performance.impressions > 0 ? (performance.clicks / performance.impressions) * 100 : 0,
      conversionRate: performance.clicks > 0 ? (performance.conversions / performance.clicks) * 100 : 0,
      revenuePerClick: performance.clicks > 0 ? performance.revenue / performance.clicks : 0,
      roi: this.calculateCampaignROI(campaign)
    };

    return {
      campaignId,
      campaignName: campaign.name,
      metrics,
      insights: this.generateCampaignInsights(metrics),
      recommendations: this.generateCampaignRecommendations(metrics)
    };
  }

  /**
   * Get user lifetime value predictions
   */
  async predictUserLifetimeValue(userId: string): Promise<{
    predictedValue: number;
    confidence: number;
    factors: string[];
    timeHorizon: string;
  }> {
    const userProfile = await this.analyzeUserBehavior(userId);

    // Simple LTV prediction based on current behavior
    const baseValue = userProfile.behavior.totalSpent;
    const growthFactor = this.calculateGrowthFactor(userProfile);
    const predictedValue = baseValue * growthFactor;

    const factors = [
      `Current spending: ₹${baseValue}`,
      `Engagement score: ${userProfile.engagement.loyaltyScore}/100`,
      `Bidding frequency: ${userProfile.behavior.biddingFrequency}`,
      `Account age: Recent vs established user`
    ];

    return {
      predictedValue: Math.round(predictedValue),
      confidence: 75,
      factors,
      timeHorizon: '12 months'
    };
  }

  // Private helper methods

  private async updateUserProfile(existingProfile: UserProfile): Promise<UserProfile> {
    // Simulate profile updates based on recent activity
    existingProfile.behavior.lastActive = new Date();
    existingProfile.behavior.sessionDuration += Math.random() * 300;

    return existingProfile;
  }

  private async createUserProfile(userId: string): Promise<UserProfile> {
    // Create new profile with default values
    return {
      userId,
      demographics: {},
      behavior: {
        totalBids: 0, totalWins: 0, totalSpent: 0, avgBidAmount: 0,
        favoriteCategories: [], biddingFrequency: 'low',
        sessionDuration: 0, deviceType: 'unknown', lastActive: new Date()
      },
      preferences: {
        priceRange: { min: 0, max: 100000 }, auctionTypes: ['standard'],
        notificationPreferences: []
      },
      engagement: {
        emailOpenRate: 0, clickThroughRate: 0, conversionRate: 0, loyaltyScore: 50
      }
    };
  }

  private async getAllUserProfiles(): Promise<UserProfile[]> {
    // In production, fetch from database
    return this.mockUserProfiles;
  }

  private analyzeBehaviorPatterns(users: UserProfile[]): UserSegment[] {
    // Create dynamic segments based on behavior analysis
    const dynamicSegments: UserSegment[] = [];

    // High-engagement segment
    const highEngagementUsers = users.filter(u => u.engagement.loyaltyScore > 80);
    if (highEngagementUsers.length > 0) {
      dynamicSegments.push({
        id: 'high-engagement',
        name: 'High Engagement Users',
        description: 'Users with high loyalty scores and engagement rates',
        criteria: { loyaltyScore: { min: 80 } },
        userCount: highEngagementUsers.length,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }

    return dynamicSegments;
  }

  private countUsersInSegment(users: UserProfile[], criteria: Record<string, any>): number {
    return users.filter(user => this.matchesCriteria(user, criteria)).length;
  }

  private matchesCriteria(user: UserProfile, criteria: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(criteria)) {
      switch (key) {
        case 'totalSpent':
          if (value.min && user.behavior.totalSpent < value.min) return false;
          if (value.max && user.behavior.totalSpent > value.max) return false;
          break;
        case 'biddingFrequency':
          if (user.behavior.biddingFrequency !== value) return false;
          break;
        case 'favoriteCategories':
          if (value.includes && !value.includes.some(cat => user.behavior.favoriteCategories.includes(cat))) return false;
          break;
        case 'loyaltyScore':
          if (value.min && user.engagement.loyaltyScore < value.min) return false;
          break;
      }
    }
    return true;
  }

  private async getCategoryRecommendations(userProfile: UserProfile): Promise<any[]> {
    const recommendations = [];

    for (const category of userProfile.behavior.favoriteCategories) {
      // Mock category-based recommendations
      recommendations.push({
        type: 'category',
        category,
        title: `More ${category} items`,
        reason: `Based on your interest in ${category}`
      });
    }

    return recommendations;
  }

  private async getPriceBasedRecommendations(userProfile: UserProfile): Promise<any[]> {
    const { min, max } = userProfile.preferences.priceRange;

    return [{
      type: 'price_range',
      priceRange: { min, max },
      title: `Items in your price range (₹${min} - ₹${max})`,
      reason: 'Matches your preferred price range'
    }];
  }

  private async getBehavioralRecommendations(userProfile: UserProfile, context: any): Promise<any[]> {
    const recommendations = [];

    if (context.searchQuery) {
      recommendations.push({
        type: 'search_related',
        query: context.searchQuery,
        title: `Similar to "${context.searchQuery}"`,
        reason: 'Based on your recent search'
      });
    }

    if (userProfile.behavior.biddingFrequency === 'high') {
      recommendations.push({
        type: 'frequency_based',
        title: 'Hot auctions ending soon',
        reason: 'You bid frequently on time-sensitive auctions'
      });
    }

    return recommendations;
  }

  private deduplicateRecommendations(recommendations: any[]): any[] {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = `${rec.type}-${rec.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async getUsersForCampaign(campaign: TargetingCampaign): Promise<UserProfile[]> {
    const allUsers = await this.getAllUserProfiles();
    const targetUsers: UserProfile[] = [];

    for (const segmentId of campaign.targetSegments) {
      const segment = this.segments.find(s => s.id === segmentId);
      if (segment) {
        const segmentUsers = allUsers.filter(user => this.matchesCriteria(user, segment.criteria));
        targetUsers.push(...segmentUsers);
      }
    }

    // Remove duplicates
    const uniqueUsers = targetUsers.filter((user, index, self) =>
      index === self.findIndex(u => u.userId === user.userId)
    );

    return uniqueUsers;
  }

  private async sendCampaignToUsers(campaign: TargetingCampaign, users: UserProfile[]): Promise<any> {
    // Mock campaign execution
    const results = {
      impressions: users.length,
      clicks: Math.floor(users.length * 0.15),
      conversions: Math.floor(users.length * 0.08),
      revenue: Math.floor(users.length * 0.08 * 2500) // Average order value
    };

    return results;
  }

  private calculateCampaignROI(campaign: TargetingCampaign): number {
    const cost = 1000; // Mock campaign cost
    const revenue = campaign.performance.revenue;

    return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  }

  private generateCampaignInsights(metrics: any): string[] {
    const insights = [];

    if (metrics.ctr > 15) {
      insights.push('Excellent click-through rate indicates compelling content');
    } else if (metrics.ctr < 5) {
      insights.push('Low click-through rate suggests content may need optimization');
    }

    if (metrics.conversionRate > 10) {
      insights.push('Strong conversion rate shows effective targeting');
    }

    return insights;
  }

  private generateCampaignRecommendations(metrics: any): string[] {
    const recommendations = [];

    if (metrics.ctr < 10) {
      recommendations.push('Consider improving subject lines or content relevance');
    }

    if (metrics.conversionRate < 5) {
      recommendations.push('Review landing page experience and call-to-action');
    }

    if (metrics.roi < 0) {
      recommendations.push('Campaign may need budget reallocation or different targeting');
    }

    return recommendations;
  }

  private calculateGrowthFactor(userProfile: UserProfile): number {
    let factor = 1.0;

    // Loyalty increases predicted value
    factor += (userProfile.engagement.loyaltyScore / 100) * 0.5;

    // High engagement increases predicted value
    if (userProfile.behavior.biddingFrequency === 'high') {
      factor += 0.3;
    }

    // Recent activity increases predicted value
    const daysSinceActive = (Date.now() - userProfile.behavior.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 7) {
      factor += 0.2;
    }

    return factor;
  }
}
