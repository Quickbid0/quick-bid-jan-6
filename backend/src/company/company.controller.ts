import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CompanyService, BulkUploadProduct, BulkUploadResult } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as csv from 'csv-parser';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        companyId?: string;
        twoFactorEnabled?: boolean;
      };
    }
  }
}

@ApiTags('company')
@Controller('company')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company' })
  @ApiResponse({ status: 201, description: 'Company registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerCompany(@Body() companyData: any, @Req() req: Request) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    return this.companyService.createCompany({
      companyName: companyData.companyName,
      companyType: companyData.companyType,
      registrationNumber: companyData.registrationNumber,
      gstNumber: companyData.gstNumber,
      createdByAdminId: adminId,
    });
  }

  @Post('request-registration')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit company registration request' })
  @ApiResponse({ status: 201, description: 'Registration request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestCompanyRegistration(@Body() requestData: any) {
    const {
      companyName,
      companyType,
      registrationNumber,
      gstNumber,
      contactPerson,
      contactEmail,
      contactPhone,
      businessAddress,
    } = requestData;

    // Create registration request (simulated - would be stored in a separate table)
    const registrationRequest = {
      id: `req_${Date.now()}`,
      companyName,
      companyType,
      registrationNumber,
      gstNumber,
      contactPerson,
      contactEmail,
      contactPhone,
      businessAddress,
      status: 'pending',
      submittedAt: new Date(),
    };

    // In real implementation, store in database
    // For now, we'll just return success

    return {
      message: 'Company registration request submitted successfully',
      requestId: registrationRequest.id,
      status: 'pending',
      nextSteps: [
        'Super Admin will review your request within 24-48 hours',
        'You will receive an email confirmation once approved',
        'Account creation will be handled by our admin team',
      ],
    };
  }

  @Post('approve-registration/:requestId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve company registration request' })
  @ApiResponse({ status: 200, description: 'Registration approved and account created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async approveRegistration(@Param('requestId') requestId: string, @Body() approvalData: any, @Req() req: Request) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const {
      companyName,
      companyType,
      registrationNumber,
      gstNumber,
      branchAllocation,
      securityLevel,
      ownerEmail,
      ownerName,
    } = approvalData;

    // Create the company
    const company = await this.companyService.createCompany({
      companyName,
      companyType,
      registrationNumber,
      gstNumber,
      createdByAdminId: adminId,
    });

    // Create the COMPANY_OWNER user account
    const ownerUser = await this.companyService.createCompanyOwnerUser(company.id, {
      email: ownerEmail,
      name: ownerName,
      passwordHash: '$2b$10$dummy.hash.for.demo.purposes.only', // In real implementation, generate secure password
    });

    // Add additional metadata for company owner
    await this.prisma.user.update({
      where: { id: ownerUser.id },
      data: {
        // Add any additional fields for company owner setup
      },
    });

    // Log the account creation
    await this.auditService.logActivity({
      userId: adminId,
      action: 'COMPANY_OWNER_ACCOUNT_CREATED',
      resource: 'company',
      resourceId: company.id,
      category: 'admin',
      severity: 'high',
      method: 'POST',
      metadata: {
        companyId: company.id,
        ownerId: ownerUser.id,
        branchAllocation,
        securityLevel,
      },
    });

    return {
      message: 'Company registration approved and account created',
      company: {
        id: company.id,
        companyName: company.companyName,
        companyType: company.companyType,
        isVerified: company.isVerified,
        createdAt: company.createdAt,
      },
      ownerAccount: {
        id: ownerUser.id,
        email: ownerUser.email,
        name: ownerUser.name,
        role: ownerUser.role,
        companyId: ownerUser.companyId,
        temporaryPassword: 'TempPass123!', // In real implementation, send via email
      },
      branchAllocation,
      securityLevel,
    };
  }

  @Post('create-owner-account/:companyId')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create COMPANY_OWNER account for existing company' })
  @ApiResponse({ status: 201, description: 'Owner account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCompanyOwnerAccount(
    @Param('companyId') companyId: string,
    @Body() accountData: any,
    @Req() req: Request
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const { email, name, branchAllocation, securityLevel } = accountData;

    // Verify company exists
    const company = await this.companyService.getCompanyById(companyId);
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Create the COMPANY_OWNER user account
    const ownerUser = await this.companyService.createCompanyOwnerUser(companyId, {
      email,
      name,
      passwordHash: '$2b$10$dummy.hash.for.demo.purposes.only', // In real implementation, generate secure password
    });

    // Log the account creation
    await this.auditService.logActivity({
      userId: adminId,
      action: 'COMPANY_OWNER_ACCOUNT_CREATED',
      resource: 'company',
      resourceId: companyId,
      category: 'admin',
      severity: 'high',
      method: 'POST',
      metadata: {
        companyId,
        ownerId: ownerUser.id,
        branchAllocation,
        securityLevel,
      },
    });

    return {
      message: 'Company owner account created successfully',
      company: {
        id: company.id,
        companyName: company.companyName,
      },
      ownerAccount: {
        id: ownerUser.id,
        email: ownerUser.email,
        name: ownerUser.name,
        role: ownerUser.role,
        companyId: ownerUser.companyId,
        temporaryPassword: 'TempPass123!', // In real implementation, send via email
      },
      branchAllocation,
      securityLevel,
    };
  }

  @Post('bulk-upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload vehicles for company' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file containing vehicle data',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Bulk upload processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or data format' })
  async bulkUploadVehicles(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ): Promise<BulkUploadResult> {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      throw new BadRequestException('Company authentication required');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    let products: BulkUploadProduct[] = [];

    try {
      if (file.originalname.endsWith('.csv')) {
        products = await this.parseCSV(file.buffer);
      } else if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        products = this.parseExcel(file.buffer);
      } else {
        throw new BadRequestException('Unsupported file format. Use CSV or Excel');
      }
    } catch (error) {
      throw new BadRequestException(`File parsing error: ${error.message}`);
    }

    if (products.length === 0) {
      throw new BadRequestException('No valid products found in file');
    }

    return this.companyService.bulkUploadProducts(companyId, userId, products);
  }

  private async parseCSV(buffer: Buffer): Promise<BulkUploadProduct[]> {
    return new Promise((resolve, reject) => {
      const results: BulkUploadProduct[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          try {
            const product: BulkUploadProduct = {
              vehicle_type: data.vehicle_type?.toLowerCase(),
              brand: data.brand?.trim(),
              model: data.model?.trim(),
              registration_year: parseInt(data.registration_year),
              base_price: parseFloat(data.base_price),
              location: data.location?.trim(),
              repo_status: data.repo_status?.trim(),
              inspection_report: data.inspection_report?.trim(),
              images: data.images ? data.images.split(',').map(img => img.trim()) : [],
            };
            results.push(product);
          } catch (error) {
            // Skip invalid rows, collect errors in service
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private parseExcel(buffer: Buffer): BulkUploadProduct[] {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    return jsonData.map((row: any) => ({
      vehicle_type: row.vehicle_type?.toLowerCase(),
      brand: row.brand?.trim(),
      model: row.model?.trim(),
      registration_year: parseInt(row.registration_year),
      base_price: parseFloat(row.base_price),
      location: row.location?.trim(),
      repo_status: row.repo_status?.trim(),
      inspection_report: row.inspection_report?.trim(),
      images: row.images ? row.images.split(',').map(img => img.trim()) : [],
    }));
  }

  @Post('approve-bulk-upload/:batchId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve bulk upload batch' })
  @ApiResponse({ status: 200, description: 'Bulk upload approved' })
  async approveBulkUpload(@Param('batchId') batchId: string, @Req() req: Request) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.companyService.approveBulkUpload(batchId, adminId);
    return { message: 'Bulk upload approved successfully' };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get company dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(@Req() req: Request) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new BadRequestException('Company authentication required');
    }

    // Mock dashboard data - in real implementation, this would aggregate from database
    return {
      overview: {
        totalListings: 45,
        activeListings: 12,
        soldVehicles: 28,
        pendingApprovals: 5,
        totalRevenue: 2850000,
        monthlyRevenue: 450000
      },
      recentActivity: [
        { type: 'upload', title: 'Bulk upload processed', time: '2 hours ago' },
        { type: 'approval', title: 'Vehicles approved by admin', time: '4 hours ago' },
        { type: 'sale', title: 'Toyota Innova sold', time: '1 day ago' }
      ],
      analytics: {
        listingsByCategory: { car: 35, bike: 10 },
        salesByMonth: [320000, 380000, 420000, 450000],
        topPerformingListings: [
          { title: 'Honda City 2020', views: 1250, bids: 45 },
          { title: 'Maruti Swift 2019', views: 980, bids: 32 }
        ]
      }
    };
  }

  @Get('bulk-upload-history')
  @ApiOperation({ summary: 'Get bulk upload history' })
  @ApiResponse({ status: 200, description: 'Upload history retrieved' })
  async getBulkUploadHistory(@Req() req: Request) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new BadRequestException('Company authentication required');
    }

    return this.companyService.getBulkUploadHistory(companyId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get company analytics' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved' })
  async getAnalytics(@Query('period') period: string = 'monthly', @Req() req: Request) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new BadRequestException('Company authentication required');
    }

    // Mock analytics data - in real implementation, this would aggregate from database
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
        averageTimeToSale: 14
      },
      performance: {
        conversionRate: 68.5,
        averageViewsPerListing: 850,
        averageBidsPerListing: 12,
        customerSatisfaction: 4.8
      },
      topCategories: [
        { category: 'car', count: 35, revenue: 2200000 },
        { category: 'bike', count: 10, revenue: 650000 }
      ]
    };
  }

  @Get('list')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Companies retrieved' })
  async getCompanies() {
    return this.companyService.getCompanies();
  }

  @Post('staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add staff member to company' })
  @ApiResponse({ status: 201, description: 'Staff member added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addStaffMember(@Body() staffData: any, @Req() req: Request) {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      throw new BadRequestException('Company authentication required');
    }

    const { email, name, role } = staffData;

    // Verify the role is valid for company staff
    const validRoles = ['COMPANY_MANAGER', 'UPLOAD_OPERATOR', 'FINANCE_ANALYST'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const staffMember = await this.companyService.addCompanyStaff(companyId, {
      email,
      name,
      passwordHash: '$2b$10$dummy.hash.for.demo.purposes.only', // In real implementation, generate secure password
      role,
    });

    // Log the staff addition
    await this.auditService.logActivity({
      userId,
      action: 'COMPANY_STAFF_ADDED',
      resource: 'company',
      resourceId: companyId,
      category: 'admin',
      severity: 'medium',
      method: 'POST',
      metadata: {
        companyId,
        staffId: staffMember.id,
        staffEmail: staffMember.email,
        staffRole: staffMember.role,
      },
    });

    return {
      message: 'Staff member added successfully',
      staffMember: {
        id: staffMember.id,
        email: staffMember.email,
        name: staffMember.name,
        role: staffMember.role,
        companyId: staffMember.companyId,
        temporaryPassword: 'TempPass123!', // In real implementation, send via email
      },
    };
  }

  @Get('staff')
  @ApiOperation({ summary: 'Get company staff members' })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  async getCompanyStaff(@Req() req: Request) {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new BadRequestException('Company authentication required');
    }

    const staffMembers = await this.prisma.user.findMany({
      where: {
        companyId,
        role: {
          in: ['COMPANY_MANAGER', 'UPLOAD_OPERATOR', 'FINANCE_ANALYST', 'COMPANY_OWNER'],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      staffMembers,
      totalCount: staffMembers.length,
    };
  }

  @Put('staff/:staffId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update staff member role' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateStaffMember(
    @Param('staffId') staffId: string,
    @Body() updateData: any,
    @Req() req: Request
  ) {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      throw new BadRequestException('Company authentication required');
    }

    const { role } = updateData;

    // Verify the role is valid for company staff
    const validRoles = ['COMPANY_MANAGER', 'UPLOAD_OPERATOR', 'FINANCE_ANALYST'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Verify the staff member belongs to the company
    const staffMember = await this.prisma.user.findFirst({
      where: {
        id: staffId,
        companyId,
      },
    });

    if (!staffMember) {
      throw new BadRequestException('Staff member not found in your company');
    }

    // Update the staff member
    const updatedStaff = await this.prisma.user.update({
      where: { id: staffId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Log the update
    await this.auditService.logActivity({
      userId,
      action: 'COMPANY_STAFF_UPDATED',
      resource: 'company',
      resourceId: companyId,
      category: 'admin',
      severity: 'medium',
      method: 'PUT',
      metadata: {
        companyId,
        staffId,
        oldRole: staffMember.role,
        newRole: role,
      },
    });

    return {
      message: 'Staff member updated successfully',
      staffMember: updatedStaff,
    };
  }

  @Delete('staff/:staffId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove staff member from company' })
  @ApiResponse({ status: 200, description: 'Staff member removed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async removeStaffMember(@Param('staffId') staffId: string, @Req() req: Request) {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      throw new BadRequestException('Company authentication required');
    }

    // Verify the staff member belongs to the company
    const staffMember = await this.prisma.user.findFirst({
      where: {
        id: staffId,
        companyId,
      },
    });

    if (!staffMember) {
      throw new BadRequestException('Staff member not found in your company');
    }

    // Cannot remove COMPANY_OWNER
    if (staffMember.role === 'COMPANY_OWNER') {
      throw new BadRequestException('Cannot remove company owner');
    }

    // Soft delete by updating status
    await this.prisma.user.update({
      where: { id: staffId },
      data: { status: 'DELETED' },
    });

    // Log the removal
    await this.auditService.logActivity({
      userId,
      action: 'COMPANY_STAFF_REMOVED',
      resource: 'company',
      resourceId: companyId,
      category: 'admin',
      severity: 'high',
      method: 'DELETE',
      metadata: {
        companyId,
        staffId,
        staffEmail: staffMember.email,
        staffRole: staffMember.role,
      },
    });

    return {
      message: 'Staff member removed successfully',
    };
  }
