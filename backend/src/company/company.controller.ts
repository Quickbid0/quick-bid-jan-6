import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  private companies = new Map();
  private nextCompanyId = 1;

  constructor() {
    this.initializeSampleCompanies();
  }

  private initializeSampleCompanies() {
    const sampleCompanies = [
      {
        companyName: 'AutoDeal Pvt Ltd',
        email: 'contact@autodeal.com',
        phone: '9876543210',
        gstin: 'GSTIN1234567890',
        pan: 'PANABCDE1234F',
        businessType: 'Authorized Dealer',
        subscriptionTier: 'Premium',
        status: 'verified',
        createdAt: new Date()
      },
      {
        companyName: 'CarWorld Enterprises',
        email: 'info@carworld.com',
        phone: '9876543211',
        gstin: 'GSTIN0987654321',
        pan: 'PANXYZDE5678G',
        businessType: 'Multi-brand',
        subscriptionTier: 'Standard',
        status: 'verified',
        createdAt: new Date()
      }
    ];

    sampleCompanies.forEach(company => {
      this.companies.set(company.email, {
        id: (this.nextCompanyId++).toString(),
        ...company,
        address: {
          line1: 'Business Address',
          line2: 'Sector 1',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        contactPerson: {
          name: 'Contact Person',
          email: company.email,
          phone: company.phone,
          designation: 'Director'
        },
        documents: {
          gstinCertificate: 'gstin_cert.pdf',
          panCertificate: 'pan_cert.pdf',
          incorporationCertificate: 'inc_cert.pdf',
          addressProof: 'address_proof.pdf'
        },
        subscription: {
          tier: company.subscriptionTier,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          features: this.getFeaturesByTier(company.subscriptionTier),
          limits: this.getLimitsByTier(company.subscriptionTier)
        }
      });
    });

    // Sample companies initialized successfully
  }

  private getFeaturesByTier(tier: string) {
    const features = {
      'Basic': ['Basic listings', 'Standard support', 'Monthly reports'],
      'Standard': ['Bulk listings', 'Priority support', 'Weekly reports', 'Analytics'],
      'Premium': ['Unlimited listings', '24/7 support', 'Real-time analytics', 'API access', 'Dedicated account manager'],
      'Enterprise': ['Custom solutions', 'White-label options', 'Full API access', 'Custom integrations', 'On-premise option']
    };
    return features[tier] || features['Basic'];
  }

  private getLimitsByTier(tier: string) {
    const limits = {
      'Basic': { listings: 10, users: 2, storage: '1GB' },
      'Standard': { listings: 100, users: 10, storage: '10GB' },
      'Premium': { listings: 1000, users: 50, storage: '100GB' },
      'Enterprise': { listings: 'Unlimited', users: 'Unlimited', storage: 'Unlimited' }
    };
    return limits[tier] || limits['Basic'];
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a company' })
  @ApiResponse({ status: 201, description: 'Company registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerCompany(@Body() companyData: any) {
    const { companyName, email, phone, gstin, pan, businessType, subscriptionTier } = companyData;

    // Check if company already exists
    if (this.companies.has(email)) {
      throw new Error('Company already registered');
    }

    // Create new company
    const newCompany = {
      id: (this.nextCompanyId++).toString(),
      companyName,
      email,
      phone,
      gstin,
      pan,
      businessType,
      subscriptionTier: subscriptionTier || 'Basic',
      status: 'pending',
      createdAt: new Date(),
      address: companyData.address || {},
      contactPerson: companyData.contactPerson || {},
      documents: companyData.documents || {},
      subscription: {
        tier: subscriptionTier || 'Basic',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: this.getFeaturesByTier(subscriptionTier || 'Basic'),
        limits: this.getLimitsByTier(subscriptionTier || 'Basic')
      }
    };

    this.companies.set(email, newCompany);

    return {
      message: 'Company registration successful',
      company: {
        id: newCompany.id,
        companyName: newCompany.companyName,
        email: newCompany.email,
        status: newCompany.status,
        subscriptionTier: newCompany.subscriptionTier
      }
    };
  }

  @Post('bulk-register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk register company and users' })
  @ApiResponse({ status: 201, description: 'Bulk registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkRegister(@Body() bulkData: any) {
    const { companyName, contactEmail, users } = bulkData;

    // Register company first
    const companyResult = await this.registerCompany({
      companyName,
      email: contactEmail,
      phone: '9876543210',
      gstin: 'BULK' + Date.now(),
      pan: 'BULK' + Date.now(),
      businessType: 'Bulk Registration',
      subscriptionTier: 'Standard'
    });

    // In a real implementation, you would create users here
    // For now, we'll just return the company result
    return {
      message: 'Bulk registration successful',
      company: companyResult.company,
      usersRegistered: users.length,
      userCredentials: users.map(user => ({
        email: user.email,
        name: user.name,
        role: user.role,
        temporaryPassword: 'BulkPass123!'
      }))
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get company dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(@Req() req: Request) {
    // Mock dashboard data
    return {
      overview: {
        totalListings: 45,
        activeListings: 12,
        soldVehicles: 28,
        pendingBids: 15,
        totalRevenue: 2850000,
        monthlyRevenue: 450000
      },
      recentActivity: [
        { type: 'listing', title: 'Honda City listed', time: '2 hours ago' },
        { type: 'bid', title: 'New bid on Maruti Swift', time: '4 hours ago' },
        { type: 'sale', title: 'Toyota Innova sold', time: '1 day ago' }
      ],
      analytics: {
        listingsByCategory: { car: 35, suv: 8, mpv: 2 },
        salesByMonth: [320000, 380000, 420000, 450000],
        topPerformingListings: [
          { title: 'Honda City 2020', views: 1250, bids: 45 },
          { title: 'Maruti Swift 2019', views: 980, bids: 32 }
        ]
      },
      subscription: {
        tier: 'Premium',
        usedListings: 45,
        totalListings: 1000,
        usedUsers: 8,
        totalUsers: 50,
        daysRemaining: 285
      }
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get company analytics' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved' })
  async getAnalytics(@Query('period') period: string = 'monthly') {
    // Mock analytics data
    return {
      period,
      revenue: {
        total: 2850000,
        growth: 15.5,
        byMonth: [
          { month: 'Jan', revenue: 320000 },
          { month: 'Feb', revenue: 380000 },
          { month: 'Mar', revenue: 420000 },
          { month: 'Apr', revenue: 450000 }
        ]
      },
      listings: {
        total: 45,
        active: 12,
        sold: 28,
        averageSalePrice: 95000,
        averageTimeToSale: 14 // days
      },
      performance: {
        conversionRate: 68.5,
        averageViewsPerListing: 850,
        averageBidsPerListing: 12,
        customerSatisfaction: 4.8
      },
      topCategories: [
        { category: 'car', count: 35, revenue: 2200000 },
        { category: 'suv', count: 8, revenue: 550000 },
        { category: 'mpv', count: 2, revenue: 100000 }
      ]
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Companies retrieved' })
  async getCompanies() {
    const companies = Array.from(this.companies.values()).map(company => ({
      id: company.id,
      companyName: company.companyName,
      email: company.email,
      phone: company.phone,
      businessType: company.businessType,
      subscriptionTier: company.subscriptionTier,
      status: company.status,
      createdAt: company.createdAt
    }));

    return { companies };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved' })
  async getCompany(@Req() req: Request) {
    const companyId = req.params.id;
    
    for (const [email, company] of this.companies.entries()) {
      if (company.id === companyId) {
        return {
          company: {
            id: company.id,
            companyName: company.companyName,
            email: company.email,
            phone: company.phone,
            gstin: company.gstin,
            pan: company.pan,
            businessType: company.businessType,
            subscriptionTier: company.subscriptionTier,
            status: company.status,
            address: company.address,
            contactPerson: company.contactPerson,
            subscription: company.subscription,
            createdAt: company.createdAt
          }
        };
      }
    }

    throw new Error('Company not found');
  }
}
