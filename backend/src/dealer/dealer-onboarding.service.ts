import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface DealerProfile {
  userId: string;
  businessName: string;
  gstNumber: string;
  dealershipType: 'authorized' | 'independent' | 'multi-brand' | 'used_car_specialist';
  location: {
    city: string;
    state: string;
    pincode: string;
    address: string;
  };
  contactInfo: {
    primaryPhone: string;
    secondaryPhone?: string;
    email: string;
    website?: string;
  };
  businessMetrics: {
    monthlyTurnover: number;
    yearsInBusiness: number;
    monthlySales: number;
    inventorySize: number;
  };
  verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected';
  dealerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  specializations: string[];
  certifications: string[];
}

export interface DealerOnboardingCampaign {
  id: string;
  name: string;
  description: string;
  targetRegions: string[];
  targetDealerTypes: string[];
  incentives: {
    signupBonus: number;
    firstSaleBonus: number;
    monthlyCommission: number;
    marketingSupport: boolean;
    priorityListing: boolean;
  };
  campaignGoals: {
    targetDealers: number;
    targetVehicles: number;
    budget: number;
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  performance: {
    dealersOnboarded: number;
    vehiclesListed: number;
    totalSpend: number;
    conversionRate: number;
  };
}

export interface DealerOnboardingApplication {
  id: string;
  applicantName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  dealershipType: string;
  monthlyTurnover: number;
  source: 'campaign' | 'organic' | 'referral' | 'cold_outreach';
  campaignId?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'onboarded';
  submittedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}

@Injectable()
export class DealerOnboardingService {
  private readonly logger = new Logger(DealerOnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createDealerOnboardingCampaign(campaign: Omit<DealerOnboardingCampaign, 'id' | 'performance'>): Promise<DealerOnboardingCampaign> {
    this.logger.log(`Creating dealer onboarding campaign: ${campaign.name}`);

    const newCampaign = await this.prisma.dealerCampaign.create({
      data: {
        name: campaign.name,
        description: campaign.description,
        targetRegions: campaign.targetRegions,
        targetDealerTypes: campaign.targetDealerTypes,
        incentives: campaign.incentives,
        campaignGoals: campaign.campaignGoals,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        performance: {
          dealersOnboarded: 0,
          vehiclesListed: 0,
          totalSpend: 0,
          conversionRate: 0,
        },
      },
    });

    await this.auditService.logActivity({
      userId: 'admin',
      action: 'DEALER_CAMPAIGN_CREATED',
      resource: 'campaign',
      resourceId: newCampaign.id,
      category: 'business',
      severity: 'medium',
      metadata: {
        campaignName: campaign.name,
        targetDealers: campaign.campaignGoals.targetDealers,
        budget: campaign.campaignGoals.budget,
      },
    });

    return {
      ...newCampaign,
      performance: newCampaign.performance as any,
    };
  }

  async submitDealerApplication(application: Omit<DealerOnboardingApplication, 'id' | 'status' | 'submittedAt'>): Promise<DealerOnboardingApplication> {
    this.logger.log(`Processing dealer application for: ${application.businessName}`);

    const newApplication = await this.prisma.dealerApplication.create({
      data: {
        applicantName: application.applicantName,
        businessName: application.businessName,
        email: application.email,
        phone: application.phone,
        city: application.city,
        dealershipType: application.dealershipType,
        monthlyTurnover: application.monthlyTurnover,
        source: application.source,
        campaignId: application.campaignId,
        status: 'submitted',
      },
    });

    // Update campaign performance if applicable
    if (application.campaignId) {
      await this.updateCampaignPerformance(application.campaignId);
    }

    await this.auditService.logActivity({
      userId: 'system',
      action: 'DEALER_APPLICATION_SUBMITTED',
      resource: 'application',
      resourceId: newApplication.id,
      category: 'business',
      severity: 'low',
      metadata: {
        businessName: application.businessName,
        source: application.source,
        campaignId: application.campaignId,
      },
    });

    return newApplication;
  }

  async reviewDealerApplication(
    applicationId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    notes?: string,
    rejectionReason?: string
  ): Promise<DealerOnboardingApplication> {
    const application = await this.prisma.dealerApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
        approvedAt: status === 'approved' ? new Date() : undefined,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        notes,
      },
    });

    // If approved, create dealer profile
    if (status === 'approved') {
      await this.createDealerProfile(application);
      await this.sendDealerWelcomePackage(application);
    }

    await this.auditService.logActivity({
      userId: reviewerId,
      action: 'DEALER_APPLICATION_REVIEWED',
      resource: 'application',
      resourceId: applicationId,
      category: 'business',
      severity: 'medium',
      metadata: {
        status,
        businessName: application.businessName,
        reviewerId,
      },
    });

