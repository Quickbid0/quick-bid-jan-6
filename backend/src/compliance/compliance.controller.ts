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
import { ComplianceService, ComplianceDocumentData, LegalConsentData, NBFCComplianceData, GSTInvoiceData } from './compliance.service';

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  // Compliance Document Management
  @Post('documents')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new compliance document' })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  async createComplianceDocument(@Body() data: ComplianceDocumentData, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.complianceService.createComplianceDocument(data, userId);
  }

  @Get('documents/:type')
  @ApiOperation({ summary: 'Get active compliance document by type' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  async getComplianceDocument(@Param('type') documentType: string) {
    const document = await this.complianceService.getActiveComplianceDocument(documentType);
    if (!document) {
      throw new BadRequestException('Document not found');
    }
    return document;
  }

  @Post('documents/:documentId/accept')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Accept a compliance document' })
  @ApiResponse({ status: 201, description: 'Document accepted successfully' })
  async acceptComplianceDocument(@Param('documentId') documentId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress as string;
    const userAgent = req.get('User-Agent');

    return this.complianceService.acceptComplianceDocument(userId, documentId, ipAddress, userAgent);
  }

  @Get('my-acceptances')
  @ApiOperation({ summary: 'Get user document acceptances' })
  @ApiResponse({ status: 200, description: 'Acceptances retrieved successfully' })
  async getMyDocumentAcceptances(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.complianceService.getUserDocumentAcceptances(userId);
  }

  // Legal Consent Management
  @Post('consents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record legal consent' })
  @ApiResponse({ status: 201, description: 'Consent recorded successfully' })
  async recordLegalConsent(@Body() data: LegalConsentData, @Req() req: Request) {
    const userId = (req as any).user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress as string;
    const userAgent = req.get('User-Agent');

    return this.complianceService.recordLegalConsent(userId, data, ipAddress, userAgent);
  }

  @Get('my-consents')
  @ApiOperation({ summary: 'Get user legal consents' })
  @ApiResponse({ status: 200, description: 'Consents retrieved successfully' })
  async getMyLegalConsents(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.complianceService.getUserLegalConsents(userId);
  }

  @Get('consents/:type/check')
  @ApiOperation({ summary: 'Check if user has valid consent for type' })
  @ApiResponse({ status: 200, description: 'Consent status checked' })
  async checkLegalConsent(@Param('type') consentType: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    const hasConsent = await this.complianceService.checkLegalConsent(userId, consentType);

    return {
      consentType,
      hasValidConsent: hasConsent,
      userId,
    };
  }

  // NBFC Compliance Management
  @Post('nbfc-records')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create NBFC compliance record' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  async createNBFCComplianceRecord(@Body() data: NBFCComplianceData, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.complianceService.createNBFCComplianceRecord(data, userId);
  }

  @Put('nbfc-records/:recordId/status')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update NBFC compliance record status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateNBFCComplianceStatus(
    @Param('recordId') recordId: string,
    @Body() body: { status: string; rejectionReason?: string },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;
    return this.complianceService.updateNBFCComplianceStatus(
      recordId,
      body.status,
      userId,
      body.rejectionReason
    );
  }

  @Get('my-nbfc-records')
  @ApiOperation({ summary: 'Get user NBFC compliance records' })
  @ApiResponse({ status: 200, description: 'Records retrieved successfully' })
  async getMyNBFCComplianceRecords(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.complianceService.getNBFCComplianceRecords(userId);
  }

  // GST Invoice Management
  @Post('gst-invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate GST invoice' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  async generateGSTInvoice(@Body() data: GSTInvoiceData) {
    return this.complianceService.generateGSTInvoice(data);
  }

  @Get('my-gst-invoices')
  @ApiOperation({ summary: 'Get user GST invoices' })
  @ApiQuery({ name: 'role', required: false, description: 'seller or buyer' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async getMyGSTInvoices(@Query('role') role: 'seller' | 'buyer' = 'buyer', @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.complianceService.getGSTInvoices(userId, role);
  }

  @Put('gst-invoices/:invoiceId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update GST invoice status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateInvoiceStatus(
    @Param('invoiceId') invoiceId: string,
    @Body() body: { status: string; paymentDate?: string }
  ) {
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : undefined;
    return this.complianceService.updateInvoiceStatus(invoiceId, body.status, paymentDate);
  }

  // Compliance Audit Trail
  @Get('audit-trail')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Export compliance audit trail' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'complianceType', required: false, description: 'Filter by compliance type' })
  @ApiQuery({ name: 'riskLevel', required: false, description: 'Filter by risk level' })
  @ApiResponse({ status: 200, description: 'Audit trail exported successfully' })
  async exportComplianceAuditTrail(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('userId') userId?: string,
    @Query('complianceType') complianceType?: string,
    @Query('riskLevel') riskLevel?: string
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.complianceService.exportComplianceAuditTrail(startDate, endDate, {
      userId,
      complianceType,
      riskLevel,
    });
  }

  // Compliance Statistics
  @Get('statistics')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get compliance statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getComplianceStatistics() {
    return this.complianceService.getComplianceStatistics();
  }

  // Required Compliance Checks
  @Post('auction-participation-consent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record auction participation consent' })
  @ApiResponse({ status: 200, description: 'Consent recorded successfully' })
  async recordAuctionParticipationConsent(@Req() req: Request) {
    const userId = (req as any).user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress as string;
    const userAgent = req.get('User-Agent');

    const consentData: LegalConsentData = {
      consentType: 'auction_participation',
      consentVersion: '1.0',
      consentText: 'I agree to participate in auctions and abide by all terms and conditions.',
      withdrawalNotice: 'You may withdraw consent by contacting support.',
    };

    return this.complianceService.recordLegalConsent(userId, consentData, ipAddress, userAgent);
  }

  @Post('repo-asset-disclaimer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept repo asset disclaimer' })
  @ApiResponse({ status: 200, description: 'Disclaimer accepted successfully' })
  async acceptRepoAssetDisclaimer(@Req() req: Request) {
    const userId = (req as any).user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress as string;
    const userAgent = req.get('User-Agent');

    const consentData: LegalConsentData = {
      consentType: 'repo_asset_purchase',
      consentVersion: '1.0',
      consentText: 'I understand that repo assets may have been repossessed and acknowledge the associated risks.',
      withdrawalNotice: 'Disclaimer acceptance cannot be withdrawn once purchase is completed.',
    };

    return this.complianceService.recordLegalConsent(userId, consentData, ipAddress, userAgent);
  }
}
