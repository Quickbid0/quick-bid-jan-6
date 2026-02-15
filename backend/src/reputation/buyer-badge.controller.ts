import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BuyerBadgeService, BuyerBadge } from '../reputation/buyer-badge.service';

@ApiTags('buyer-badge')
@Controller('buyer-badge')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BuyerBadgeController {
  constructor(private readonly badgeService: BuyerBadgeService) {}

  @Get('my-badge')
  @ApiOperation({ summary: 'Get current user buyer badge' })
  @ApiResponse({ status: 200, description: 'Badge retrieved successfully' })
  async getMyBadge(@Req() req: Request): Promise<BuyerBadge> {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.badgeService.getBuyerBadge(userId);
  }

  @Get('criteria')
  @ApiOperation({ summary: 'Get badge criteria and requirements' })
  @ApiResponse({ status: 200, description: 'Badge criteria retrieved' })
  getBadgeCriteria() {
    return this.badgeService.getBadgeCriteria();
  }

  @Get('benefits/:level')
  @ApiOperation({ summary: 'Get benefits for a specific badge level' })
  @ApiResponse({ status: 200, description: 'Benefits retrieved' })
  async getBadgeBenefits(@Param('level') level: string) {
    const validLevels = ['none', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
    if (!validLevels.includes(level)) {
      throw new BadRequestException('Invalid badge level');
    }

    return this.badgeService.getBadgeBenefits(level as any);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get buyer badge leaderboard' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.badgeService.getBadgeLeaderboard(limitNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get buyer badge statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getBadgeStats() {
    return this.badgeService.getBadgeStatistics();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get buyer badge for specific user (public info)' })
  @ApiResponse({ status: 200, description: 'Badge retrieved' })
  async getUserBadge(@Param('userId') userId: string) {
    // This endpoint returns public badge information
    const badge = await this.badgeService.getBuyerBadge(userId);

    // Return only public information
    return {
      level: badge.level,
      score: badge.score,
      benefits: badge.benefits,
      lastUpdated: badge.lastUpdated,
    };
  }
}
