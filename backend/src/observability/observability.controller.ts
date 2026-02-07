import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ObservabilityService } from './observability.service';

@ApiTags('Observability')
@Controller('admin/observability')
@UseGuards(RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class ObservabilityController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authentication metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(@Query('timeRange') timeRange?: 'hour' | 'day' | 'week' | 'month') {
    return await this.observabilityService.getMetricsSummary(timeRange);
  }

  @Get('metrics/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export metrics for external monitoring' })
  @ApiResponse({ status: 200, description: 'Metrics exported successfully' })
  exportMetrics() {
    return {
      data: this.observabilityService.exportMetrics(),
      contentType: 'application/json',
      filename: `quickbid-auth-metrics-${new Date().toISOString().split('T')[0]}.json`
    };
  }

  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs (admin only)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('severity') severity?: string
  ) {
    const options: any = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    };

    if (action) options.action = action;
    if (userId) options.userId = userId;
    if (severity) options.severity = severity;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    return await this.observabilityService.getAuditLogs(options);
  }
}
