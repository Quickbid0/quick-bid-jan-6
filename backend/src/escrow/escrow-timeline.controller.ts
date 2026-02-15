import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { EscrowTimelineService } from './escrow-timeline.service';

@ApiTags('escrow-timeline')
@Controller('escrow-timeline')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EscrowTimelineController {
  constructor(private readonly timelineService: EscrowTimelineService) {}

  @Get(':escrowId')
  @ApiOperation({ summary: 'Get escrow timeline with progress tracking' })
  @ApiResponse({ status: 200, description: 'Escrow timeline retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Escrow not found' })
  async getEscrowTimeline(@Param('escrowId') escrowId: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.timelineService.getEscrowTimeline(escrowId, userId);
  }

  @Get('user/my-timelines')
  @ApiOperation({ summary: 'Get all escrow timelines for current user' })
  @ApiResponse({ status: 200, description: 'User escrow timelines retrieved' })
  async getMyEscrowTimelines(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.timelineService.getUserEscrowTimelines(userId);
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get escrow timeline analytics for user' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getEscrowAnalytics(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.timelineService.getEscrowTimelineAnalytics(userId);
  }

  @Get('progress-summary')
  @ApiOperation({ summary: 'Get progress summary of all user escrows' })
  @ApiResponse({ status: 200, description: 'Progress summary retrieved' })
  async getProgressSummary(@Req() req: Request) {
    const userId = (req as any).user?.id;
    const timelines = await this.timelineService.getUserEscrowTimelines(userId);

    const summary = {
      totalEscrows: timelines.length,
      activeEscrows: timelines.filter(t => t.status === 'active').length,
      completedEscrows: timelines.filter(t => t.status === 'completed').length,
      disputedEscrows: timelines.filter(t => t.status === 'disputed').length,
      averageProgress: timelines.length > 0
        ? Math.round(timelines.reduce((sum, t) => sum + t.progressPercentage, 0) / timelines.length)
        : 0,
      upcomingDeadlines: timelines
        .filter(t => t.nextAction?.deadline)
        .map(t => ({
          escrowId: t.escrowId,
          action: t.nextAction!.title,
          deadline: t.nextAction!.deadline,
          daysLeft: Math.ceil((t.nextAction!.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        }))
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, 3), // Next 3 deadlines
    };

    return summary;
  }
}
