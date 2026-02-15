import {
  Controller,
  Get,
  Post,
  Param,
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
import { Roles } from '../auth/roles.decorator';
import { ReputationService } from './reputation.service';

@ApiTags('reputation')
@Controller('reputation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reputation score for a user' })
  @ApiResponse({ status: 200, description: 'Reputation score retrieved' })
  async getUserReputation(@Param('userId') userId: string) {
    return this.reputationService.calculateUserReputation(userId);
  }

  @Get('my-score')
  @ApiOperation({ summary: 'Get current user reputation score' })
  @ApiResponse({ status: 200, description: 'User reputation retrieved' })
  async getMyReputation(@Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    return this.reputationService.calculateUserReputation(userId);
  }

  @Get('asset/:productId')
  @ApiOperation({ summary: 'Get reputation analysis for an asset' })
  @ApiResponse({ status: 200, description: 'Asset reputation retrieved' })
  async getAssetReputation(@Param('productId') productId: string) {
    return this.reputationService.calculateAssetReputation(productId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top reputable users leaderboard' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.reputationService.getTopReputableUsers(limitNum);
  }

  @Get('statistics')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get reputation system statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getReputationStatistics() {
    return this.reputationService.getReputationStatistics();
  }

  @Post('refresh/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Force refresh user reputation score (admin only)' })
  @ApiResponse({ status: 200, description: 'Reputation refreshed' })
  async refreshUserReputation(@Param('userId') userId: string) {
    const reputation = await this.reputationService.calculateUserReputation(userId);
    return {
      message: 'Reputation score refreshed',
      userId,
      newScore: reputation.overallScore,
      trustLevel: reputation.trustLevel,
    };
  }

  @Get('trust-levels')
  @ApiOperation({ summary: 'Get trust level definitions and requirements' })
  @ApiResponse({ status: 200, description: 'Trust levels retrieved' })
  getTrustLevelDefinitions() {
    return {
      excellent: {
        minScore: 90,
        description: 'Elite users with exceptional track record',
        benefits: ['Priority support', 'Exclusive access', 'Premium features'],
      },
      high: {
        minScore: 75,
        description: 'Highly trusted users with proven reliability',
        benefits: ['Enhanced visibility', 'Faster processing', 'Trusted badge'],
      },
      medium: {
        minScore: 60,
        description: 'Established users with good standing',
        benefits: ['Standard features', 'Basic trust indicators'],
      },
      low: {
        minScore: 0,
        description: 'New or developing users',
        benefits: ['Basic access', 'Learning period'],
      },
    };
  }

  @Get('risk-assessment/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get detailed risk assessment for user (admin only)' })
  @ApiResponse({ status: 200, description: 'Risk assessment retrieved' })
  async getRiskAssessment(@Param('userId') userId: string) {
    const reputation = await this.reputationService.calculateUserReputation(userId);

    return {
      userId,
      riskLevel: reputation.riskLevel,
      riskFactors: this.analyzeRiskFactors(reputation),
      recommendations: this.generateRiskRecommendations(reputation),
      lastAssessment: reputation.lastCalculated,
    };
  }

  // Private helper methods
  private analyzeRiskFactors(reputation: any): string[] {
    const factors: string[] = [];

    if (reputation.factors.paymentReliability.disputeRate > 10) {
      factors.push('High dispute rate in payments');
    }

    if (reputation.factors.auctionParticipation.completionRate < 70) {
      factors.push('Low auction completion rate');
    }

    if (reputation.factors.accountStanding.accountAge < 30) {
      factors.push('Very new account');
    }

    if (!reputation.factors.accountStanding.kycVerified) {
      factors.push('KYC not verified');
    }

    return factors.length > 0 ? factors : ['No significant risk factors'];
  }

  private generateRiskRecommendations(reputation: any): string[] {
    const recommendations: string[] = [];

    if (reputation.riskLevel === 'high') {
      recommendations.push('Enhanced monitoring required');
      recommendations.push('Transaction limits recommended');
      recommendations.push('Additional verification steps');
    } else if (reputation.riskLevel === 'medium') {
      recommendations.push('Standard monitoring');
      recommendations.push('Regular review recommended');
    } else {
      recommendations.push('Low-risk user - standard procedures apply');
    }

    return recommendations;
  }
}
