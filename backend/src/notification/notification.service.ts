import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string; // For email
  content: string;
  variables: string[]; // Dynamic variables like {{userName}}, {{auctionTitle}}
  isActive: boolean;
}

export interface NotificationRequest {
  type: 'email' | 'sms' | 'push' | 'in_app';
  templateId?: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
}

export interface NotificationLog {
  id: string;
  type: NotificationRequest['type'];
  recipientId: string;
  templateId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Email transporter
  private emailTransporter: any;

  // SMS client
  private smsClient: any;

  // Default notification templates
  private defaultTemplates: NotificationTemplate[] = [
    // User Registration
    {
      id: 'user_welcome',
      name: 'User Welcome',
      type: 'email',
      subject: 'Welcome to QuickMela! 🎉',
      content: `Hello {{userName}},

Welcome to QuickMela! Your account has been successfully created.

Email: {{userEmail}}
Registration Date: {{registrationDate}}

You can now:
✅ Browse and bid on auctions
✅ List items for sale
✅ Track your favorite auctions
✅ Manage your wallet and payments

Get started by exploring our featured auctions!

Best regards,
QuickMela Team`,
      variables: ['userName', 'userEmail', 'registrationDate'],
      isActive: true,
    },

    // Auction Won
    {
      id: 'auction_won',
      name: 'Auction Won',
      type: 'email',
      subject: 'Congratulations! You won an auction on QuickMela! 🏆',
      content: `Congratulations {{winnerName}}!

You have won the auction for: {{auctionTitle}}

Winning Bid: ₹{{winningAmount}}
Auction ID: {{auctionId}}

Next Steps:
1. Complete payment within 48 hours
2. Contact seller for pickup/delivery arrangements
3. Leave feedback after receiving the item

Payment Link: {{paymentLink}}

Thank you for using QuickMela!

Best regards,
QuickMela Team`,
      variables: ['winnerName', 'auctionTitle', 'winningAmount', 'auctionId', 'paymentLink'],
      isActive: true,
    },

    // Bid Outbid
    {
      id: 'bid_outbid',
      name: 'Outbid Notification',
      type: 'email',
      subject: 'You\'ve been outbid on {{auctionTitle}}',
      content: `Hi {{userName}},

You've been outbid on: {{auctionTitle}}

Current Highest Bid: ₹{{currentBid}}
Your Last Bid: ₹{{yourLastBid}}

Don't lose this auction! Place a higher bid now:
{{auctionLink}}

Auction ends: {{endTime}}

Best regards,
QuickMela Team`,
      variables: ['userName', 'auctionTitle', 'currentBid', 'yourLastBid', 'auctionLink', 'endTime'],
      isActive: true,
    },

    // Auction Ending Soon
    {
      id: 'auction_ending_soon',
      name: 'Auction Ending Soon',
      type: 'email',
      subject: 'Auction ending soon: {{auctionTitle}} ⏰',
      content: `Hi {{userName}},

The auction you're watching is ending soon!

Auction: {{auctionTitle}}
Current Price: ₹{{currentPrice}}
Time Left: {{timeLeft}}

Last chance to place your bid:
{{auctionLink}}

Don't miss out!

Best regards,
QuickMela Team`,
      variables: ['userName', 'auctionTitle', 'currentPrice', 'timeLeft', 'auctionLink'],
      isActive: true,
    },

    // Seller Item Sold
    {
      id: 'seller_item_sold',
      name: 'Item Sold',
      type: 'email',
      subject: 'Your item has been sold! 💰',
      content: `Congratulations {{sellerName}}!

Your item has been sold on QuickMela:

Item: {{itemTitle}}
Sold Price: ₹{{soldPrice}}
Buyer: {{buyerName}}
Auction ID: {{auctionId}}

Commission Fee: ₹{{commissionFee}} ({{commissionPercent}}%)
Net Amount: ₹{{netAmount}}

The funds will be transferred to your wallet after buyer payment confirmation.

Track your sales: {{dashboardLink}}

Best regards,
QuickMela Team`,
      variables: ['sellerName', 'itemTitle', 'soldPrice', 'buyerName', 'auctionId', 'commissionFee', 'commissionPercent', 'netAmount', 'dashboardLink'],
      isActive: true,
    },

    // Admin Alert - High Value Auction
    {
      id: 'admin_high_value_auction',
      name: 'High Value Auction Alert',
      type: 'email',
      subject: '🚨 High Value Auction Requires Attention',
      content: `Admin Alert: High Value Auction

Auction: {{auctionTitle}}
Current Price: ₹{{currentPrice}}
Reserve Price: ₹{{reservePrice}}

Seller: {{sellerName}} ({{sellerId}})
Category: {{category}}

Action Required: Review and approve high-value transaction.

View Auction: {{auctionLink}}

QuickMela Admin System`,
      variables: ['auctionTitle', 'currentPrice', 'reservePrice', 'sellerName', 'sellerId', 'category', 'auctionLink'],
      isActive: true,
    },

    // SMS Templates
    {
      id: 'sms_auction_won',
      name: 'Auction Won SMS',
      type: 'sms',
      content: `Congratulations! You won {{auctionTitle}} for ₹{{winningAmount}}. Complete payment within 48hrs. QuickMela`,
      variables: ['auctionTitle', 'winningAmount'],
      isActive: true,
    },

    {
      id: 'sms_bid_outbid',
      name: 'Outbid SMS',
      type: 'sms',
      content: `You've been outbid on {{auctionTitle}}. Current bid: ₹{{currentBid}}. Bid higher now! QuickMela`,
      variables: ['auctionTitle', 'currentBid'],
      isActive: true,
    },

    // In-app notification templates
    {
      id: 'inapp_bid_placed',
      name: 'Bid Placed',
      type: 'in_app',
      content: `Your bid of ₹{{bidAmount}} on {{auctionTitle}} has been placed successfully.`,
      variables: ['bidAmount', 'auctionTitle'],
      isActive: true,
    },

    {
      id: 'inapp_auction_ended',
      name: 'Auction Ended',
      type: 'in_app',
      content: `Auction ended: {{auctionTitle}}. {{resultMessage}}`,
      variables: ['auctionTitle', 'resultMessage'],
      isActive: true,
    },
  ];

  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Initialize SMS client (Twilio)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.smsClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendNotification(request: NotificationRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let result: any;

      switch (request.type) {
        case 'email':
          result = await this.sendEmail(request);
          break;
        case 'sms':
          result = await this.sendSMS(request);
          break;
        case 'push':
          result = await this.sendPushNotification(request);
          break;
        case 'in_app':
          result = await this.sendInAppNotification(request);
          break;
        default:
          throw new Error(`Unsupported notification type: ${request.type}`);
      }

      // Log successful notification
      await this.logNotification({
        ...request,
        status: 'sent',
        sentAt: new Date(),
        metadata: { ...request.metadata, result },
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      // Log failed notification
      await this.logNotification({
        ...request,
        status: 'failed',
        errorMessage: error.message,
        metadata: { ...request.metadata, error: error.message },
      });

      return { success: false, error: error.message };
    }
  }

  async sendBulkNotifications(requests: NotificationRequest[]): Promise<{
    successful: number;
    failed: number;
    results: { request: NotificationRequest; success: boolean; error?: string }[];
  }> {
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        const result = await this.sendNotification(request);
        return { request, success: result.success, error: result.error };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { request: r.reason.request, success: false, error: r.reason.message }),
    };
  }

  async getNotificationTemplates(type?: NotificationRequest['type']): Promise<NotificationTemplate[]> {
    let templates = this.defaultTemplates;

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    return templates.filter(t => t.isActive);
  }

  async sendTemplatedNotification(
    templateId: string,
    recipientId: string,
    variables: Record<string, any>,
    options?: { priority?: NotificationRequest['priority']; scheduledFor?: Date }
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.defaultTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Get recipient details
    const recipient = await this.prismaService.user.findUnique({
      where: { id: recipientId },
      select: { email: true, name: true },
    });

    if (!recipient) {
      throw new Error(`Recipient ${recipientId} not found`);
    }

    // Replace template variables
    let content = template.content;
    let subject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
      if (subject) {
        subject = subject.replace(regex, String(value));
      }
    });

    const notificationRequest: NotificationRequest = {
      type: template.type,
      templateId,
      recipientId,
      recipientEmail: recipient.email,
      subject,
      content,
      metadata: { variables, templateId },
      priority: options?.priority || 'normal',
      scheduledFor: options?.scheduledFor,
    };

    return await this.sendNotification(notificationRequest);
  }

  async scheduleNotification(
    request: NotificationRequest,
    scheduledFor: Date
  ): Promise<{ success: boolean; scheduledId?: string }> {
    // In a real implementation, this would use a job queue like Bull
    // For now, we'll simulate scheduling
    request.scheduledFor = scheduledFor;

    // Log as scheduled
    await this.logNotification({
      ...request,
      status: 'pending',
      metadata: { ...request.metadata, scheduledFor },
    });

    // Simulate scheduling (in production, use a proper job queue)
    setTimeout(async () => {
      await this.sendNotification(request);
    }, scheduledFor.getTime() - Date.now());

    return { success: true, scheduledId: `scheduled_${Date.now()}` };
  }

  async getNotificationHistory(
    recipientId?: string,
    type?: NotificationRequest['type'],
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: NotificationLog[]; total: number }> {
    // Mock implementation - in real app, query notification_logs table
    const mockNotifications: NotificationLog[] = [
      {
        id: 'notif_001',
        type: 'email',
        recipientId: recipientId || 'user_123',
        templateId: 'user_welcome',
        status: 'sent',
        sentAt: new Date(Date.now() - 3600000),
        metadata: { templateId: 'user_welcome' },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
      },
    ];

    return {
      notifications: mockNotifications.slice(offset, offset + limit),
      total: mockNotifications.length,
    };
  }

  // Auction-specific notification methods
  async notifyBidPlaced(auctionId: string, bidderId: string, bidAmount: number): Promise<void> {
    // Notify all active bidders on this auction (except the bidder who just bid)
    // In a real implementation, get all active bidders from auction state
    const auction = await this.prismaService.auction?.findUnique({
      where: { id: auctionId },
      select: { title: true },
    });

    if (auction) {
      await this.sendTemplatedNotification(
        'inapp_bid_placed',
        bidderId,
        {
          bidAmount: bidAmount.toLocaleString(),
          auctionTitle: auction.title,
        }
      );
    }
  }

  async notifyAuctionEndingSoon(auctionId: string): Promise<void> {
    // Get all users watching this auction
    // Mock implementation
    const watchers = ['user_123', 'user_456']; // Would query from database

    for (const watcherId of watchers) {
      await this.sendTemplatedNotification(
        'auction_ending_soon',
        watcherId,
        {
          userName: 'Valued User', // Would get from user data
          auctionTitle: 'Sample Auction',
          currentPrice: '15000',
          timeLeft: '2 hours',
          auctionLink: `https://quickmela.com/auctions/${auctionId}`,
        }
      );
    }
  }

  async notifyAuctionWon(auctionId: string, winnerId: string, winningAmount: number): Promise<void> {
    await this.sendTemplatedNotification(
      'auction_won',
      winnerId,
      {
        winnerName: 'Winner Name',
        auctionTitle: 'Sample Auction',
        winningAmount: winningAmount.toLocaleString(),
        auctionId,
        paymentLink: `https://quickmela.com/payment/${auctionId}`,
      }
    );
  }

  async notifySellerItemSold(auctionId: string, sellerId: string, soldPrice: number): Promise<void> {
    await this.sendTemplatedNotification(
      'seller_item_sold',
      sellerId,
      {
        sellerName: 'Seller Name',
        itemTitle: 'Sample Item',
        soldPrice: soldPrice.toLocaleString(),
        buyerName: 'Buyer Name',
        auctionId,
        commissionFee: Math.round(soldPrice * 0.05).toLocaleString(),
        commissionPercent: '5%',
        netAmount: Math.round(soldPrice * 0.95).toLocaleString(),
        dashboardLink: 'https://quickmela.com/seller/dashboard',
      }
    );
  }

  // Admin notification methods
  async notifyAdminHighValueAuction(auctionData: any): Promise<void> {
    // Send to all admin users
    const adminUsers = await this.prismaService.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of adminUsers) {
      await this.sendTemplatedNotification(
        'admin_high_value_auction',
        admin.id,
        {
          auctionTitle: auctionData.title,
          currentPrice: auctionData.currentPrice.toLocaleString(),
          reservePrice: auctionData.reservePrice?.toLocaleString() || 'N/A',
          sellerName: 'Seller Name',
          sellerId: auctionData.sellerId,
          category: auctionData.category || 'General',
          auctionLink: `https://quickmela.com/admin/auctions/${auctionData.id}`,
        }
      );
    }
  }

  private async sendEmail(request: NotificationRequest): Promise<any> {
    if (!request.recipientEmail) {
      throw new Error('Recipient email is required for email notifications');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@quickmela.com',
      to: request.recipientEmail,
      subject: request.subject || 'QuickMela Notification',
      html: this.convertToHtml(request.content),
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    return { messageId: result.messageId };
  }

  private async sendSMS(request: NotificationRequest): Promise<any> {
    if (!this.smsClient || !request.recipientPhone) {
      throw new Error('SMS service not configured or recipient phone missing');
    }

    const result = await this.smsClient.messages.create({
      body: request.content,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: request.recipientPhone,
    });

    return { messageId: result.sid };
  }

  private async sendPushNotification(request: NotificationRequest): Promise<any> {
    // Mock push notification - in real implementation, use FCM/APNs
    console.log(`Push notification to ${request.recipientId}: ${request.content}`);
    return { messageId: `push_${Date.now()}` };
  }

  private async sendInAppNotification(request: NotificationRequest): Promise<any> {
    // Store in-app notification in database and emit real-time event
    this.eventEmitter.emit('notification.in_app', {
      recipientId: request.recipientId,
      content: request.content,
      metadata: request.metadata,
    });

    return { messageId: `inapp_${Date.now()}` };
  }

  private convertToHtml(textContent: string): string {
    // Simple text to HTML conversion
    return textContent
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
      .join('')
      .replace(/\n\n/g, '</p><p>');
  }

  private async logNotification(logData: Partial<NotificationLog>): Promise<void> {
    // Mock logging - in real implementation, save to notification_logs table
    console.log('Notification logged:', {
      id: logData.id || `log_${Date.now()}`,
      type: logData.type,
      recipientId: logData.recipientId,
      status: logData.status,
      templateId: logData.templateId,
      sentAt: logData.sentAt,
      errorMessage: logData.errorMessage,
    });
  }
}
