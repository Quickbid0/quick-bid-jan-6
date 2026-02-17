import { Controller, Get } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'quickbid-backend',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  async checkDatabase(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch (error) {
      return 'disconnected';
    }
  }

  @Get('health')
  async getDetailedHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'quickbid-backend',
      environment: process.env.NODE_ENV || 'development',
      database: await this.checkDatabase()
    };
  }

  /**
   * Debug endpoint to test Sentry error reporting
   * GET /debug-sentry
   */
  @Get('debug-sentry')
  triggerSentryError() {
    try {
      // This will trigger a test error to verify Sentry is working
      throw new Error('Test error from QuickMela backend for Sentry verification');
    } catch (error) {
      // Capture the exception with Sentry
      Sentry.captureException(error);

      return {
        message: 'Test error triggered and sent to Sentry',
        timestamp: new Date().toISOString(),
        environment: process.env.SENTRY_ENVIRONMENT || 'unknown',
        sentryConfigured: !!process.env.SENTRY_DSN_BACKEND
      };
    }
  }
}
