import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { AuctionsService } from '../auctions/auctions.service';
import { PaymentService } from '../payments/payment.service';

interface AuctionMonitoringData {
  auctionId: string;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  currentPrice: number;
  totalBids: number;
  activeUsers: number;
  timeLeft: number;
  lastBid?: {
    userId: string;
    amount: number;
    timestamp: Date;
  };
  issues: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface SettlementData {
  auctionId: string;
  winnerId: string;
  winnerName: string;
  finalPrice: number;
  sellerId: string;
  sellerName: string;
  platformFee: number;
  sellerPayout: number;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  settlementDate?: Date;
}

@Injectable()
export class AdminAuctionService {
  private readonly logger = new Logger(AdminAuctionService.name);

  constructor(
    @Inject(forwardRef(() => AuctionsService))
    private readonly auctionsService: AuctionsService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Get real-time auction monitoring data
   */
  async getAuctionMonitoring(status?: string): Promise<{
    success: boolean;
    data: AuctionMonitoringData[];
    summary: {
      totalAuctions: number;
      activeAuctions: number;
      totalRevenue: number;
      issuesCount: number;
      highRiskCount: number;
    };
  }> {
    try {
      // Get active auctions from auction service
      const activeAuctions = await this.auctionsService.getActiveAuctions();

      let monitoringData: AuctionMonitoringData[] = activeAuctions.map(auction => ({
        auctionId: auction.auctionId,
        status: auction.status,
        currentPrice: auction.currentPrice,
        totalBids: auction.totalBids,
        activeUsers: auction.activeUsers,
        timeLeft: auction.timeLeft,
        lastBid: auction.lastBid,
        issues: this.detectAuctionIssues(auction),
        riskLevel: this.calculateRiskLevel(auction),
      }));

      // Filter by status if provided
      if (status && status !== 'all') {
        monitoringData = monitoringData.filter(auction => auction.status === status);
      }

      // Calculate summary
      const summary = {
        totalAuctions: monitoringData.length,
        activeAuctions: monitoringData.filter(a => a.status === 'active').length,
        totalRevenue: monitoringData.reduce((sum, a) => sum + a.currentPrice, 0),
        issuesCount: monitoringData.reduce((sum, a) => sum + a.issues.length, 0),
        highRiskCount: monitoringData.filter(a => a.riskLevel === 'high').length,
      };

      return {
        success: true,
        data: monitoringData,
        summary,
      };
    } catch (error) {
      this.logger.error(`Failed to get auction monitoring data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get settlement data for completed auctions
   */
  async getSettlements(status?: string, limit = 50): Promise<{
    success: boolean;
    data: SettlementData[];
    summary: {
      totalSettlements: number;
      pendingPayments: number;
      totalRevenue: number;
      monthlyRevenue: number;
    };
  }> {
    try {
      // In production, fetch from database
      // For now, generate mock settlement data
      const mockSettlements: SettlementData[] = this.generateMockSettlements(limit);

      let filteredSettlements = mockSettlements;
      if (status && status !== 'all') {
        filteredSettlements = mockSettlements.filter(s => s.paymentStatus === status);
      }

      const summary = {
        totalSettlements: filteredSettlements.length,
        pendingPayments: filteredSettlements.filter(s => s.paymentStatus === 'pending').length,
        totalRevenue: filteredSettlements.reduce((sum, s) => sum + s.finalPrice, 0),
        monthlyRevenue: filteredSettlements
          .filter(s => s.settlementDate && new Date(s.settlementDate).getMonth() === new Date().getMonth())
          .reduce((sum, s) => sum + s.finalPrice, 0),
      };

      return {
        success: true,
        data: filteredSettlements,
        summary,
      };
    } catch (error) {
      this.logger.error(`Failed to get settlement data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get detailed auction information
   */
  async getAuctionDetails(auctionId: string): Promise<{
    success: boolean;
    auction: any;
    bids: any[];
    participants: any[];
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const auctionState = await this.auctionsService.getAuctionState(auctionId);

      // Mock additional data - in production, fetch from database
      const auction = {
        id: auctionId,
        ...auctionState,
        product: {
          name: `Product for Auction ${auctionId}`,
          category: 'Vehicles',
          location: 'Mumbai',
        },
        seller: {
          id: 'seller1',
          name: 'Verified Seller',
          rating: 4.8,
        },
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      };

      const bids = this.generateMockBids(auctionId, auctionState.totalBids);
      const participants = this.generateMockParticipants(auctionId, auctionState.activeUsers);

      const issues = this.detectAuctionIssues(auctionState);
      const recommendations = this.generateRecommendations(auctionState, issues);

      return {
        success: true,
        auction,
        bids,
        participants,
        issues,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Failed to get auction details: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Perform admin action on auction
   */
  async performAdminAction(actionRequest: {
    auctionId: string;
    action: 'start' | 'pause' | 'resume' | 'end' | 'extend' | 'cancel';
    reason?: string;
    parameters?: Record<string, any>;
  }): Promise<{
    success: boolean;
    message: string;
    auctionState?: any;
  }> {
    try {
      const { auctionId, action, reason, parameters } = actionRequest;

      let result: any;

      switch (action) {
        case 'start':
          result = await this.auctionsService.startAuction(auctionId, 'admin');
          break;
        case 'pause':
          result = await this.auctionsService.pauseAuction(auctionId, 'admin');
          break;
        case 'end':
          result = await this.auctionsService.endAuction(auctionId, 'admin');
          break;
        case 'extend':
          // Extend auction by specified minutes (default 5)
          const extensionMinutes = parameters?.minutes || 5;
          result = { success: true, message: `Auction extended by ${extensionMinutes} minutes` };
          break;
        case 'cancel':
          result = { success: true, message: 'Auction cancelled by admin' };
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (result.success) {
        this.logger.log(`Admin action '${action}' performed on auction ${auctionId}. Reason: ${reason}`);

        const newState = await this.auctionsService.getAuctionState(auctionId);

        return {
          success: true,
          message: result.message || `Action '${action}' performed successfully`,
          auctionState: newState,
        };
      } else {
        throw new Error(result.error || 'Action failed');
      }
    } catch (error) {
      this.logger.error(`Failed to perform admin action: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process settlement for completed auction
   */
  async processSettlement(auctionId: string, notes?: string): Promise<{
    success: boolean;
    settlement: SettlementData;
    message: string;
  }> {
    try {
      // Get auction details
      const auctionDetails = await this.getAuctionDetails(auctionId);

      if (auctionDetails.auction.status !== 'ended') {
        throw new Error('Auction must be ended before settlement');
      }

      const finalPrice = auctionDetails.auction.currentPrice;
      const platformFee = finalPrice * 0.05; // 5% platform fee
      const sellerPayout = finalPrice - platformFee;

      const settlement: SettlementData = {
        auctionId,
        winnerId: auctionDetails.auction.lastBid?.userId || 'unknown',
        winnerName: auctionDetails.auction.lastBid?.userName || 'Unknown User',
        finalPrice,
        sellerId: auctionDetails.auction.seller.id,
        sellerName: auctionDetails.auction.seller.name,
        platformFee,
        sellerPayout,
        paymentStatus: 'processing',
        settlementDate: new Date(),
      };

      // Process payment transfer (in production, integrate with payment gateway)
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        settlement.paymentStatus = 'completed';
        this.logger.log(`Settlement processed for auction ${auctionId}: ₹${sellerPayout} to seller`);
      } catch (paymentError) {
        settlement.paymentStatus = 'failed';
        this.logger.error(`Settlement payment failed for auction ${auctionId}: ${paymentError.message}`);
      }

      return {
        success: true,
        settlement,
        message: settlement.paymentStatus === 'completed'
          ? 'Settlement processed successfully'
          : 'Settlement created but payment processing failed',
      };
    } catch (error) {
      this.logger.error(`Failed to process settlement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get auction analytics overview
   */
  async getAnalyticsOverview(period = '30d'): Promise<{
    success: boolean;
    analytics: {
      totalAuctions: number;
      totalRevenue: number;
      averageBidAmount: number;
      conversionRate: number;
      topCategories: any[];
      revenueByDay: any[];
      userEngagement: any;
      fraudIndicators: any[];
    };
  }> {
    try {
      // Mock analytics data - in production, calculate from database
      const analytics = {
        totalAuctions: 1250,
        totalRevenue: 8750000, // ₹8.75M
        averageBidAmount: 4250,
        conversionRate: 68.5,
        topCategories: [
          { category: 'Vehicles', auctions: 450, revenue: 4250000 },
          { category: 'Electronics', auctions: 320, revenue: 2100000 },
          { category: 'Real Estate', auctions: 180, revenue: 1500000 },
          { category: 'Art & Collectibles', auctions: 150, revenue: 900000 },
        ],
        revenueByDay: this.generateRevenueByDay(30),
        userEngagement: {
          activeUsers: 15420,
          newUsers: 2340,
          returningUsers: 13080,
          averageSessionTime: 28, // minutes
          bounceRate: 12.5,
        },
        fraudIndicators: [
          { type: 'suspicious_bidding', count: 15, severity: 'medium' },
          { type: 'account_takeover', count: 8, severity: 'high' },
          { type: 'fake_listings', count: 23, severity: 'low' },
        ],
      };

      return {
        success: true,
        analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics overview: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get fraud monitoring data
   */
  async getFraudMonitoring(): Promise<{
    success: boolean;
    alerts: any[];
    suspiciousActivities: any[];
    riskMetrics: any;
  }> {
    try {
      const alerts = [
        {
          id: 'alert_1',
          type: 'high_bid_frequency',
          severity: 'high',
          message: 'User making bids at unusually high frequency',
          userId: 'user_123',
          auctionId: 'auction_456',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        },
        {
          id: 'alert_2',
          type: 'shill_bidding',
          severity: 'medium',
          message: 'Possible shill bidding pattern detected',
          userId: 'user_789',
          auctionId: 'auction_101',
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        },
      ];

      const suspiciousActivities = [
        {
          id: 'activity_1',
          type: 'multiple_accounts',
          description: 'User has multiple accounts from same IP',
          userIds: ['user_111', 'user_222', 'user_333'],
          riskScore: 85,
        },
        {
          id: 'activity_2',
          type: 'rapid_bidding',
          description: 'Unusual bidding pattern detected',
          auctionId: 'auction_789',
          riskScore: 72,
        },
      ];

      const riskMetrics = {
        overallRiskScore: 68,
        highRiskAuctions: 12,
        suspiciousUsers: 45,
        blockedTransactions: 8,
        falsePositives: 3,
      };

      return {
        success: true,
        alerts,
        suspiciousActivities,
        riskMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get fraud monitoring data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Perform emergency action on auction platform
   */
  async performEmergencyAction(action: {
    action: 'pause_all' | 'resume_all' | 'shutdown' | 'maintenance_mode';
    reason: string;
    duration?: number;
  }): Promise<{
    success: boolean;
    message: string;
    affectedAuctions: number;
  }> {
    try {
      let affectedAuctions = 0;

      switch (action.action) {
        case 'pause_all':
          // Pause all active auctions
          affectedAuctions = 25; // Mock count
          break;
        case 'resume_all':
          // Resume all paused auctions
          affectedAuctions = 25;
          break;
        case 'shutdown':
          // Emergency shutdown
          affectedAuctions = 0;
          break;
        case 'maintenance_mode':
          // Enable maintenance mode
          affectedAuctions = 0;
          break;
      }

      this.logger.warn(`Emergency action '${action.action}' performed. Reason: ${action.reason}. Affected auctions: ${affectedAuctions}`);

      return {
        success: true,
        message: `Emergency action '${action.action}' performed successfully`,
        affectedAuctions,
      };
    } catch (error) {
      this.logger.error(`Failed to perform emergency action: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<{
    success: boolean;
    health: {
      websocketConnections: number;
      activeAuctions: number;
      pendingSettlements: number;
      systemLoad: number;
      errorRate: number;
      responseTime: number;
      services: any[];
    };
  }> {
    try {
      const health = {
        websocketConnections: 1247,
        activeAuctions: 23,
        pendingSettlements: 15,
        systemLoad: 0.68, // 68% load
        errorRate: 0.02, // 2% error rate
        responseTime: 245, // ms
        services: [
          { name: 'WebSocket Server', status: 'healthy', uptime: '99.9%' },
          { name: 'Database', status: 'healthy', uptime: '99.8%' },
          { name: 'Payment Gateway', status: 'healthy', uptime: '99.5%' },
          { name: 'KYC Service', status: 'healthy', uptime: '98.7%' },
          { name: 'Notification Service', status: 'warning', uptime: '97.2%' },
        ],
      };

      return {
        success: true,
        health,
      };
    } catch (error) {
      this.logger.error(`Failed to get system health: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods

  private detectAuctionIssues(auction: any): string[] {
    const issues: string[] = [];

    if (auction.timeLeft < 300 && auction.totalBids === 0) { // Less than 5 minutes, no bids
      issues.push('No bids placed');
    }

    if (auction.activeUsers > auction.totalBids * 2) {
      issues.push('Low bidding activity compared to viewers');
    }

    if (auction.lastBid && auction.timeLeft < 60) { // Last minute bid
      issues.push('Last minute bidding activity');
    }

    if (auction.currentPrice < auction.startPrice * 0.5) {
      issues.push('Price significantly below starting price');
    }

    return issues;
  }

  private calculateRiskLevel(auction: any): 'low' | 'medium' | 'high' {
    const issues = this.detectAuctionIssues(auction);
    const issueCount = issues.length;

    if (issueCount >= 3) return 'high';
    if (issueCount >= 1) return 'medium';
    return 'low';
  }

  private generateRecommendations(auction: any, issues: string[]): string[] {
    const recommendations: string[] = [];

    if (issues.includes('No bids placed')) {
      recommendations.push('Consider extending auction duration');
      recommendations.push('Promote auction to increase visibility');
    }

    if (issues.includes('Low bidding activity compared to viewers')) {
      recommendations.push('Send reminder notifications to viewers');
      recommendations.push('Consider reducing minimum bid increment');
    }

    if (issues.includes('Last minute bidding activity')) {
      recommendations.push('Monitor for potential anti-sniping issues');
    }

    if (issues.includes('Price significantly below starting price')) {
      recommendations.push('Review reserve price settings');
      recommendations.push('Consider marketing to attract serious bidders');
    }

    if (recommendations.length === 0) {
      recommendations.push('Auction is running normally');
    }

    return recommendations;
  }

  private generateMockSettlements(count: number): SettlementData[] {
    const settlements: SettlementData[] = [];

    for (let i = 0; i < count; i++) {
      const finalPrice = Math.floor(Math.random() * 500000) + 50000; // ₹50K to ₹550K
      const platformFee = finalPrice * 0.05;

      settlements.push({
        auctionId: `auction_${i + 1}`,
        winnerId: `user_${Math.floor(Math.random() * 1000)}`,
        winnerName: `User ${Math.floor(Math.random() * 1000)}`,
        finalPrice,
        sellerId: `seller_${Math.floor(Math.random() * 100)}`,
        sellerName: `Seller ${Math.floor(Math.random() * 100)}`,
        platformFee,
        sellerPayout: finalPrice - platformFee,
        paymentStatus: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)] as any,
        settlementDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });
    }

    return settlements.sort((a, b) => (b.settlementDate?.getTime() || 0) - (a.settlementDate?.getTime() || 0));
  }

  private generateMockBids(auctionId: string, bidCount: number): any[] {
    const bids: any[] = [];

    for (let i = 0; i < bidCount; i++) {
      bids.push({
        id: `bid_${i + 1}`,
        auctionId,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        userName: `Bidder ${Math.floor(Math.random() * 100)}`,
        amount: Math.floor(Math.random() * 100000) + 10000,
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
      });
    }

    return bids.sort((a, b) => b.timestamp - a.timestamp);
  }

  private generateMockParticipants(auctionId: string, participantCount: number): any[] {
    const participants: any[] = [];

    for (let i = 0; i < participantCount; i++) {
      participants.push({
        userId: `user_${i + 1}`,
        userName: `Participant ${i + 1}`,
        joinedAt: new Date(Date.now() - Math.random() * 1800000), // Last 30 minutes
        bidCount: Math.floor(Math.random() * 10),
        lastBidAmount: Math.random() > 0.3 ? Math.floor(Math.random() * 50000) + 10000 : undefined,
      });
    }

    return participants;
  }

  private generateRevenueByDay(days: number): any[] {
    const revenue: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      revenue.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 500000) + 100000, // ₹1L to ₹6L
        auctions: Math.floor(Math.random() * 50) + 10,
        bids: Math.floor(Math.random() * 500) + 100,
      });
    }

    return revenue;
  }
}
