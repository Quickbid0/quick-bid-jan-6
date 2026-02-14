"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = require("nodemailer");
const event_emitter_1 = require("@nestjs/event-emitter");
const twilio = require('twilio');
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prismaService, eventEmitter) {
        this.prismaService = prismaService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.defaultTemplates = [
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
        this.initializeServices();
    }
    initializeServices() {
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    }
    async sendNotification(request) {
        try {
            let result;
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
            await this.logNotification({
                ...request,
                status: 'sent',
                sentAt: new Date(),
                metadata: { ...request.metadata, result },
            });
            return { success: true, messageId: result.messageId };
        }
        catch (error) {
            await this.logNotification({
                ...request,
                status: 'failed',
                errorMessage: error.message,
                metadata: { ...request.metadata, error: error.message },
            });
            return { success: false, error: error.message };
        }
    }
    async sendBulkNotifications(requests) {
        const results = await Promise.allSettled(requests.map(async (request) => {
            const result = await this.sendNotification(request);
            return { request, success: result.success, error: result.error };
        }));
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;
        return {
            successful,
            failed,
            results: results.map(r => r.status === 'fulfilled' ? r.value : { request: r.reason.request, success: false, error: r.reason.message }),
        };
    }
    async getNotificationTemplates(type) {
        let templates = this.defaultTemplates;
        if (type) {
            templates = templates.filter(t => t.type === type);
        }
        return templates.filter(t => t.isActive);
    }
    async sendTemplatedNotification(templateId, recipientId, variables, options) {
        const template = this.defaultTemplates.find(t => t.id === templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        const recipient = await this.prismaService.user.findUnique({
            where: { id: recipientId },
            select: { email: true, name: true },
        });
        if (!recipient) {
            throw new Error(`Recipient ${recipientId} not found`);
        }
        let content = template.content;
        let subject = template.subject;
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, String(value));
            if (subject) {
                subject = subject.replace(regex, String(value));
            }
        });
        const notificationRequest = {
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
    async scheduleNotification(request, scheduledFor) {
        request.scheduledFor = scheduledFor;
        await this.logNotification({
            ...request,
            status: 'pending',
            metadata: { ...request.metadata, scheduledFor },
        });
        setTimeout(async () => {
            await this.sendNotification(request);
        }, scheduledFor.getTime() - Date.now());
        return { success: true, scheduledId: `scheduled_${Date.now()}` };
    }
    async getNotificationHistory(recipientId, type, limit = 50, offset = 0) {
        const mockNotifications = [
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
    async notifyBidPlaced(auctionId, bidderId, bidAmount) {
        const auction = await this.prismaService.auction?.findUnique({
            where: { id: auctionId },
            select: { title: true },
        });
        if (auction) {
            await this.sendTemplatedNotification('inapp_bid_placed', bidderId, {
                bidAmount: bidAmount.toLocaleString(),
                auctionTitle: auction.title,
            });
        }
    }
    async notifyAuctionEndingSoon(auctionId) {
        const watchers = ['user_123', 'user_456'];
        for (const watcherId of watchers) {
            await this.sendTemplatedNotification('auction_ending_soon', watcherId, {
                userName: 'Valued User',
                auctionTitle: 'Sample Auction',
                currentPrice: '15000',
                timeLeft: '2 hours',
                auctionLink: `https://quickmela.com/auctions/${auctionId}`,
            });
        }
    }
    async notifyAuctionWon(auctionId, winnerId, winningAmount) {
        await this.sendTemplatedNotification('auction_won', winnerId, {
            winnerName: 'Winner Name',
            auctionTitle: 'Sample Auction',
            winningAmount: winningAmount.toLocaleString(),
            auctionId,
            paymentLink: `https://quickmela.com/payment/${auctionId}`,
        });
    }
    async notifySellerItemSold(auctionId, sellerId, soldPrice) {
        await this.sendTemplatedNotification('seller_item_sold', sellerId, {
            sellerName: 'Seller Name',
            itemTitle: 'Sample Item',
            soldPrice: soldPrice.toLocaleString(),
            buyerName: 'Buyer Name',
            auctionId,
            commissionFee: Math.round(soldPrice * 0.05).toLocaleString(),
            commissionPercent: '5%',
            netAmount: Math.round(soldPrice * 0.95).toLocaleString(),
            dashboardLink: 'https://quickmela.com/seller/dashboard',
        });
    }
    async notifyAdminHighValueAuction(auctionData) {
        const adminUsers = await this.prismaService.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true },
        });
        for (const admin of adminUsers) {
            await this.sendTemplatedNotification('admin_high_value_auction', admin.id, {
                auctionTitle: auctionData.title,
                currentPrice: auctionData.currentPrice.toLocaleString(),
                reservePrice: auctionData.reservePrice?.toLocaleString() || 'N/A',
                sellerName: 'Seller Name',
                sellerId: auctionData.sellerId,
                category: auctionData.category || 'General',
                auctionLink: `https://quickmela.com/admin/auctions/${auctionData.id}`,
            });
        }
    }
    async sendEmail(request) {
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
    async sendSMS(request) {
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
    async sendPushNotification(request) {
        console.log(`Push notification to ${request.recipientId}: ${request.content}`);
        return { messageId: `push_${Date.now()}` };
    }
    async sendInAppNotification(request) {
        this.eventEmitter.emit('notification.in_app', {
            recipientId: request.recipientId,
            content: request.content,
            metadata: request.metadata,
        });
        return { messageId: `inapp_${Date.now()}` };
    }
    convertToHtml(textContent) {
        return textContent
            .split('\n')
            .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
            .join('')
            .replace(/\n\n/g, '</p><p>');
    }
    async logNotification(logData) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], NotificationService);
//# sourceMappingURL=notification.service.js.map