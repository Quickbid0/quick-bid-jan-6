import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
export declare class PaymentService {
    private configService;
    private prisma;
    private walletService;
    private readonly logger;
    private readonly razorpayKeyId;
    private readonly razorpayKeySecret;
    private readonly razorpayWebhookSecret;
    constructor(configService: ConfigService, prisma: PrismaService, walletService: WalletService);
    createWalletTopupOrder(userId: string, amount: number, currency?: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        key: string;
        user: {
            name: string;
            email: string;
            contact: any;
        };
    }>;
    verifyPayment(paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        userId: string;
    }): Promise<{
        success: boolean;
        transactionId: any;
        amount: any;
        message: string;
    }>;
    processSubscriptionPayment(userId: string, plan: 'SILVER' | 'GOLD' | 'ENTERPRISE'): Promise<{
        success: boolean;
        subscriptionId: any;
        plan: "SILVER" | "ENTERPRISE" | "GOLD";
        amount: number;
        bidLimit: number;
        validUntil: Date;
        message: string;
    }>;
    processAuctionSettlement(auctionId: string): Promise<{
        success: boolean;
        auctionId: string;
        winnerId: any;
        sellerId: any;
        finalPrice: any;
        commission: number;
        sellerPayout: number;
        winnerPayment: any;
        sellerPayment: any;
    }>;
    processRefund(transactionId: string, refundAmount?: number, reason?: string): Promise<{
        success: boolean;
        transactionId: string;
        refundAmount: any;
        reason: string;
        newBalance: any;
        message: string;
    }>;
    handleWebhook(webhookData: any, signature: string): Promise<{
        success: boolean;
        event: any;
    }>;
    getPaymentStats(): Promise<{
        totalTransactions: any;
        totalVolume: any;
        successfulPayments: any;
        failedPayments: any;
        refundedAmount: any;
        byType: {
            CREDIT: any;
            DEBIT: any;
            REFUND: any;
            COMMISSION: any;
        };
    }>;
    private handlePaymentCaptured;
    private handlePaymentFailed;
    private handleRefundProcessed;
}
