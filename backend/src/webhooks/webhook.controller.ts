import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

interface WhatsAppWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          context?: {
            from: string;
            id: string;
          };
          text?: {
            body: string;
          };
          button?: {
            text: string;
            payload: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
          errors?: Array<{
            code: number;
            title: string;
            message: string;
          }>;
        }>;
      };
      field: string;
    }>;
  }>;
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly verifyToken: string;

  constructor(private configService: ConfigService) {
    this.verifyToken = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN');

    if (!this.verifyToken) {
      this.logger.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured');
      throw new Error('WhatsApp webhook verify token not configured');
    }

    this.logger.log('WhatsApp webhook controller initialized');
  }

  /**
   * WhatsApp Webhook Verification
   * This endpoint is called by WhatsApp to verify the webhook URL
   */
  @Get('whatsapp')
  @ApiOperation({
    summary: 'WhatsApp Webhook Verification',
    description: 'Endpoint for WhatsApp to verify webhook URL during setup'
  })
  @ApiQuery({ name: 'hub.mode', required: true })
  @ApiQuery({ name: 'hub.challenge', required: true })
  @ApiQuery({ name: 'hub.verify_token', required: true })
  @ApiResponse({ status: 200, description: 'Webhook verified successfully' })
  @ApiResponse({ status: 403, description: 'Webhook verification failed' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ): string {
    this.logger.log('WhatsApp webhook verification attempt', { mode, challenge: challenge.substring(0, 10) + '...' });

    // Verify the webhook
    if (mode === 'subscribe' && verifyToken === this.verifyToken) {
      this.logger.log('WhatsApp webhook verified successfully');
      return challenge;
    } else {
      this.logger.error('WhatsApp webhook verification failed', { mode, providedToken: verifyToken.substring(0, 10) + '...' });
      throw new BadRequestException('Webhook verification failed');
    }
  }

  /**
   * WhatsApp Webhook Handler
   * Receives messages and status updates from WhatsApp
   */
  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'WhatsApp Webhook Handler',
    description: 'Receives and processes WhatsApp messages and status updates'
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWhatsAppWebhook(
    @Body() body: WhatsAppWebhookBody,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    try {
      this.logger.debug('Received WhatsApp webhook', { body: JSON.stringify(body).substring(0, 500) + '...' });

      // Verify webhook signature (recommended for production)
      if (signature) {
        const isValidSignature = await this.verifyWebhookSignature(body, signature);
        if (!isValidSignature) {
          this.logger.error('Invalid WhatsApp webhook signature');
          throw new BadRequestException('Invalid signature');
        }
      }

      // Process webhook payload
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await this.processMessages(change.value);
            } else if (change.field === 'statuses') {
              await this.processStatuses(change.value);
            }
          }
        }
      }

      // Return 200 OK to acknowledge receipt
      return { status: 'success' };

    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook:', error);
      throw error;
    }
  }

  /**
   * Process incoming messages
   */
  private async processMessages(value: WhatsAppWebhookBody['entry'][0]['changes'][0]['value']) {
    const messages = value.messages || [];

    for (const message of messages) {
      try {
        this.logger.log(`Processing WhatsApp message ${message.id} from ${message.from}`);

        // Log the incoming message
        await this.logIncomingMessage(message, value.metadata.phone_number_id);

        // Handle different message types
        switch (message.type) {
          case 'text':
            await this.handleTextMessage(message);
            break;
          case 'button':
            await this.handleButtonMessage(message);
            break;
          case 'interactive':
            await this.handleInteractiveMessage(message);
            break;
          default:
            this.logger.log(`Unhandled message type: ${message.type}`);
        }

        // Mark message as read (optional)
        await this.markMessageAsRead(message.id, value.metadata.phone_number_id);

      } catch (error) {
        this.logger.error(`Error processing message ${message.id}:`, error);
      }
    }
  }

  /**
   * Process message status updates
   */
  private async processStatuses(value: WhatsAppWebhookBody['entry'][0]['changes'][0]['value']) {
    const statuses = value.statuses || [];

    for (const status of statuses) {
      try {
        this.logger.log(`Processing WhatsApp status update for message ${status.id}: ${status.status}`);

        // Update message status in our logs
        await this.updateMessageStatus(status);

        // Handle specific status types
        switch (status.status) {
          case 'delivered':
            await this.handleMessageDelivered(status);
            break;
          case 'read':
            await this.handleMessageRead(status);
            break;
          case 'failed':
            await this.handleMessageFailed(status);
            break;
          case 'sent':
            await this.handleMessageSent(status);
            break;
        }

      } catch (error) {
        this.logger.error(`Error processing status update for ${status.id}:`, error);
      }
    }
  }

  /**
   * Handle incoming text messages
   */
  private async handleTextMessage(message: any) {
    const phoneNumber = message.from;
    const text = message.text?.body || '';

    this.logger.log(`Received text message from ${phoneNumber}: ${text}`);

    // Handle common commands or keywords
    const lowerText = text.toLowerCase();

    if (lowerText.includes('help') || lowerText.includes('hi') || lowerText.includes('hello')) {
      // Send help message
      await this.sendHelpMessage(phoneNumber);
    } else if (lowerText.includes('status') || lowerText.includes('order')) {
      // Handle status inquiries
      await this.sendStatusInquiryResponse(phoneNumber);
    } else if (lowerText.includes('support') || lowerText.includes('complaint')) {
      // Escalate to support
      await this.escalateToSupport(phoneNumber, text);
    } else {
      // Send default response
      await this.sendDefaultResponse(phoneNumber);
    }
  }

  /**
   * Handle button click messages
   */
  private async handleButtonMessage(message: any) {
    const phoneNumber = message.from;
    const buttonText = message.button?.text || '';
    const buttonPayload = message.button?.payload || '';

    this.logger.log(`Received button click from ${phoneNumber}: ${buttonText} (${buttonPayload})`);

    // Handle button actions
    if (buttonPayload.includes('payment_link')) {
      await this.handlePaymentLinkClick(phoneNumber, buttonPayload);
    } else if (buttonPayload.includes('auction_link')) {
      await this.handleAuctionLinkClick(phoneNumber, buttonPayload);
    } else if (buttonPayload.includes('support')) {
      await this.escalateToSupport(phoneNumber, 'Button click: ' + buttonText);
    }
  }

  /**
   * Handle interactive messages
   */
  private async handleInteractiveMessage(message: any) {
    // Handle interactive message responses (lists, buttons, etc.)
    this.logger.log(`Received interactive message from ${message.from}`);
    // Implement interactive message handling logic
  }

  /**
   * Send help message
   */
  private async sendHelpMessage(phoneNumber: string) {
    // In a real implementation, this would send a WhatsApp message
    // For now, just log the action
    this.logger.log(`Sending help message to ${phoneNumber}`);
  }

  /**
   * Send status inquiry response
   */
  private async sendStatusInquiryResponse(phoneNumber: string) {
    this.logger.log(`Sending status inquiry response to ${phoneNumber}`);
  }

  /**
   * Escalate to support
   */
  private async escalateToSupport(phoneNumber: string, message: string) {
    this.logger.log(`Escalating ${phoneNumber} to support: ${message}`);
    // Create support ticket or notification
  }

  /**
   * Send default response
   */
  private async sendDefaultResponse(phoneNumber: string) {
    this.logger.log(`Sending default response to ${phoneNumber}`);
  }

  /**
   * Handle payment link clicks
   */
  private async handlePaymentLinkClick(phoneNumber: string, payload: string) {
    this.logger.log(`Payment link clicked by ${phoneNumber}: ${payload}`);
    // Track click analytics, redirect to payment page, etc.
  }

  /**
   * Handle auction link clicks
   */
  private async handleAuctionLinkClick(phoneNumber: string, payload: string) {
    this.logger.log(`Auction link clicked by ${phoneNumber}: ${payload}`);
    // Track click analytics, redirect to auction page, etc.
  }

  /**
   * Mark message as read
   */
  private async markMessageAsRead(messageId: string, phoneNumberId: string) {
    // In a real implementation, this would call the WhatsApp API to mark the message as read
    this.logger.debug(`Marking message ${messageId} as read`);
  }

  /**
   * Log incoming message
   */
  private async logIncomingMessage(message: any, phoneNumberId: string) {
    // Log incoming messages to database for compliance and debugging
    this.logger.debug(`Logged incoming message ${message.id}`);
  }

  /**
   * Update message status
   */
  private async updateMessageStatus(status: any) {
    // Update message status in database
    this.logger.debug(`Updated status for message ${status.id} to ${status.status}`);
  }

  /**
   * Handle message delivered
   */
  private async handleMessageDelivered(status: any) {
    this.logger.log(`Message ${status.id} delivered to ${status.recipient_id}`);
  }

  /**
   * Handle message read
   */
  private async handleMessageRead(status: any) {
    this.logger.log(`Message ${status.id} read by ${status.recipient_id}`);
  }

  /**
   * Handle message failed
   */
  private async handleMessageFailed(status: any) {
    this.logger.error(`Message ${status.id} failed to deliver to ${status.recipient_id}`, {
      errors: status.errors,
    });

    // Implement retry logic or alert logic for failed messages
  }

  /**
   * Handle message sent
   */
  private async handleMessageSent(status: any) {
    this.logger.log(`Message ${status.id} sent to ${status.recipient_id}`);
  }

  /**
   * Verify webhook signature
   */
  private async verifyWebhookSignature(body: WhatsAppWebhookBody, signature: string): Promise<boolean> {
    try {
      // WhatsApp signs the payload with SHA256 using the app secret
      // Implementation would verify the signature here
      // For now, return true (implement proper verification in production)
      return true;
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}
