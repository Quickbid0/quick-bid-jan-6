import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'bid_won' | 'bid_placed' | 'bid_outbid' | 'auction_ending' | 'auction_started' | 'auction_ended' | 'delivery_update' | 'payment_received' | 'payment_failed' | 'verification_update' | 'kyc_approved' | 'kyc_rejected' | 'penalty_applied' | 'cooldown_applied' | 'system_announcement' | 'security_alert' | 'refund_processed';
  auctionId?: string;
  productId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  channels?: ('in_app' | 'email' | 'sms' | 'push')[];
  metadata?: any;
  scheduledFor?: Date;
}

export interface NotificationTemplate {
  type: NotificationData['type'];
  channels: NotificationData['channels'];
  priority: NotificationData['priority'];
  subject?: string; // For email
  emailTemplate?: string;
  smsTemplate?: string;
  pushTemplate?: string;
  inAppTemplate?: string;
  cooldown?: number; // Minimum time between similar notifications (minutes)
}

export interface UserNotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
  };
  types: Record<NotificationData['type'], {
    enabled: boolean;
    channels: NotificationData['channels'];
    quiet_hours?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
  }>;
  timezone: string;
}

class NotificationService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4011';

  // Notification templates with proper formatting
  private readonly templates: Record<NotificationData['type'], NotificationTemplate> = {
    bid_won: {
      type: 'bid_won',
      channels: ['in_app', 'email', 'sms', 'push'],
      priority: 'high',
      subject: '🎉 Congratulations! You Won the Auction!',
      emailTemplate: `Dear {{userName}},

Congratulations! You have won the auction for "{{productTitle}}" with a winning bid of ₹{{bidAmount}}.

Auction Details:
- Product: {{productTitle}}
- Winning Bid: ₹{{bidAmount}}
- Auction ID: {{auctionId}}

Next Steps:
1. Complete the payment within 24 hours to secure your purchase
2. Provide delivery address if not already provided
3. Track your order status in your dashboard

Payment Link: {{paymentLink}}

If you have any questions, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `🎉 Congrats! You won "{{productTitle}}" for ₹{{bidAmount}}. Complete payment within 24hrs. Payment link: {{paymentLink}}`,
      pushTemplate: `🎉 You won! {{productTitle}} for ₹{{bidAmount}}. Complete payment now.`,
      inAppTemplate: `Congratulations! You won the auction for "{{productTitle}}" with a bid of ₹{{bidAmount}}. Complete your payment to secure the item.`,
      cooldown: 0,
    },
    bid_placed: {
      type: 'bid_placed',
      channels: ['in_app', 'email'],
      priority: 'normal',
      subject: 'New Bid Placed on Your Auction',
      emailTemplate: `Dear {{sellerName}},

Great news! A new bid has been placed on your auction.

Auction Details:
- Product: {{productTitle}}
- New Bid: ₹{{bidAmount}}
- Bidder: {{bidderName}}
- Auction ID: {{auctionId}}

Current highest bid: ₹{{currentHighestBid}}

Monitor your auction and respond to bidder inquiries promptly.

View Auction: {{auctionLink}}

Best regards,
QuickMela Team`,
      smsTemplate: `New bid ₹{{bidAmount}} on "{{productTitle}}". Current highest: ₹{{currentHighestBid}}.`,
      pushTemplate: `New bid on {{productTitle}}: ₹{{bidAmount}}`,
      inAppTemplate: `New bid of ₹{{bidAmount}} placed on your auction for "{{productTitle}}"`,
      cooldown: 5,
    },
    bid_outbid: {
      type: 'bid_outbid',
      channels: ['in_app', 'email', 'push'],
      priority: 'high',
      subject: 'You\'ve Been Outbid!',
      emailTemplate: `Dear {{userName}},

You've been outbid on "{{productTitle}}".

Current Details:
- Your previous bid: ₹{{previousBid}}
- New highest bid: ₹{{newBid}}
- Auction ends: {{auctionEndTime}}

Don't miss out! Place a higher bid to regain the lead.

Bid Now: {{bidLink}}

Best regards,
QuickMela Team`,
      smsTemplate: `You've been outbid on "{{productTitle}}". New bid: ₹{{newBid}}. Place higher bid now!`,
      pushTemplate: `Outbid on {{productTitle}}! New bid: ₹{{newBid}}. Bid again!`,
      inAppTemplate: `You've been outbid on "{{productTitle}}". New highest bid: ₹{{newBid}}. Place a higher bid to win!`,
      cooldown: 1,
    },
    auction_ending: {
      type: 'auction_ending',
      channels: ['in_app', 'push'],
      priority: 'high',
      subject: 'Auction Ending Soon!',
      smsTemplate: `"{{productTitle}}" auction ends in {{timeLeft}}. Current bid: ₹{{currentBid}}. Last chance!`,
      pushTemplate: `⏰ "{{productTitle}}" ends in {{timeLeft}}! Current bid: ₹{{currentBid}}`,
      inAppTemplate: `Auction for "{{productTitle}}" is ending in {{timeLeft}}. Current bid: ₹{{currentBid}}. Don't miss your chance!`,
      cooldown: 30,
    },
    auction_started: {
      type: 'auction_started',
      channels: ['in_app', 'email'],
      priority: 'normal',
      subject: 'Auction Has Started!',
      emailTemplate: `Dear {{userName}},

The auction for "{{productTitle}}" has started!

Auction Details:
- Starting Price: ₹{{startingPrice}}
- Current Bid: ₹{{currentBid}}
- Ends: {{auctionEndTime}}

Don't miss your chance to win this item!

Bid Now: {{bidLink}}

Best regards,
QuickMela Team`,
      smsTemplate: `"{{productTitle}}" auction started! Starting bid: ₹{{startingPrice}}. Ends: {{auctionEndTime}}.`,
      pushTemplate: `🚀 Auction started: {{productTitle}} - Starting ₹{{startingPrice}}`,
      inAppTemplate: `The auction for "{{productTitle}}" has started! Starting price: ₹{{startingPrice}}. Place your bid now!`,
      cooldown: 0,
    },
    auction_ended: {
      type: 'auction_ended',
      channels: ['in_app', 'email', 'sms'],
      priority: 'high',
      subject: 'Auction Has Ended',
      emailTemplate: `Dear {{userName}},

The auction for "{{productTitle}}" has ended.

Final Results:
- Final Price: ₹{{finalPrice}}
- Winner: {{winnerName}}
- Auction ID: {{auctionId}}

{{outcomeMessage}}

{{nextSteps}}

If you have any questions, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `Auction ended for "{{productTitle}}". Final price: ₹{{finalPrice}}. {{outcomeMessage}}`,
      pushTemplate: `Auction ended: {{productTitle}} - ₹{{finalPrice}}. {{outcomeMessage}}`,
      inAppTemplate: `Auction for "{{productTitle}}" has ended. Final price: ₹{{finalPrice}}. {{outcomeMessage}}`,
      cooldown: 0,
    },
    delivery_update: {
      type: 'delivery_update',
      channels: ['in_app', 'email', 'sms'],
      priority: 'normal',
      subject: 'Delivery Update',
      emailTemplate: `Dear {{userName}},

Your order for "{{productTitle}}" has a delivery update.

Status: {{deliveryStatus}}
{{additionalInfo}}

Tracking Information:
{{trackingInfo}}

If you have any questions about your delivery, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `Delivery update for "{{productTitle}}": {{deliveryStatus}}. {{trackingInfo}}`,
      pushTemplate: `📦 Delivery update: {{productTitle}} - {{deliveryStatus}}`,
      inAppTemplate: `Delivery update for "{{productTitle}}": {{deliveryStatus}}`,
      cooldown: 60,
    },
    payment_received: {
      type: 'payment_received',
      channels: ['in_app', 'email'],
      priority: 'normal',
      subject: 'Payment Received',
      emailTemplate: `Dear {{sellerName}},

Great news! Payment has been received for your auction win.

Payment Details:
- Amount: ₹{{amount}}
- Product: {{productTitle}}
- Buyer: {{buyerName}}
- Transaction ID: {{transactionId}}

The funds will be transferred to your account within 3-5 business days, minus the platform fee of ₹{{platformFee}}.

Current Balance: ₹{{availableBalance}}

Best regards,
QuickMela Team`,
      smsTemplate: `Payment received ₹{{amount}} for "{{productTitle}}". Funds will be transferred soon.`,
      pushTemplate: `💰 Payment received: ₹{{amount}} for {{productTitle}}`,
      inAppTemplate: `Payment of ₹{{amount}} received for "{{productTitle}}". Funds will be transferred to your account soon.`,
      cooldown: 0,
    },
    payment_failed: {
      type: 'payment_failed',
      channels: ['in_app', 'email', 'sms'],
      priority: 'urgent',
      subject: 'Payment Failed',
      emailTemplate: `Dear {{userName}},

We were unable to process your payment for "{{productTitle}}".

Failure Reason: {{failureReason}}

Please try again with a different payment method or contact your bank if the issue persists.

Retry Payment: {{paymentLink}}

If you need assistance, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `Payment failed for "{{productTitle}}". Reason: {{failureReason}}. Please retry.`,
      pushTemplate: `❌ Payment failed for {{productTitle}}. Please try again.`,
      inAppTemplate: `Payment failed for "{{productTitle}}". Reason: {{failureReason}}. Please try again.`,
      cooldown: 0,
    },
    verification_update: {
      type: 'verification_update',
      channels: ['in_app', 'email'],
      priority: 'normal',
      subject: 'Verification Update',
      emailTemplate: `Dear {{userName}},

Your {{verificationType}} verification has been {{status}}.

{{additionalInfo}}

{{nextSteps}}

If you have any questions, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `{{verificationType}} verification {{status}}. {{nextSteps}}`,
      pushTemplate: `✅ {{verificationType}} verification {{status}}`,
      inAppTemplate: `Your {{verificationType}} verification has been {{status}}. {{nextSteps}}`,
      cooldown: 0,
    },
    kyc_approved: {
      type: 'kyc_approved',
      channels: ['in_app', 'email', 'sms'],
      priority: 'high',
      subject: 'KYC Verification Approved!',
      emailTemplate: `Dear {{userName}},

Congratulations! Your KYC verification has been approved.

You can now:
- Participate in auctions
- List products for sale
- Receive payments directly to your account

Start exploring auctions and enjoy bidding!

Begin Bidding: {{auctionsLink}}

Best regards,
QuickMela Team`,
      smsTemplate: `✅ KYC approved! You can now participate in auctions and list products.`,
      pushTemplate: `🎉 KYC approved! Start bidding and selling on QuickMela.`,
      inAppTemplate: `Congratulations! Your KYC has been approved. You can now participate in auctions and list products.`,
      cooldown: 0,
    },
    kyc_rejected: {
      type: 'kyc_rejected',
      channels: ['in_app', 'email'],
      priority: 'high',
      subject: 'KYC Verification Update',
      emailTemplate: `Dear {{userName}},

We were unable to approve your KYC verification at this time.

Reason: {{rejectionReason}}

Please review the requirements and resubmit your documents.

Resubmit KYC: {{kycLink}}

If you believe this is an error, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `KYC verification rejected. Reason: {{rejectionReason}}. Please resubmit documents.`,
      pushTemplate: `❌ KYC verification rejected. Please check and resubmit.`,
      inAppTemplate: `Your KYC verification was rejected. Reason: {{rejectionReason}}. Please resubmit with correct documents.`,
      cooldown: 0,
    },
    penalty_applied: {
      type: 'penalty_applied',
      channels: ['in_app', 'email'],
      priority: 'high',
      subject: 'Account Notice: Penalty Applied',
      emailTemplate: `Dear {{userName}},

A penalty has been applied to your account.

Penalty Details:
- Type: {{penaltyType}}
- Amount: ₹{{penaltyAmount}}
- Reason: {{penaltyReason}}
- Duration: {{penaltyDuration}}

{{consequences}}

To avoid future penalties, please review our platform policies.

If you believe this penalty was applied in error, you may appeal within 7 days.

Appeal Here: {{appealLink}}

Best regards,
QuickMela Team`,
      smsTemplate: `Penalty applied: ₹{{penaltyAmount}} for {{penaltyType}}. Reason: {{penaltyReason}}.`,
      pushTemplate: `⚠️ Penalty applied: ₹{{penaltyAmount}}. Check your account.`,
      inAppTemplate: `A penalty of ₹{{penaltyAmount}} has been applied to your account for {{penaltyType}}. Reason: {{penaltyReason}}.`,
      cooldown: 0,
    },
    cooldown_applied: {
      type: 'cooldown_applied',
      channels: ['in_app', 'email'],
      priority: 'high',
      subject: 'Account Restriction Applied',
      emailTemplate: `Dear {{userName}},

A temporary restriction has been applied to your account.

Restriction Details:
- Type: {{restrictionType}}
- Duration: Until {{restrictionEndDate}}
- Reason: {{restrictionReason}}

During this period, you will be unable to:
{{restrictionsList}}

This restriction will automatically lift at the specified time. To minimize future restrictions, please adhere to our platform policies.

Best regards,
QuickMela Team`,
      smsTemplate: `Account restriction applied until {{restrictionEndDate}}. Reason: {{restrictionReason}}.`,
      pushTemplate: `🚫 Account restriction until {{restrictionEndDate}}`,
      inAppTemplate: `Your account has been restricted until {{restrictionEndDate}}. Reason: {{restrictionReason}}.`,
      cooldown: 0,
    },
    system_announcement: {
      type: 'system_announcement',
      channels: ['in_app', 'email', 'push'],
      priority: 'normal',
      subject: '{{announcementTitle}}',
      emailTemplate: `Dear {{userName}},

{{announcementMessage}}

{{additionalInfo}}

Best regards,
QuickMela Team`,
      smsTemplate: `{{announcementTitle}}: {{announcementMessage}}`,
      pushTemplate: `📢 {{announcementTitle}}`,
      inAppTemplate: `{{announcementMessage}}`,
      cooldown: 1440, // 24 hours
    },
    security_alert: {
      type: 'security_alert',
      channels: ['in_app', 'email', 'sms', 'push'],
      priority: 'urgent',
      subject: 'Security Alert',
      emailTemplate: `Dear {{userName}},

We detected unusual activity on your account.

Alert Details:
{{alertDetails}}

Recommended Actions:
{{recommendedActions}}

If this was you, no action is needed. If you suspect unauthorized access, please:

1. Change your password immediately
2. Review recent account activity
3. Contact support if you need assistance

Secure Your Account: {{securityLink}}

Best regards,
QuickMela Security Team`,
      smsTemplate: `Security alert on your account. {{alertDetails}}. Change password if suspicious.`,
      pushTemplate: `🚨 Security alert! Check your account immediately.`,
      inAppTemplate: `Security alert detected on your account. {{alertDetails}}. Please review and secure your account.`,
      cooldown: 0,
    },
    refund_processed: {
      type: 'refund_processed',
      channels: ['in_app', 'email', 'sms'],
      priority: 'normal',
      subject: 'Refund Processed',
      emailTemplate: `Dear {{userName}},

Your refund has been processed successfully.

Refund Details:
- Amount: ₹{{refundAmount}}
- Reason: {{refundReason}}
- Processed: {{processedDate}}
- Transaction ID: {{transactionId}}

The funds have been credited back to your original payment method and should appear within 3-5 business days.

Current Balance: ₹{{availableBalance}}

If you have any questions, please contact our support team.

Best regards,
QuickMela Team`,
      smsTemplate: `Refund of ₹{{refundAmount}} processed. Funds will be credited soon.`,
      pushTemplate: `💰 Refund processed: ₹{{refundAmount}}`,
      inAppTemplate: `Your refund of ₹{{refundAmount}} has been processed. Reason: {{refundReason}}. Funds will be credited soon.`,
      cooldown: 0,
    },
  };

  /**
   * Send notification with multi-channel support
   */
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const template = this.templates[data.type];
      const channels = data.channels || template.channels || ['in_app'];
      const priority = data.priority || template.priority || 'normal';

      // Get user preferences
      const userPrefs = await this.getUserNotificationPreferences(data.userId);

      // Check cooldown for this type of notification
      const canSend = await this.checkCooldown(data.userId, data.type, template.cooldown || 0);
      if (!canSend) {
        console.log(`Skipping notification due to cooldown: ${data.type} for user ${data.userId}`);
        return true; // Not an error, just skipped
      }

      // Send through each enabled channel
      const sendPromises: Promise<boolean>[] = [];

      for (const channel of channels) {
        if (this.isChannelEnabled(userPrefs, channel, data.type)) {
          switch (channel) {
            case 'in_app':
              sendPromises.push(this.sendInAppNotification(data));
              break;
            case 'email':
              sendPromises.push(this.sendEmailNotification(data, template));
              break;
            case 'sms':
              sendPromises.push(this.sendSMSNotification(data, template));
              break;
            case 'push':
              sendPromises.push(this.sendPushNotification(data, template));
              break;
          }
        }
      }

      // Wait for all notifications to be sent
      const results = await Promise.allSettled(sendPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

      // Record cooldown timestamp
      await this.recordNotificationSent(data.userId, data.type);

      // Emit event for analytics
      this.emitNotificationEvent(data, channels, priority, successCount > 0);

      return successCount > 0;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send bulk notifications efficiently
   */
  async sendBulkNotifications(notifications: NotificationData[]): Promise<boolean> {
    try {
      // Group notifications by type for batch processing
      const groupedNotifications = new Map<NotificationData['type'], NotificationData[]>();

      notifications.forEach(notification => {
        if (!groupedNotifications.has(notification.type)) {
          groupedNotifications.set(notification.type, []);
        }
        groupedNotifications.get(notification.type)!.push(notification);
      });

      // Process each group
      const promises: Promise<boolean>[] = [];
      for (const [type, group] of groupedNotifications) {
        // For bulk notifications of same type, send through most efficient channel
        if (type === 'system_announcement') {
          promises.push(this.sendBulkSystemAnnouncement(group));
        } else {
          // Send individually but batched
          promises.push(...group.map(n => this.sendNotification(n)));
        }
      }

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

      return successCount > 0;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return false;
    }
  }

  // Private channel-specific senders

  private async sendInAppNotification(data: NotificationData): Promise<boolean> {
    try {
      // Store in database
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          auction_id: data.auctionId,
          product_id: data.productId,
          metadata: data.metadata || {},
          priority: data.priority || 'normal',
          channels: ['in_app'],
        }]);

      if (error) throw error;

      // Send real-time notification via Supabase realtime
      await this.sendRealtimeNotification(data);

      return true;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  private async sendEmailNotification(data: NotificationData, template: NotificationTemplate): Promise<boolean> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      const emailContent = this.renderTemplate(template.emailTemplate || data.message, data.metadata || {});
      const subject = template.subject || data.title;

      // Mock email sending
      console.log(`Sending email to ${data.userId}: ${subject}`);
      console.log(`Email content: ${emailContent.substring(0, 200)}...`);

      // Store email record
      await this.storeNotificationRecord(data, 'email', 'sent', { subject, content: emailContent });

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      await this.storeNotificationRecord(data, 'email', 'failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  private async sendSMSNotification(data: NotificationData, template: NotificationTemplate): Promise<boolean> {
    try {
      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      const smsContent = this.renderTemplate(template.smsTemplate || data.message, data.metadata || {});

      // Mock SMS sending
      console.log(`Sending SMS to ${data.userId}: ${smsContent}`);

      // Store SMS record
      await this.storeNotificationRecord(data, 'sms', 'sent', { content: smsContent });

      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      await this.storeNotificationRecord(data, 'sms', 'failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  private async sendPushNotification(data: NotificationData, template: NotificationTemplate): Promise<boolean> {
    try {
      // In production, integrate with push notification service (Firebase, OneSignal, etc.)
      const pushContent = this.renderTemplate(template.pushTemplate || data.message, data.metadata || {});

      // Mock push notification
      console.log(`Sending push notification to ${data.userId}: ${pushContent}`);

      // Store push record
      await this.storeNotificationRecord(data, 'push', 'sent', { content: pushContent });

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      await this.storeNotificationRecord(data, 'push', 'failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  private async sendBulkSystemAnnouncement(notifications: NotificationData[]): Promise<boolean> {
    try {
      // Send system-wide announcement through most efficient channels
      const announcementData = notifications[0]; // All should be the same for bulk announcements

      // Send email blast, push notifications, etc.
      console.log(`Sending system announcement to ${notifications.length} users: ${announcementData.title}`);

      return true;
    } catch (error) {
      console.error('Error sending bulk system announcement:', error);
      return false;
    }
  }

  // Helper methods

  private renderTemplate(template: string, data: any): string {
    let rendered = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, data[key] || '');
    });
    return rendered;
  }

  private isChannelEnabled(
    prefs: UserNotificationPreferences,
    channel: 'email' | 'push' | 'in_app' | 'sms',
    type: NotificationData['type']
  ): boolean {
    // Check if channel is globally enabled
    if (!prefs.channels[channel === 'in_app' ? 'in_app' : channel]) {
      return false;
    }

    // Check if type is enabled for this channel
    const typePrefs = prefs.types[type];
    if (!typePrefs?.enabled || !typePrefs.channels.includes(channel)) {
      return false;
    }

    // Check quiet hours
    if (typePrefs.quiet_hours && this.isInQuietHours(prefs.timezone, typePrefs.quiet_hours)) {
      return false;
    }

    return true;
  }

  private isInQuietHours(timezone: string, quietHours: { start: string; end: string }): boolean {
    // Simple implementation - in production, use proper timezone handling
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    return currentTime >= quietHours.start && currentTime <= quietHours.end;
  }

  private async checkCooldown(userId: string, type: NotificationData['type'], cooldownMinutes: number): Promise<boolean> {
    if (cooldownMinutes === 0) return true;

    try {
      // Check last notification of this type
      const { data } = await supabase
        .from('notification_history')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('type', type)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) return true;

      const lastSent = new Date(data.sent_at);
      const cooldownEnd = new Date(lastSent.getTime() + cooldownMinutes * 60 * 1000);
      const now = new Date();

      return now >= cooldownEnd;
    } catch (error) {
      // If check fails, allow notification
      return true;
    }
  }

  private async recordNotificationSent(userId: string, type: NotificationData['type']): Promise<void> {
    try {
      await supabase
        .from('notification_history')
        .insert([{
          user_id: userId,
          type,
          sent_at: new Date(),
        }]);
    } catch (error) {
      // Don't fail the notification if history recording fails
      console.warn('Failed to record notification history:', error);
    }
  }

  private async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences> {
    // Mock preferences - in production, fetch from database
    return {
      userId,
      channels: {
        email: true,
        sms: true,
        push: true,
        in_app: true,
      },
      types: {
        bid_won: { enabled: true, channels: ['in_app', 'email', 'sms', 'push'] },
        bid_placed: { enabled: true, channels: ['in_app', 'email'] },
        bid_outbid: { enabled: true, channels: ['in_app', 'email', 'push'] },
        auction_ending: { enabled: true, channels: ['in_app', 'push'] },
        auction_started: { enabled: true, channels: ['in_app', 'email'] },
        auction_ended: { enabled: true, channels: ['in_app', 'email', 'sms'] },
        delivery_update: { enabled: true, channels: ['in_app', 'email', 'sms'] },
        payment_received: { enabled: true, channels: ['in_app', 'email'] },
        payment_failed: { enabled: true, channels: ['in_app', 'email', 'sms'] },
        verification_update: { enabled: true, channels: ['in_app', 'email'] },
        kyc_approved: { enabled: true, channels: ['in_app', 'email', 'sms'] },
        kyc_rejected: { enabled: true, channels: ['in_app', 'email'] },
        penalty_applied: { enabled: true, channels: ['in_app', 'email'] },
        cooldown_applied: { enabled: true, channels: ['in_app', 'email'] },
        system_announcement: { enabled: true, channels: ['in_app', 'email', 'push'] },
        security_alert: { enabled: true, channels: ['in_app', 'email', 'sms', 'push'] },
        refund_processed: { enabled: true, channels: ['in_app', 'email', 'sms'] },
      },
      timezone: 'Asia/Kolkata',
    };
  }

  private async storeNotificationRecord(
    data: NotificationData,
    channel: string,
    status: string,
    details: any
  ): Promise<void> {
    try {
      await supabase
        .from('notification_delivery')
        .insert([{
          user_id: data.userId,
          type: data.type,
          channel,
          status,
          details,
          created_at: new Date(),
        }]);
    } catch (error) {
      console.warn('Failed to store notification record:', error);
    }
  }

  private emitNotificationEvent(
    data: NotificationData,
    channels: NotificationData['channels'],
    priority: NotificationData['priority'],
    success: boolean
  ): void {
    // Emit event for analytics and monitoring
    console.log(`Notification sent: ${data.type} to ${data.userId} via ${channels.join(', ')} - ${success ? 'success' : 'failed'}`);
  }

  // Legacy methods for backward compatibility

  private async sendRealtimeNotification(data: NotificationData): Promise<void> {
    try {
      const channel = supabase.channel(`user:${data.userId}`);
      await channel.send({
        type: 'broadcast',
        event: 'notification',
        payload: data,
      });
    } catch (error) {
      console.error('Error sending realtime notification:', error);
    }
  }

  async sendAuctionEndingNotifications(): Promise<void> {
    // Legacy implementation - now handled by new system
    console.log('Auction ending notifications handled by new notification system');
  }

  async sendBidNotifications(auctionId: string, newBidAmount: number, newBidderId: string): Promise<void> {
    // Legacy implementation - now handled by new system
    console.log('Bid notifications handled by new notification system');
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async enqueueOutbidEvents(productId: string, currentAmount: number, newBidderId: string): Promise<void> {
    // Legacy implementation - now handled by new system
    console.log('Outbid events handled by new notification system');
  }

  async enqueueAuctionStarting(productId: string, startsAtIso: string, userIds: string[]): Promise<void> {
    // Legacy implementation - now handled by new system
    console.log('Auction starting events handled by new notification system');
  }
}

export const notificationService = new NotificationService();