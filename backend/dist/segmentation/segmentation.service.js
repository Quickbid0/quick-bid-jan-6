"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSegmentationService = void 0;
const common_1 = require("@nestjs/common");
let UserSegmentationService = class UserSegmentationService {
    constructor() {
        this.mockUserProfiles = [
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
        this.segments = [
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
        this.campaigns = [];
    }
    async analyzeUserBehavior(userId) {
        const existingProfile = this.mockUserProfiles.find(p => p.userId === userId);
        if (existingProfile) {
            return this.updateUserProfile(existingProfile);
        }
        else {
            return this.createUserProfile(userId);
        }
    }
    async createDynamicSegments() {
        const allUsers = await this.getAllUserProfiles();
        const behaviorSegments = this.analyzeBehaviorPatterns(allUsers);
        this.segments.forEach(segment => {
            segment.userCount = this.countUsersInSegment(allUsers, segment.criteria);
            segment.lastUpdated = new Date();
        });
        return [...this.segments, ...behaviorSegments];
    }
    async getPersonalizedRecommendations(userId, context = {}) {
        const userProfile = await this.analyzeUserBehavior(userId);
        const recommendations = [];
        const categoryRecommendations = await this.getCategoryRecommendations(userProfile);
        recommendations.push(...categoryRecommendations);
        const priceRecommendations = await this.getPriceBasedRecommendations(userProfile);
        recommendations.push(...priceRecommendations);
        const behavioralRecommendations = await this.getBehavioralRecommendations(userProfile, context);
        recommendations.push(...behavioralRecommendations);
        const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
        return uniqueRecommendations.slice(0, 10);
    }
    async createTargetingCampaign(campaignData) {
        const campaign = {
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
    async executeCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const targetUsers = await this.getUsersForCampaign(campaign);
        const results = await this.sendCampaignToUsers(campaign, targetUsers);
        campaign.performance.impressions += results.impressions;
        campaign.performance.clicks += results.clicks;
        campaign.performance.conversions += results.conversions;
        campaign.performance.revenue += results.revenue;
        return results;
    }
    async analyzeCampaignPerformance(campaignId) {
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
    async predictUserLifetimeValue(userId) {
        const userProfile = await this.analyzeUserBehavior(userId);
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
    async updateUserProfile(existingProfile) {
        existingProfile.behavior.lastActive = new Date();
        existingProfile.behavior.sessionDuration += Math.random() * 300;
        return existingProfile;
    }
    async createUserProfile(userId) {
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
    async getAllUserProfiles() {
        return this.mockUserProfiles;
    }
    analyzeBehaviorPatterns(users) {
        const dynamicSegments = [];
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
    countUsersInSegment(users, criteria) {
        return users.filter(user => this.matchesCriteria(user, criteria)).length;
    }
    matchesCriteria(user, criteria) {
        for (const [key, value] of Object.entries(criteria)) {
            switch (key) {
                case 'totalSpent':
                    if (value.min && user.behavior.totalSpent < value.min)
                        return false;
                    if (value.max && user.behavior.totalSpent > value.max)
                        return false;
                    break;
                case 'biddingFrequency':
                    if (user.behavior.biddingFrequency !== value)
                        return false;
                    break;
                case 'favoriteCategories':
                    if (value.includes && !value.includes.some(cat => user.behavior.favoriteCategories.includes(cat)))
                        return false;
                    break;
                case 'loyaltyScore':
                    if (value.min && user.engagement.loyaltyScore < value.min)
                        return false;
                    break;
            }
        }
        return true;
    }
    async getCategoryRecommendations(userProfile) {
        const recommendations = [];
        for (const category of userProfile.behavior.favoriteCategories) {
            recommendations.push({
                type: 'category',
                category,
                title: `More ${category} items`,
                reason: `Based on your interest in ${category}`
            });
        }
        return recommendations;
    }
    async getPriceBasedRecommendations(userProfile) {
        const { min, max } = userProfile.preferences.priceRange;
        return [{
                type: 'price_range',
                priceRange: { min, max },
                title: `Items in your price range (₹${min} - ₹${max})`,
                reason: 'Matches your preferred price range'
            }];
    }
    async getBehavioralRecommendations(userProfile, context) {
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
    deduplicateRecommendations(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            const key = `${rec.type}-${rec.title}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    async getUsersForCampaign(campaign) {
        const allUsers = await this.getAllUserProfiles();
        const targetUsers = [];
        for (const segmentId of campaign.targetSegments) {
            const segment = this.segments.find(s => s.id === segmentId);
            if (segment) {
                const segmentUsers = allUsers.filter(user => this.matchesCriteria(user, segment.criteria));
                targetUsers.push(...segmentUsers);
            }
        }
        const uniqueUsers = targetUsers.filter((user, index, self) => index === self.findIndex(u => u.userId === user.userId));
        return uniqueUsers;
    }
    async sendCampaignToUsers(campaign, users) {
        const results = {
            impressions: users.length,
            clicks: Math.floor(users.length * 0.15),
            conversions: Math.floor(users.length * 0.08),
            revenue: Math.floor(users.length * 0.08 * 2500)
        };
        return results;
    }
    calculateCampaignROI(campaign) {
        const cost = 1000;
        const revenue = campaign.performance.revenue;
        return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    }
    generateCampaignInsights(metrics) {
        const insights = [];
        if (metrics.ctr > 15) {
            insights.push('Excellent click-through rate indicates compelling content');
        }
        else if (metrics.ctr < 5) {
            insights.push('Low click-through rate suggests content may need optimization');
        }
        if (metrics.conversionRate > 10) {
            insights.push('Strong conversion rate shows effective targeting');
        }
        return insights;
    }
    generateCampaignRecommendations(metrics) {
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
    calculateGrowthFactor(userProfile) {
        let factor = 1.0;
        factor += (userProfile.engagement.loyaltyScore / 100) * 0.5;
        if (userProfile.behavior.biddingFrequency === 'high') {
            factor += 0.3;
        }
        const daysSinceActive = (Date.now() - userProfile.behavior.lastActive.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceActive < 7) {
            factor += 0.2;
        }
        return factor;
    }
};
exports.UserSegmentationService = UserSegmentationService;
exports.UserSegmentationService = UserSegmentationService = __decorate([
    (0, common_1.Injectable)()
], UserSegmentationService);
//# sourceMappingURL=segmentation.service.js.map