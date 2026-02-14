import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface NotificationTemplate {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    subject?: string;
    content: string;
    variables: string[];
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
export declare class NotificationService {
    private prismaService;
    private eventEmitter;
    private readonly logger;
    private emailTransporter;
    private smsClient;
    private defaultTemplates;
    constructor(prismaService: PrismaService, eventEmitter: EventEmitter2);
    private initializeServices;
    sendNotification(request: NotificationRequest): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendBulkNotifications(requests: NotificationRequest[]): Promise<{
        successful: number;
        failed: number;
        results: {
            request: NotificationRequest;
            success: boolean;
            error?: string;
        }[];
    }>;
    getNotificationTemplates(type?: NotificationRequest['type']): Promise<NotificationTemplate[]>;
    sendTemplatedNotification(templateId: string, recipientId: string, variables: Record<string, any>, options?: {
        priority?: NotificationRequest['priority'];
        scheduledFor?: Date;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    scheduleNotification(request: NotificationRequest, scheduledFor: Date): Promise<{
        success: boolean;
        scheduledId?: string;
    }>;
    getNotificationHistory(recipientId?: string, type?: NotificationRequest['type'], limit?: number, offset?: number): Promise<{
        notifications: NotificationLog[];
        total: number;
    }>;
    notifyBidPlaced(auctionId: string, bidderId: string, bidAmount: number): Promise<void>;
    notifyAuctionEndingSoon(auctionId: string): Promise<void>;
    notifyAuctionWon(auctionId: string, winnerId: string, winningAmount: number): Promise<void>;
    notifySellerItemSold(auctionId: string, sellerId: string, soldPrice: number): Promise<void>;
    notifyAdminHighValueAuction(auctionData: any): Promise<void>;
    private sendEmail;
    private sendSMS;
    private sendPushNotification;
    private sendInAppNotification;
    private convertToHtml;
    private logNotification;
}
