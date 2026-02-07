import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('test-db')
export class TestDbController {
  constructor(private prismaService: PrismaService) {}

  @Get()
  async testDatabase() {
    try {
      const count = await this.prismaService.user.count();
      return {
        status: 'connected',
        message: 'Database connection successful',
        accountCount: count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
