import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./mock.db',
        },
      },
    });

    // Check if database URL is available after super() call
    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL not set - running in mock mode');
    }
  }

  private isConnected = false;

  // Lazy connection - connects only when needed
  async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.$connect();
      this.isConnected = true;
    }
  }

  // Override methods to ensure connection
  async $connect() {
    return super.$connect();
  }

  async $disconnect() {
    this.isConnected = false;
    return super.$disconnect();
  }

  async onModuleInit() {
    // Lazy initialization - do NOT connect during bootstrap
    this.logger.log('PrismaService initialized (lazy connection mode)');
    
    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL environment variable is not set');
      this.logger.warn('Database-dependent features will be disabled');
      return;
    }
    
    this.logger.log('DATABASE_URL detected, will connect on first query');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDb() {
    // Only for testing/development
    if (process.env.NODE_ENV === 'development') {
      await this.ensureConnected();
      if (!this.isConnected) {
        this.logger.warn('Cannot clean DB - no database connection');
        return;
      }
      
      try {
        await this.account.deleteMany();
        await this.product.deleteMany();
        await this.auction.deleteMany();
        this.logger.log('Database cleaned successfully');
      } catch (error) {
        this.logger.error('Failed to clean database:', error.message);
        // Do NOT throw
      }
    }
  }
}
