import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface RetryJob {
  jobType: string;
  data: any;
  retryCount: number;
  maxRetries: number;
  backoffMs: number;
  nextRetryAt?: Date;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  /**
   * Schedule a retry for a failed job
   */
  async scheduleRetry(jobType: string, jobData: any): Promise<void> {
    const { retryCount, maxRetries = 3, backoffMs = 2000 } = jobData;

    if (retryCount >= maxRetries) {
      this.logger.error(`Max retries exceeded for job type ${jobType}`);
      await this.logFailedJob(jobType, jobData);
      return;
    }

    // Calculate exponential backoff
    const delayMs = backoffMs * Math.pow(2, retryCount - 1);
    const nextRetryAt = new Date(Date.now() + delayMs);

    this.logger.log(`Scheduling retry ${retryCount}/${maxRetries} for ${jobType} in ${delayMs}ms`);

    // Add retry job to queue with delay
    await this.notificationQueue.add(
      jobType,
      {
        ...jobData,
        retryCount: retryCount + 1,
      },
      {
        delay: delayMs,
        priority: 1, // Lower priority for retries
        attempts: 1, // Each retry job gets only 1 attempt
        removeOnComplete: 10,
        removeOnFail: 50,
      }
    );

    // Log retry scheduling
    await this.logRetryAttempt(jobType, jobData, nextRetryAt);
  }

  /**
   * Check if job should be retried based on error type
   */
  shouldRetry(error: any): boolean {
    // Don't retry certain types of errors
    const nonRetryableErrors = [
      'Invalid phone number format',
      'User has not opted in',
      'Template not found',
      'Invalid credentials',
      'Insufficient permissions',
    ];

    const errorMessage = error.message || error.toString();

    return !nonRetryableErrors.some(nonRetryable =>
      errorMessage.includes(nonRetryable)
    );
  }

  /**
   * Get retry statistics
   */
  async getRetryStats(): Promise<{
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageRetryDelay: number;
  }> {
    // In a real implementation, this would query retry logs
    // For now, return mock data
    return {
      totalRetries: 150,
      successfulRetries: 120,
      failedRetries: 30,
      averageRetryDelay: 4500, // 4.5 seconds
    };
  }

  /**
   * Clean up old retry jobs
   */
  async cleanupOldRetries(olderThanHours: number = 24): Promise<number> {
    // Remove completed retry jobs older than specified hours
    const cutoffDate = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));

    // In a real implementation, this would clean up retry records
    this.logger.log(`Cleaned up retry jobs older than ${olderThanHours} hours`);

    return 0; // Mock return
  }

  /**
   * Get retry configuration for different job types
   */
  getRetryConfig(jobType: string): { maxRetries: number; backoffMs: number } {
    const configs = {
      whatsapp_template: { maxRetries: 3, backoffMs: 2000 },
      whatsapp_otp: { maxRetries: 2, backoffMs: 1000 }, // OTPs expire quickly
      whatsapp_auction_win: { maxRetries: 5, backoffMs: 5000 }, // Important notifications
      whatsapp_outbid_alert: { maxRetries: 3, backoffMs: 3000 },
      whatsapp_escrow_update: { maxRetries: 4, backoffMs: 4000 },
      whatsapp_referral_reward: { maxRetries: 3, backoffMs: 2000 },
    };

    return configs[jobType] || { maxRetries: 3, backoffMs: 2000 };
  }

  /**
   * Log failed job that exceeded max retries
   */
  private async logFailedJob(jobType: string, jobData: any): Promise<void> {
    try {
      this.logger.error(`Job ${jobType} failed permanently after max retries`, {
        jobType,
        jobData: JSON.stringify(jobData),
        finalRetryCount: jobData.retryCount,
        timestamp: new Date().toISOString(),
      });

      // In a real implementation, this would be stored in a failed_jobs table
      // or trigger alerts for critical failures

    } catch (error) {
      this.logger.error('Failed to log failed job:', error);
    }
  }

  /**
   * Log retry attempt
   */
  private async logRetryAttempt(jobType: string, jobData: any, nextRetryAt: Date): Promise<void> {
    try {
      this.logger.debug(`Retry scheduled for ${jobType}`, {
        jobType,
        retryCount: jobData.retryCount,
        nextRetryAt: nextRetryAt.toISOString(),
        recipient: jobData.payload?.to || jobData.phoneNumber,
      });

      // In a real implementation, this would be stored in a retry_logs table

    } catch (error) {
      this.logger.error('Failed to log retry attempt:', error);
    }
  }

  /**
   * Handle rate limit errors with intelligent backoff
   */
  async handleRateLimitError(jobType: string, jobData: any, retryAfter?: number): Promise<void> {
    // WhatsApp API rate limits: 250 requests per hour per business account
    // Implement intelligent backoff for rate limit errors

    const rateLimitBackoff = retryAfter ? retryAfter * 1000 : 3600000; // 1 hour default
    const rateLimitRetryCount = jobData.rateLimitRetryCount || 0;

    if (rateLimitRetryCount >= 2) {
      this.logger.error(`Rate limit retry limit exceeded for ${jobType}`);
      await this.logFailedJob(jobType, { ...jobData, rateLimitExceeded: true });
      return;
    }

    this.logger.warn(`Rate limit hit for ${jobType}, retrying in ${rateLimitBackoff}ms`);

    await this.notificationQueue.add(
      jobType,
      {
        ...jobData,
        rateLimitRetryCount: rateLimitRetryCount + 1,
      },
      {
        delay: rateLimitBackoff,
        priority: 0, // Lowest priority for rate limited jobs
        attempts: 1,
      }
    );
  }

  /**
   * Monitor retry patterns and alert on anomalies
   */
  async monitorRetryPatterns(): Promise<void> {
    // Analyze retry patterns and alert if there are unusual spikes
    // This would check recent retry rates and compare to baselines

    const stats = await this.getRetryStats();
    const retryRate = stats.totalRetries / (24 * 60 * 60); // retries per second over 24 hours

    // Alert thresholds
    const highRetryRate = 0.1; // 0.1 retries per second (every 10 seconds)
    const criticalRetryRate = 0.5; // 0.5 retries per second (every 2 seconds)

    if (retryRate > criticalRetryRate) {
      this.logger.error('CRITICAL: Extremely high retry rate detected', { retryRate, stats });
      // In production, this would trigger critical alerts
    } else if (retryRate > highRetryRate) {
      this.logger.warn('WARNING: High retry rate detected', { retryRate, stats });
      // In production, this would trigger warning alerts
    }
  }
}
