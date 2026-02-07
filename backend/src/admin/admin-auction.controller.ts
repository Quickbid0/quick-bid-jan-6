import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuctionService } from './admin-auction.service';

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

interface AdminActionRequest {
  auctionId: string;
  action: 'start' | 'pause' | 'resume' | 'end' | 'extend' | 'cancel';
  reason?: string;
  parameters?: Record<string, any>;
}

@ApiTags('admin-auctions')
@Controller('admin/auctions')
export class AdminAuctionController {
  constructor(private readonly adminAuctionService: AdminAuctionService) {}

  @Get('monitoring')
  @ApiOperation({ summary: 'Get real-time auction monitoring data' })
  @ApiResponse({ status: 200, description: 'Auction monitoring data retrieved' })
  async getAuctionMonitoring(@Query('status') status?: string): Promise<{
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
      const result = await this.adminAuctionService.getAuctionMonitoring(status);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch auction monitoring data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Get settlement data for completed auctions' })
  @ApiResponse({ status: 200, description: 'Settlement data retrieved' })
  async getSettlements(@Query('status') status?: string, @Query('limit') limit?: number): Promise<{
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
      const result = await this.adminAuctionService.getSettlements(status, limit);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch settlement data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':auctionId/details')
  @ApiOperation({ summary: 'Get detailed auction information' })
  @ApiResponse({ status: 200, description: 'Auction details retrieved' })
  async getAuctionDetails(@Param('auctionId') auctionId: string): Promise<{
    success: boolean;
    auction: any;
    bids: any[];
    participants: any[];
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const result = await this.adminAuctionService.getAuctionDetails(auctionId);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch auction details',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('action')
  @ApiOperation({ summary: 'Perform admin action on auction' })
  @ApiResponse({ status: 200, description: 'Action performed successfully' })
  async performAdminAction(@Body() actionRequest: AdminActionRequest): Promise<{
    success: boolean;
    message: string;
    auctionState?: any;
  }> {
    try {
      const result = await this.adminAuctionService.performAdminAction(actionRequest);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to perform admin action',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('settlements/:auctionId/process')
  @ApiOperation({ summary: 'Process settlement for completed auction' })
  @ApiResponse({ status: 200, description: 'Settlement processed successfully' })
  async processSettlement(@Param('auctionId') auctionId: string, @Body() body: { notes?: string }): Promise<{
    success: boolean;
    settlement: SettlementData;
    message: string;
  }> {
    try {
      const result = await this.adminAuctionService.processSettlement(auctionId, body.notes);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to process settlement',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get auction analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved' })
  async getAnalyticsOverview(@Query('period') period?: string): Promise<{
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
      const result = await this.adminAuctionService.getAnalyticsOverview(period);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch analytics data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('fraud-monitoring')
  @ApiOperation({ summary: 'Get fraud monitoring data' })
  @ApiResponse({ status: 200, description: 'Fraud monitoring data retrieved' })
  async getFraudMonitoring(): Promise<{
    success: boolean;
    alerts: any[];
    suspiciousActivities: any[];
    riskMetrics: any;
  }> {
    try {
      const result = await this.adminAuctionService.getFraudMonitoring();
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch fraud monitoring data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('emergency-controls')
  @ApiOperation({ summary: 'Emergency controls for auction platform' })
  @ApiResponse({ status: 200, description: 'Emergency action performed' })
  async performEmergencyAction(@Body() body: {
    action: 'pause_all' | 'resume_all' | 'shutdown' | 'maintenance_mode';
    reason: string;
    duration?: number; // minutes
  }): Promise<{
    success: boolean;
    message: string;
    affectedAuctions: number;
  }> {
    try {
      const result = await this.adminAuctionService.performEmergencyAction(body);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to perform emergency action',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({ status: 200, description: 'System health data retrieved' })
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
      const result = await this.adminAuctionService.getSystemHealth();
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch system health data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
