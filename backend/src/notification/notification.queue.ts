import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class NotificationQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    private whatsAppService: WhatsAppService,
  ) {}

  async onModuleInit() {
    this.logger.log('Notification queue service initialized');

    // Set up queue event listeners
    this.notificationQueue.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.notificationQueue.on('failed', (job, err) => {
      this.logger.error(`Job ${job.id} failed:`, err);
    });

    this.notificationQueue.on('stalled', (jobId) => {
      this.logger.warn(`Job ${jobId} stalled`);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down notification queue service');
    await this.notificationQueue.close();
  }

  /**
   * Add job to notification queue
   */
  async addToQueue(jobType: string, data: any, options?: any) {
    try {
      const job = await this.notificationQueue.add(jobType, data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 100, // Keep last 100 failed jobs
        ...options,
      });

      this.logger.debug(`Added ${jobType} job to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add job to queue:`, error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.notificationQueue.getWaiting(),
      this.notificationQueue.getActive(),
      this.notificationQueue.getCompleted(),
      this.notificationQueue.getFailed(),
      this.notificationQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }

  /**
   * Clear queue (for testing/admin purposes)
   */
  async clearQueue() {
    await this.notificationQueue.empty();
    await this.notificationQueue.clean(0, 'completed');
    await this.notificationQueue.clean(0, 'failed');
    this.logger.log('Notification queue cleared');
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJobs() {
    const failedJobs = await this.notificationQueue.getFailed();
    let retriedCount = 0;

    for (const job of failedJobs) {
      if (job.opts.attempts && job.attemptsMade < job.opts.attempts) {
        await job.retry();
        retriedCount++;
      }
    }

    this.logger.log(`Retried ${retriedCount} failed jobs`);
    return retriedCount;
  }
}

/**
 * Queue processor for WhatsApp notifications
 */
@Processor('notifications')
export class NotificationQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationQueueProcessor.name);

  constructor(private whatsAppService: WhatsAppService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'whatsapp_template':
          return await this.whatsAppService.processQueuedMessage(job.data);

        case 'whatsapp_otp':
          return await this.whatsAppService.sendOTP(
            job.data.phoneNumber,
            job.data.otp
          );

        case 'whatsapp_auction_win':
          return await this.whatsAppService.sendAuctionWin(
            job.data.phoneNumber,
            job.data.auctionData
          );

        case 'whatsapp_outbid_alert':
          return await this.whatsAppService.sendOutbidAlert(
            job.data.phoneNumber,
            job.data.outbidData
          );

        case 'whatsapp_escrow_update':
          return await this.whatsAppService.sendEscrowUpdate(
            job.data.phoneNumber,
            job.data.escrowData
          );

        case 'whatsapp_referral_reward':
          return await this.whatsAppService.sendReferralReward(
            job.data.phoneNumber,
            job.data.rewardData
          );

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  }

  // Handle job completion
  async onCompleted(job: Job<any>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  // Handle job failure
  async onFailed(job: Job<any>, err: Error) {
    this.logger.error(`Job ${job.id} failed:`, err);
  }

  // Handle job retries
  async onRetry(job: Job<any>) {
    this.logger.warn(`Retrying job ${job.id} (attempt ${job.attemptsMade + 1})`);
  }
}
