import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DisputeResolutionService, CreateDisputeData, EscrowHoldData, ArbitrationCaseData } from './dispute-resolution.service';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputeResolutionController {
  constructor(private readonly disputeService: DisputeResolutionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('evidence', 10)) // Allow up to 10 evidence files
  @ApiOperation({ summary: 'Create a new dispute' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        auctionId: { type: 'string', description: 'Auction ID' },
        productId: { type: 'string', description: 'Product ID' },
        buyerId: { type: 'string', description: 'Buyer user ID' },
        sellerId: { type: 'string', description: 'Seller user ID' },
        disputeType: {
          type: 'string',
          enum: ['PRODUCT_CONDITION', 'DELIVERY_ISSUE', 'PAYMENT_DISPUTE', 'FRAUD_SUSPICION', 'CONTRACT_BREACH', 'INSPECTION_DISCREPANCY', 'OTHER'],
          description: 'Type of dispute'
        },
        title: { type: 'string', description: 'Dispute title' },
        description: { type: 'string', description: 'Detailed description' },
        evidence: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Evidence files (images/videos/documents)',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Dispute priority (optional)',
          required: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or dispute already exists' })
  async createDispute(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one evidence file is required');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 evidence files allowed');
    }

    // Simulate file URLs (in real implementation, upload to cloud storage)
    const evidence = files.map((file, index) =>
      `https://dispute-evidence.quickmela.com/${body.auctionId}/evidence_${index + 1}.${file.originalname.split('.').pop()}`
    );

    const disputeData: CreateDisputeData = {
      auctionId: body.auctionId,
      productId: body.productId,
      buyerId: body.buyerId || userId, // Allow admin to specify or use current user
      sellerId: body.sellerId,
      disputeType: body.disputeType,
      title: body.title,
      description: body.description,
      evidence,
      priority: body.priority,
    };

    return this.disputeService.createDispute(disputeData);
  }

  @Get('my-disputes')
  @ApiOperation({ summary: 'Get current user disputes' })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  async getMyDisputes(@Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.disputeService.getUserDisputes(userId);
  }

  @Get(':disputeId')
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiResponse({ status: 200, description: 'Dispute details retrieved' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getDispute(@Param('disputeId') disputeId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;

    const dispute = await this.disputeService.getDispute(disputeId, userId);

    if (!dispute) {
      throw new BadRequestException('Dispute not found or access denied');
    }

    return dispute;
  }

  @Post(':disputeId/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger AI analysis for dispute' })
  @ApiResponse({ status: 200, description: 'AI analysis completed' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async analyzeDispute(@Param('disputeId') disputeId: string) {
    return this.disputeService.analyzeDispute(disputeId);
  }

  @Post('escrow/hold')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Hold funds in escrow for dispute resolution' })
  @ApiResponse({ status: 201, description: 'Escrow hold created successfully' })
  async holdInEscrow(@Body() escrowData: EscrowHoldData) {
    return this.disputeService.holdInEscrow(escrowData);
  }

  @Post('escrow/:escrowId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release funds from escrow' })
  @ApiResponse({ status: 200, description: 'Escrow released successfully' })
  async releaseEscrow(
    @Param('escrowId') escrowId: string,
    @Body() body: {
      releaseTo: 'buyer' | 'seller' | 'split';
      releaseNotes: string;
      buyerAmount?: number;
      sellerAmount?: number;
    },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.disputeService.releaseEscrow(
      escrowId,
      body.releaseTo,
      body.releaseNotes,
      userId,
      body.buyerAmount,
      body.sellerAmount
    );
  }

  @Post('arbitration')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create arbitration case for dispute' })
  @ApiResponse({ status: 201, description: 'Arbitration case created successfully' })
  async createArbitration(@Body() arbitrationData: ArbitrationCaseData) {
    return this.disputeService.createArbitrationCase(arbitrationData);
  }

  @Put(':disputeId/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a dispute' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async resolveDispute(
    @Param('disputeId') disputeId: string,
    @Body() body: {
      resolution: string;
      resolutionNotes: string;
      refundAmount?: number;
      penaltyAmount?: number;
    },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.disputeService.resolveDispute(
      disputeId,
      body.resolution as any,
      body.resolutionNotes,
      userId,
      body.refundAmount,
      body.penaltyAmount
    );
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get dispute resolution statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getDisputeStats() {
    return this.disputeService.getDisputeStatistics();
  }

  @Get('admin/all')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all disputes (admin only)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by dispute status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by dispute priority' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  async getAllDisputes(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('limit') limit?: string
  ) {
    // In a real implementation, this would query with filters
    const limitNum = limit ? parseInt(limit) : 50;

    // Mock response - would implement proper admin query
    return {
      disputes: [],
      totalCount: 0,
      filters: { status, priority, limit: limitNum },
    };
  }

  @Get('escrow/active')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get active escrow holds (admin only)' })
  @ApiResponse({ status: 200, description: 'Active escrow holds retrieved' })
  async getActiveEscrowHolds() {
    // In a real implementation, query active escrow holds
    return {
      escrowHolds: [],
      totalAmount: 0,
    };
  }

  @Get('arbitration/pending')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pending arbitration cases (admin only)' })
  @ApiResponse({ status: 200, description: 'Pending arbitration cases retrieved' })
  async getPendingArbitrationCases() {
    // In a real implementation, query pending arbitration cases
    return {
      arbitrationCases: [],
      totalCount: 0,
    };
  }
}
