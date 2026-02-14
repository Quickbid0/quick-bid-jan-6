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
        priceRange: {
            min: number;
            max: number;
        };
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
export declare class UserSegmentationService {
    private mockUserProfiles;
    private segments;
    private campaigns;
    analyzeUserBehavior(userId: string): Promise<UserProfile>;
    createDynamicSegments(): Promise<UserSegment[]>;
    getPersonalizedRecommendations(userId: string, context?: {
        currentPage?: string;
        viewedItems?: string[];
        searchQuery?: string;
    }): Promise<any[]>;
    createTargetingCampaign(campaignData: Omit<TargetingCampaign, 'id' | 'performance' | 'status'>): Promise<TargetingCampaign>;
    executeCampaign(campaignId: string): Promise<any>;
    analyzeCampaignPerformance(campaignId: string): Promise<any>;
    predictUserLifetimeValue(userId: string): Promise<{
        predictedValue: number;
        confidence: number;
        factors: string[];
        timeHorizon: string;
    }>;
    private updateUserProfile;
    private createUserProfile;
    private getAllUserProfiles;
    private analyzeBehaviorPatterns;
    private countUsersInSegment;
    private matchesCriteria;
    private getCategoryRecommendations;
    private getPriceBasedRecommendations;
    private getBehavioralRecommendations;
    private deduplicateRecommendations;
    private getUsersForCampaign;
    private sendCampaignToUsers;
    private calculateCampaignROI;
    private generateCampaignInsights;
    private generateCampaignRecommendations;
    private calculateGrowthFactor;
}
export {};
