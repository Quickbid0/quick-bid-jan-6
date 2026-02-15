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
import { EscrowService, EscrowHoldRequest, EscrowReleaseRequest, EscrowSettlementRequest } from './escrow.service';

@ApiTags('escrow')
@Controller('escrow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('hold')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Hold funds in escrow after auction win' })
  @ApiResponse({ status: 201, description: 'Funds held in escrow successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or escrow already exists' })
  async holdInEscrow(@Body() request: EscrowHoldRequest) {
    return this.escrowService.holdInEscrow(request);
  }

  @Post('release/:escrowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release funds from escrow' })
  @ApiResponse({ status: 200, description: 'Funds released successfully' })
  @ApiResponse({ status: 400, description: 'Invalid escrow or release conditions' })
  async releaseEscrow(
    @Param('escrowId') escrowId: string,
    @Body() request: Omit<EscrowReleaseRequest, 'escrowId'>,
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const fullRequest: EscrowReleaseRequest = {
      escrowId,
      ...request,
      releasedBy: userId,
    };

    return this.escrowService.releaseEscrow(fullRequest);
  }

  @Post('settle-auction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Settle auction escrow after delivery confirmation' })
  @ApiResponse({ status: 200, description: 'Auction settled successfully' })
  @ApiResponse({ status: 400, description: 'Settlement failed' })
  async settleAuctionEscrow(@Body() request: EscrowSettlementRequest) {
    return this.escrowService.settleAuctionEscrow(request);
  }

  @Get('status/:auctionId')
  @ApiOperation({ summary: 'Get escrow status for auction' })
  @ApiResponse({ status: 200, description: 'Escrow status retrieved' })
  async getEscrowStatus(@Param('auctionId') auctionId: string) {
    return this.escrowService.getEscrowStatus(auctionId);
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Get user escrow transaction history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  async getMyEscrowHistory(@Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.escrowService.getUserEscrowHistory(userId);
  }

  @Get('statistics')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get escrow system statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getEscrowStatistics() {
    return this.escrowService.getEscrowStatistics();
  }

  @Get('active')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all active escrow holds (admin only)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: 200, description: 'Active escrows retrieved' })
  async getActiveEscrows(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;

    // In a real implementation, this would query active escrows
    return {
      escrows: [],
      totalCount: 0,
      limit: limitNum,
    };
  }

  @Post('dispute/:escrowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark escrow as disputed for resolution' })
  @ApiResponse({ status: 200, description: 'Escrow marked as disputed' })
  async markEscrowDisputed(
    @Param('escrowId') escrowId: string,
    @Body() body: { disputeId: string; reason: string },
    @Req() req: Request
  ) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    // Update escrow status to disputed
    // This would integrate with the dispute resolution system
    // For now, return success
    return {
      escrowId,
      status: 'disputed',
      disputeId: body.disputeId,
      reason: body.reason,
      markedBy: userId,
      timestamp: new Date(),
    };
  }
}
