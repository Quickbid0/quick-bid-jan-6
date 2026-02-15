import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { WhatsAppService } from './whatsapp.service';
import { TemplateManagerService } from './template.manager';
import { NotificationQueueService } from './notification.queue';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private whatsAppService: WhatsAppService,
    private templateManager: TemplateManagerService,
    private notificationQueue: NotificationQueueService,
  ) {}

  @Post('whatsapp/opt-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Opt-in for WhatsApp notifications' })
  @ApiResponse({ status: 200, description: 'Successfully opted in for WhatsApp notifications' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async optInForWhatsApp(
    @Req() req: any,
    @Body() body: { phoneNumber: string },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    if (!body.phoneNumber || !this.isValidPhoneNumber(body.phoneNumber)) {
      throw new BadRequestException('Valid phone number is required');
    }

    await this.whatsAppService.updateWhatsAppDetails(userId, body.phoneNumber, true);

    return {
      success: true,
      message: 'Successfully opted in for WhatsApp notifications',
    };
  }

  @Post('whatsapp/opt-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Opt-out from WhatsApp notifications' })
  @ApiResponse({ status: 200, description: 'Successfully opted out from WhatsApp notifications' })
  async optOutFromWhatsApp(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    // Keep phone number but disable notifications
    await this.whatsAppService.updateWhatsAppDetails(userId, '', false);

    return {
      success: true,
      message: 'Successfully opted out from WhatsApp notifications',
    };
  }

  @Post('whatsapp/test')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Send test WhatsApp message (Admin only)' })
  @ApiResponse({ status: 200, description: 'Test message sent successfully' })
  async sendTestWhatsAppMessage(
    @Body() body: { phoneNumber: string },
  ) {
    if (!body.phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    const result = await this.whatsAppService.sendTemplateMessage({
      to: body.phoneNumber,
      templateName: 'welcome_message',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'QuickMela Admin' },
            { type: 'text', text: 'ADMIN_TEST' },
          ],
        },
      ],
      variables: {
        user_name: 'QuickMela Admin',
        referral_code: 'ADMIN_TEST',
      },
    });

    return {
      success: true,
      message: 'Test WhatsApp message sent',
      messageId: result.messages?.[0]?.id,
    };
  }

  @Get('templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available WhatsApp templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, enum: ['AUTHENTICATION', 'MARKETING', 'UTILITY'] })
  async getTemplates(@Query('category') category?: string) {
    let templates;

    if (category) {
      templates = this.templateManager.getTemplatesByCategory(category as any);
    } else {
      templates = this.templateManager.getApprovedTemplates();
    }

    return {
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        language: template.language,
        variables: template.variables,
      })),
    };
  }

  @Get('queue/stats')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get notification queue statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue statistics retrieved successfully' })
  async getQueueStats() {
    const stats = await this.notificationQueue.getQueueStats();

    return {
      queue: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('queue/clear')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Clear notification queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Queue cleared successfully' })
  async clearQueue() {
    await this.notificationQueue.clearQueue();

    return {
      success: true,
      message: 'Notification queue cleared',
    };
  }

  @Post('queue/retry-failed')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Retry failed notification jobs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Failed jobs retried successfully' })
  async retryFailedJobs() {
    const retriedCount = await this.notificationQueue.retryFailedJobs();

    return {
      success: true,
      message: `Retried ${retriedCount} failed jobs`,
      retriedCount,
    };
  }

  @Get('logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user notification logs' })
  @ApiResponse({ status: 200, description: 'Notification logs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getNotificationLogs(
    @Req() req: any,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    // In a real implementation, this would query the notification_logs table
    // For now, return mock data
    const mockLogs = [
      {
        id: 'log_1',
        type: 'whatsapp_template',
        status: 'sent',
        templateId: 'welcome_message',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: 'log_2',
        type: 'whatsapp_template',
        status: 'delivered',
        templateId: 'auction_win',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    ];

    return {
      logs: mockLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
      total: mockLogs.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
  }

  @Get('templates/stats')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get WhatsApp template usage statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Template statistics retrieved successfully' })
  async getTemplateStats() {
    const stats = this.templateManager.getTemplateStats();

    return {
      templateStats: stats,
      totalSent: Object.values(stats).reduce((sum, stat) => sum + stat.sent, 0),
      totalDelivered: Object.values(stats).reduce((sum, stat) => sum + stat.delivered, 0),
      totalFailed: Object.values(stats).reduce((sum, stat) => sum + stat.failed, 0),
      timestamp: new Date().toISOString(),
    };
  }

  // Helper method for phone number validation
  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }
}
