import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'quickbid-backend',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('health')
  getDetailedHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'quickbid-backend',
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'configured' : 'not configured'
    };
  }
}
