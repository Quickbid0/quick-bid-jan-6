import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DealerOnboardingService, DealerOnboardingCampaign, DealerOnboardingApplication } from './dealer-onboarding.service';

@ApiTags('dealer-onboarding')
@Controller('dealer-onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealerOnboardingController {
  constructor(private readonly dealerService: DealerOnboardingService) {}

  // Campaign Management (Admin Only)
  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new dealer onboarding campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid campaign data' })
  async createCampaign(@Body() campaignData: Omit<DealerOnboardingCampaign, 'id' | 'performance'>, @Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!campaignData.name || !campaignData.targetRegions?.length) {
      throw new BadRequestException('Campaign name and target regions are required');
    }

    return this.dealerService.createDealerOnboardingCampaign({
      ...campaignData,
      performance: {
        dealersOnboarded: 0,
        vehiclesListed: 0,
        totalSpend: 0,
        conversionRate: 0,
      },
    });
  }

  @Get('campaigns')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all dealer campaigns' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by campaign status' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getCampaigns(@Query('status') status?: string) {
    // In a real implementation, this would query campaigns with filters
    return {
      campaigns: [],
      totalCount: 0,
      filters: { status },
    };
  }

  @Get('campaigns/:campaignId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get campaign details and performance' })
  @ApiResponse({ status: 200, description: 'Campaign details retrieved' })
  async getCampaign(@Param('campaignId') campaignId: string) {
    // In a real implementation, this would get specific campaign
    return {
      campaignId,
      // campaign details would be returned here
    };
  }

  // Dealer Applications
  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit dealer onboarding application' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  async submitApplication(@Body() applicationData: Omit<DealerOnboardingApplication, 'id' | 'status' | 'submittedAt'>) {
    // Validate required fields
    if (!applicationData.businessName || !applicationData.email || !applicationData.phone) {
      throw new BadRequestException('Business name, email, and phone are required');
    }

    return this.dealerService.submitDealerApplication(applicationData);
  }

  @Get('applications')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all dealer applications (admin only)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by application status' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter by application source' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  async getApplications(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 50;

    // In a real implementation, this would query applications with filters
    return {
      applications: [],
      totalCount: 0,
      filters: { status, source, limit: limitNum },
    };
  }

  @Put('applications/:applicationId/review')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Review and approve/reject dealer application' })
  @ApiResponse({ status: 200, description: 'Application reviewed successfully' })
  async reviewApplication(
    @Param('applicationId') applicationId: string,
    @Body() reviewData: {
      status: 'approved' | 'rejected';
      notes?: string;
      rejectionReason?: string;
    },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    return this.dealerService.reviewDealerApplication(
      applicationId,
      reviewData.status,
      userId,
      reviewData.notes,
      reviewData.rejectionReason
    );
  }

  // Public Campaign Information
  @Get('campaigns/public')
  @ApiOperation({ summary: 'Get active public campaigns for dealers' })
  @ApiResponse({ status: 200, description: 'Active campaigns retrieved' })
  async getPublicCampaigns() {
    // Return active campaigns that dealers can see
    return {
      campaigns: [
        {
          id: 'campaign_001',
          name: 'Premium Dealer Partnership Program',
          description: 'Join our network of premium dealerships with exclusive benefits',
          incentives: {
            signupBonus: 5000,
            firstSaleBonus: 10000,
            monthlyCommission: 0.5,
            marketingSupport: true,
            priorityListing: true,
          },
          regions: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'],
          dealerTypes: ['authorized', 'multi-brand'],
        },
        {
          id: 'campaign_002',
          name: 'Independent Dealer Growth Program',
          description: 'Scale your independent dealership with our platform',
          incentives: {
            signupBonus: 2000,
            firstSaleBonus: 5000,
            monthlyCommission: 0.3,
            marketingSupport: false,
            priorityListing: false,
          },
          regions: ['All Cities'],
          dealerTypes: ['independent', 'used_car_specialist'],
        },
      ],
      totalActive: 2,
    };
  }

  // Analytics and Reporting
  @Get('analytics/overview')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get dealer onboarding analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getDealerAnalytics() {
    return this.dealerService.getDealerOnboardingAnalytics();
  }

  @Post('analytics/report')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Generate dealer onboarding performance report' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async generateDealerReport(@Body() reportParams: {
    startDate: string;
    endDate: string;
  }) {
    const startDate = new Date(reportParams.startDate);
    const endDate = new Date(reportParams.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.dealerService.generateDealerOnboardingReport(startDate, endDate);
  }

  // Dealer Portal (for onboarded dealers)
  @Get('portal/dashboard')
  @ApiOperation({ summary: 'Get dealer portal dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDealerDashboard(@Req() req: Request) {
    const userId = (req as any).user?.id;

    // In a real implementation, this would get dealer-specific data
    return {
      dealerProfile: {
        businessName: 'Sample Dealership',
        tier: 'silver',
        verificationStatus: 'verified',
        onboardedAt: new Date(),
      },
      performance: {
        vehiclesListed: 25,
        vehiclesSold: 18,
        successRate: 72,
        averageSalePrice: 650000,
        monthlyRevenue: 25000,
      },
      incentives: {
        availableCredits: 5000,
        pendingBonuses: 1500,
        monthlyCommission: 0.4,
      },
      notifications: [
        {
          id: 'notif_001',
          type: 'bonus',
          title: 'First Sale Bonus Available',
          message: 'You have earned ₹2,000 bonus for your first sale',
          date: new Date(),
        },
        {
          id: 'notif_002',
          type: 'campaign',
          title: 'New Campaign Available',
          message: 'Premium Dealer Partnership Program is now open',
          date: new Date(),
        },
      ],
    };
  }

  @Post('portal/list-vehicle')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit vehicle for listing (dealer portal)' })
  @ApiResponse({ status: 201, description: 'Vehicle submitted for listing' })
  async submitVehicleForListing(@Body() vehicleData: {
    make: string;
    model: string;
    year: number;
    price: number;
    description: string;
    images: string[];
    location: string;
  }) {
    // In a real implementation, this would create a product listing for the dealer
    return {
      listingId: 'listing_' + Date.now(),
      status: 'submitted',
      estimatedApprovalTime: '2-4 hours',
      message: 'Your vehicle has been submitted for listing approval',
    };
  }

  @Get('portal/performance')
  @ApiOperation({ summary: 'Get dealer performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  async getDealerPerformance(@Req() req: Request) {
    const userId = (req as any).user?.id;

    // Mock performance data - would be calculated from actual sales data
    return {
      period: 'Last 30 days',
      metrics: {
        vehiclesListed: 12,
        vehiclesSold: 8,
        totalRevenue: 520000,
        averageSalePrice: 65000,
        successRate: 66.7,
        averageTimeToSell: 18, // days
      },
      trends: {
        listingsTrend: '+15%',
        salesTrend: '+22%',
        revenueTrend: '+28%',
      },
      benchmarks: {
        industryAvgSuccessRate: 45,
        topPerformerSuccessRate: 78,
        dealerRank: 15,
        totalDealers: 234,
      },
      recommendations: [
        'Consider lowering prices by 5-10% for faster sales',
        'List vehicles on Wednesdays for better visibility',
        'Add more high-quality photos to listings',
        'Focus on popular models in your region',
      ],
    };
  }
}
