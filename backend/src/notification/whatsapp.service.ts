import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueueService } from './notification.queue';
import { RetryService } from './retry.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export interface WhatsAppTemplateMessage {
  to: string; // Phone number with country code
  templateName: string;
  language: string;
  components?: any[];
  variables?: Record<string, string>;
}

export interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
    message_status: string;
  }>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  // Rate limiting for WhatsApp API (250 requests per hour per business)
  private whatsAppRateLimiter: RateLimiterMemory;
  private userRateLimiter: RateLimiterMemory; // Per user rate limiting

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private notificationQueue: NotificationQueueService,
    private retryService: RetryService,
    @InjectQueue('notifications') private notificationQueueBull: Queue,
  ) {
    // Validate WhatsApp configuration
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.error('WhatsApp configuration missing - WhatsApp features disabled');
      throw new Error('WhatsApp configuration incomplete');
    }

    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}`;

    // Validate token format (should be a long JWT-like string)
    if (this.accessToken.length < 100) {
      throw new Error('Invalid WhatsApp access token format');
    }

    // Initialize rate limiter for WhatsApp API
    this.initializeRateLimiter();

    this.logger.log('WhatsApp service initialized successfully');
  }

  /**
   * Initialize rate limiters for WhatsApp API protection
   */
  private initializeRateLimiter(): void {
    // WhatsApp Business API rate limit: 250 requests per hour per business account
    this.whatsAppRateLimiter = new RateLimiterMemory({
      keyPrefix: 'whatsapp_api',
      points: 250, // Number of requests
      duration: 60 * 60, // Per hour (in seconds)
      blockDuration: 60 * 60, // Block for 1 hour if exceeded
    });

    // Per-user rate limiting: 10 messages per hour per user
    this.userRateLimiter = new RateLimiterMemory({
      keyPrefix: 'whatsapp_user',
      points: 10, // Messages per user
      duration: 60 * 60, // Per hour
      blockDuration: 60 * 15, // Block for 15 minutes if exceeded
    });

    this.logger.log('WhatsApp rate limiters initialized');
  }

  /**
   * Send template message via WhatsApp Business API
   */
  async sendTemplateMessage(message: WhatsAppTemplateMessage, userId?: string, ipAddress?: string): Promise<WhatsAppMessageResponse> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(message.to)) {
        throw new BadRequestException('Invalid phone number format');
      }

      // Check if user has opted in for WhatsApp notifications
      const userOptIn = await this.checkWhatsAppOptIn(message.to);
      if (!userOptIn) {
        this.logger.warn(`User ${message.to} has not opted in for WhatsApp notifications`);
        throw new BadRequestException('User has not opted in for WhatsApp notifications');
      }

      // Rate limiting checks
      if (userId) {
        // Check per-user rate limit
        try {
          await this.userRateLimiter.consume(userId);
        } catch (rejRes) {
          this.logger.warn(`User ${userId} exceeded WhatsApp rate limit`);
          await this.logSecurityEvent({
            type: 'rate_limit_exceeded',
            userId,
            ipAddress,
            userAgent: 'WhatsApp Service',
            details: { limitType: 'user_whatsapp_messages', phoneNumber: message.to },
            severity: 'medium',
          });
          throw new BadRequestException('Rate limit exceeded. Please try again later.');
        }
      }

      // Check WhatsApp API rate limit
      try {
        await this.whatsAppRateLimiter.consume('whatsapp_business_api');
      } catch (rejRes) {
        this.logger.error('WhatsApp Business API rate limit exceeded');
        await this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          userId,
          ipAddress,
          userAgent: 'WhatsApp Service',
          details: { limitType: 'whatsapp_api_calls', phoneNumber: message.to },
          severity: 'high',
        });
        throw new BadRequestException('WhatsApp service temporarily unavailable. Please try again later.');
      }

      // Abuse detection
      const abuseCheck = await this.detectMessageAbuse(message.to, userId);
      if (abuseCheck.isAbusive) {
        this.logger.warn(`WhatsApp message abuse detected for ${message.to}`, abuseCheck.reasons);
        await this.logSecurityEvent({
          type: 'suspicious_activity',
          userId,
          ipAddress,
          userAgent: 'WhatsApp Service',
          details: { abuseType: 'whatsapp_spam', reasons: abuseCheck.reasons, phoneNumber: message.to },
          severity: 'high',
        });
        throw new BadRequestException('Message blocked due to suspicious activity.');
      }

      // Prepare template payload
      const payload = {
        messaging_product: 'whatsapp',
        to: message.to,
        type: 'template',
        template: {
          name: message.templateName,
          language: {
            code: message.language || 'en_US'
          },
          components: message.components || []
        }
      };

      // Send via queue for reliability
      return await this.notificationQueue.addToQueue('whatsapp_template', {
        payload,
        retryCount: 0,
        messageData: message
      });

    } catch (error) {
      this.logger.error(`Failed to send WhatsApp template message:`, error);
      throw error;
    }
  }

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<WhatsAppMessageResponse> {
    return this.sendTemplateMessage({
      to: phoneNumber,
      templateName: 'otp_verification',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        }
      ],
      variables: { otp }
    });
  }

  /**
   * Send auction win notification
   */
  async sendAuctionWin(
    phoneNumber: string,
    auctionData: {
      auctionTitle: string;
      winningAmount: string;
      auctionId: string;
      paymentLink: string;
    }
  ): Promise<WhatsAppMessageResponse> {
    return this.sendTemplateMessage({
      to: phoneNumber,
      templateName: 'auction_win',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: auctionData.auctionTitle
            },
            {
              type: 'text',
              text: auctionData.winningAmount
            },
            {
              type: 'text',
              text: auctionData.auctionId
            }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0,
          parameters: [
            {
              type: 'text',
              text: auctionData.paymentLink
            }
          ]
        }
      ],
      variables: auctionData
    });
  }

  /**
   * Send outbid alert
   */
  async sendOutbidAlert(
    phoneNumber: string,
    outbidData: {
      auctionTitle: string;
      currentBid: string;
      yourLastBid: string;
      auctionLink: string;
    }
  ): Promise<WhatsAppMessageResponse> {
    return this.sendTemplateMessage({
      to: phoneNumber,
      templateName: 'outbid_alert',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: outbidData.auctionTitle
            },
            {
              type: 'text',
              text: outbidData.currentBid
            },
            {
              type: 'text',
              text: outbidData.yourLastBid
            }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0,
          parameters: [
            {
              type: 'text',
              text: outbidData.auctionLink
            }
          ]
        }
      ],
      variables: outbidData
    });
  }

  /**
   * Send escrow update notification
   */
  async sendEscrowUpdate(
    phoneNumber: string,
    escrowData: {
      auctionTitle: string;
      status: string;
      amount: string;
      actionRequired?: string;
    }
  ): Promise<WhatsAppMessageResponse> {
    return this.sendTemplateMessage({
      to: phoneNumber,
      templateName: 'escrow_update',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: escrowData.auctionTitle
            },
            {
              type: 'text',
              text: escrowData.status
            },
            {
              type: 'text',
              text: escrowData.amount
            }
          ]
        }
      ],
      variables: escrowData
    });
  }

  /**
   * Send referral reward notification
   */
  async sendReferralReward(
    phoneNumber: string,
    rewardData: {
      rewardAmount: string;
      referrerName: string;
      totalReferrals: string;
    }
  ): Promise<WhatsAppMessageResponse> {
    return this.sendTemplateMessage({
      to: phoneNumber,
      templateName: 'referral_reward',
      language: 'en',
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: rewardData.rewardAmount
            },
            {
              type: 'text',
              text: rewardData.referrerName
            },
            {
              type: 'text',
              text: rewardData.totalReferrals
            }
          ]
        }
      ],
      variables: rewardData
    });
  }

  /**
   * Process queued WhatsApp messages
   */
  async processQueuedMessage(jobData: any): Promise<WhatsAppMessageResponse> {
    const { payload, retryCount, messageData } = jobData;

    try {
      this.logger.debug(`Processing WhatsApp message for ${payload.to}`);

      const response: AxiosResponse<WhatsAppMessageResponse> = await axios.post(
        `${this.baseUrl}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Log successful message
      await this.logNotification({
        userId: await this.getUserIdByPhone(payload.to),
        type: 'whatsapp_template',
        status: 'sent',
        templateId: payload.template.name,
        responsePayload: response.data,
      });

      this.logger.log(`WhatsApp message sent successfully to ${payload.to}`);
      return response.data;

    } catch (error) {
      this.logger.error(`WhatsApp API error for ${payload.to}:`, error.response?.data || error.message);

      // Log failed attempt
      await this.logNotification({
        userId: await this.getUserIdByPhone(payload.to),
        type: 'whatsapp_template',
        status: 'failed',
        templateId: payload.template.name,
        responsePayload: error.response?.data,
        errorMessage: error.message,
      });

      // Retry logic
      if (retryCount < 3) {
        await this.retryService.scheduleRetry('whatsapp_template', {
          ...jobData,
          retryCount: retryCount + 1,
        });
      }

      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // E.164 format validation (e.g., +919876543210)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Check if user has opted in for WhatsApp notifications
   */
  private async checkWhatsAppOptIn(phoneNumber: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phoneNumber },
        select: { whatsappOptIn: true },
      });

      return user?.whatsappOptIn === true;
    } catch (error) {
      this.logger.error(`Error checking WhatsApp opt-in for ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Get user ID by phone number
   */
  private async getUserIdByPhone(phoneNumber: string): Promise<string | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phoneNumber },
        select: { id: true },
      });

      return user?.id || null;
    } catch (error) {
      this.logger.error(`Error getting user ID for phone ${phoneNumber}:`, error);
      return null;
    }
  }

  /**
   * Log notification to database
   */
  private async logNotification(data: {
    userId?: string;
    type: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    templateId?: string;
    responsePayload?: any;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await this.prisma.notificationLog.create({
        data: {
          userId: data.userId,
          type: data.type,
          status: data.status,
          templateId: data.templateId,
          responsePayload: data.responsePayload,
          errorMessage: data.errorMessage,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log notification:', error);
    }
  }

  /**
   * Detect potential message abuse
   */
  private async detectMessageAbuse(phoneNumber: string, userId?: string): Promise<{
    isAbusive: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    try {
      // Check recent message frequency for this phone number
      const recentMessages = await this.prisma.notificationLog.count({
        where: {
          recipient: phoneNumber,
          provider: 'whatsapp',
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      if (recentMessages > 20) {
        reasons.push('Excessive messages to same number in short time');
      }

      // Check if user has been blocked before
      if (userId) {
        const recentBlocks = await this.prisma.notificationLog.count({
          where: {
            userId,
            status: 'failed',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (recentBlocks > 10) {
          reasons.push('High failure rate for user');
        }
      }

      // Check for spam patterns in message content
      // This would be more sophisticated in production

    } catch (error) {
      this.logger.error('Error detecting message abuse:', error);
    }

    return {
      isAbusive: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Log security events to audit trail
   */
  private async logSecurityEvent(event: {
    type: 'rate_limit_exceeded' | 'suspicious_activity' | 'abuse_attempt';
    userId?: string;
    ipAddress?: string;
    userAgent: string;
    details: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      await this.prisma.complianceAuditLog.create({
        data: {
          userId: event.userId,
          action: event.type,
          resource: 'whatsapp_service',
          riskLevel: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : 'medium',
          jurisdiction: 'india',
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          dataProcessing: true,
          personalData: true,
          financialData: false,
          requiresRetention: true,
          oldValues: null,
          newValues: event.details,
        },
      });

      this.logger.warn(`Security event logged: ${event.type}`, {
        userId: event.userId,
        severity: event.severity,
        details: event.details,
      });
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }
}