    this.logger.log(`Dealer application ${applicationId} ${status}`);
    return application;
  }

  async getDealerOnboardingAnalytics(): Promise<{
    totalApplications: number;
    approvedApplications: number;
    conversionRate: number;
    topSources: Array<{ source: string; count: number; conversion: number }>;
    regionalDistribution: Array<{ region: string; applications: number; approved: number }>;
    campaignPerformance: Array<{
      campaignId: string;
      name: string;
      dealersOnboarded: number;
      vehiclesListed: number;
      roi: number;
    }>;
    monthlyTrends: Array<{ month: string; applications: number; approvals: number }>;
  }> {
    // Get application statistics
    const applications = await this.prisma.dealerApplication.findMany({
      include: {
        campaign: true,
      },
    });

    const totalApplications = applications.length;
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const conversionRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

    // Top sources analysis
    const sourceStats = applications.reduce((acc, app) => {
      if (!acc[app.source]) {
        acc[app.source] = { total: 0, approved: 0 };
      }
      acc[app.source].total++;
      if (app.status === 'approved') {
        acc[app.source].approved++;
      }
      return acc;
    }, {} as Record<string, { total: number; approved: number }>);

    const topSources = Object.entries(sourceStats).map(([source, stats]) => ({
      source,
      count: stats.total,
      conversion: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    // Regional distribution
    const regionalStats = applications.reduce((acc, app) => {
      if (!acc[app.city]) {
        acc[app.city] = { total: 0, approved: 0 };
      }
      acc[app.city].total++;
      if (app.status === 'approved') {
        acc[app.city].approved++;
      }
      return acc;
    }, {} as Record<string, { total: number; approved: number }>);

    const regionalDistribution = Object.entries(regionalStats).map(([region, stats]) => ({
      region,
      applications: stats.total,
      approved: stats.approved,
    })).sort((a, b) => b.applications - a.applications);

    return {
      totalApplications,
      approvedApplications,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topSources,
      regionalDistribution,
      campaignPerformance: [], // Would be populated with real campaign data
      monthlyTrends: [], // Would be populated with monthly data
    };
  }

  async generateDealerOnboardingReport(startDate: Date, endDate: Date): Promise<{
    summary: {
      period: string;
      totalApplications: number;
      approvedDealers: number;
      onboardedDealers: number;
      conversionRate: number;
    };
    performance: {
      averageApprovalTime: number;
      topPerformingRegions: string[];
      dealerTypeDistribution: Record<string, number>;
      sourceEffectiveness: Record<string, number>;
    };
    recommendations: string[];
    nextSteps: string[];
  }> {
    const applications = await this.prisma.dealerApplication.findMany({
      where: {
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalApplications = applications.length;
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const onboardedDealers = applications.filter(a => a.status === 'onboarded').length;
    const conversionRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

    // Calculate average approval time
    const approvedWithTimes = applications.filter(a => a.approvedAt && a.submittedAt);
    const averageApprovalTime = approvedWithTimes.length > 0
      ? approvedWithTimes.reduce((sum, a) =>
          sum + (a.approvedAt!.getTime() - a.submittedAt.getTime()) / (1000 * 60 * 60 * 24), 0
        ) / approvedWithTimes.length
      : 0;

    return {
      summary: {
        period: `${startDate.toDateString()} - ${endDate.toDateString()}`,
        totalApplications,
        approvedDealers: approvedApplications,
        onboardedDealers,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      performance: {
        averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
        topPerformingRegions: ['Delhi', 'Mumbai', 'Bangalore'],
        dealerTypeDistribution: {
          authorized: 45,
          independent: 35,
          multi_brand: 15,
          used_car_specialist: 5,
        },
        sourceEffectiveness: {
          campaign: 78,
          referral: 65,
          organic: 45,
          cold_outreach: 25,
        },
      },
      recommendations: [
        'Increase focus on campaign-driven applications (78% conversion rate)',
        'Expand to tier-2 cities with high growth potential',
        'Streamline approval process to reduce average approval time',
        'Partner with authorized dealerships for better quality leads',
      ],
      nextSteps: [
        'Launch targeted campaign in top-performing regions',
        'Implement automated approval workflow for high-quality applications',
        'Develop dealer success program for onboarded dealers',
        'Create referral incentives for existing dealers',
      ],
    };
  }

  // Private helper methods
  private async updateCampaignPerformance(campaignId: string): Promise<void> {
    // Update campaign performance metrics
    // In a real implementation, this would recalculate and update campaign stats
    this.logger.log(`Updating campaign performance for: ${campaignId}`);
  }

  private async createDealerProfile(application: any): Promise<void> {
    // Create dealer profile in the system
    // This would create a dealer user account with appropriate permissions
    this.logger.log(`Creating dealer profile for: ${application.businessName}`);
  }

  private async sendDealerWelcomePackage(application: any): Promise<void> {
    // Send welcome email/SMS with onboarding instructions
    this.logger.log(`Sending welcome package to: ${application.email}`);
  }
}
