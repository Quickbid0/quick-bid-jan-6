import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PenaltyService } from './penalty.service';

@ApiTags('penalties')
@Controller('penalties')
export class PenaltyController {
  constructor(private readonly penaltyService: PenaltyService) {}

  @Get('seller/:sellerId')
  @ApiOperation({ summary: 'Get seller penalties and cooldowns' })
  @ApiResponse({ status: 200, description: 'Penalties retrieved successfully' })
  async getSellerPenalties(@Param('sellerId') sellerId: string) {
    try {
      const penalties = await this.penaltyService.getActivePenalties(sellerId);
      const cooldowns = await this.penaltyService.getActiveCooldowns(sellerId);
      const riskScore = await this.penaltyService.calculateRiskScore(sellerId);
      const permissions = await this.penaltyService.checkSellerPermissions(sellerId);

      return {
        success: true,
        data: {
          penalties,
          cooldowns,
          sellerScore: riskScore.overallScore,
          canListProduct: permissions.canListProducts.allowed,
          canParticipateInAuction: permissions.canParticipateInAuctions.allowed
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve penalties'
      };
    }
  }

  @Post('add')
  @ApiOperation({ summary: 'Add penalty to seller' })
  @ApiResponse({ status: 200, description: 'Penalty added successfully' })
  async addPenalty(@Body() body: {
    sellerId: string;
    type: string;
    description: string;
    amount: number;
  }) {
    try {
      const penalty = await this.penaltyService.applyPenalty(
        body.sellerId,
        body.type as any,
        {
          description: body.description,
          relatedAuctionId: undefined,
          relatedBidId: undefined,
          evidence: undefined,
          reportedBy: 'admin'
        }
      );

      return {
        success: true,
        data: penalty,
        message: 'Penalty added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add penalty'
      };
    }
  }

  @Post('lift-cooldown/:sellerId')
  @ApiOperation({ summary: 'Lift seller cooldown' })
  @ApiResponse({ status: 200, description: 'Cooldown lifted successfully' })
  async liftCooldown(@Param('sellerId') sellerId: string) {
    try {
      // Mock implementation - in production this would update database
      return {
        success: true,
        message: 'Cooldown lifted successfully (mock implementation)'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to lift cooldown'
      };
    }
  }

  @Get('score/:sellerId')
  @ApiOperation({ summary: 'Get seller trust score' })
  @ApiResponse({ status: 200, description: 'Score retrieved successfully' })
  async getSellerScore(@Param('sellerId') sellerId: string) {
    try {
      const riskScore = await this.penaltyService.calculateRiskScore(sellerId);
      const score = riskScore.overallScore;
      
      return {
        success: true,
        data: {
          score,
          grade: this.getScoreGrade(score),
          status: this.getScoreStatus(score),
          riskLevel: riskScore.riskLevel,
          componentScores: riskScore.componentScores
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve seller score'
      };
    }
  }

  private getScoreGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }

  private getScoreStatus(score: number): string {
    if (score >= 70) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 30) return 'Fair';
    return 'Poor';
  }
}
