import { ConfigService } from '@nestjs/config';
interface PaymentMethod {
    code: string;
    name: string;
    type: string;
    icon: string;
    description: string;
    fees: number;
    processingTime: string;
    limits: {
        min: number;
        max: number;
    };
    providers: string[];
    isActive?: boolean;
}
interface AuctionPaymentDto {
    auctionId: string;
    amount: number;
    paymentId: string;
    orderId: string;
    userId: string;
    sellerId: string;
}
export declare class PaymentService {
    private configService;
    private readonly logger;
    private razorpay;
    private supabase;
    private providers;
    private paymentMethods;
    constructor(configService: ConfigService);
    private computePaymentAmount;
    private initializeRazorpay;
    createOrder(createOrderDto: any): Promise<any>;
    verifyPayment(verifyPaymentDto: any): Promise<boolean>;
    processAuctionPayment(auctionPaymentDto: AuctionPaymentDto): Promise<any>;
    processRefund(refundDto: any): Promise<any>;
    getPayment(paymentId: string): Promise<any>;
    getOrder(orderId: string): Promise<any>;
    createCustomer(customerData: {
        name: string;
        email: string;
        contact: string;
        notes?: Record<string, string>;
    }): Promise<any>;
    handleWebhook(webhookData: any, signature: string): Promise<boolean>;
    private processWebhookEventIdempotent;
    private isEventAlreadyProcessed;
    private markEventAsProcessed;
    private processWebhookEvent;
    getAvailablePaymentMethods(amount?: number): Promise<PaymentMethod[]>;
    getSupportedMethods(): string[];
    createPaymentWithMethod(amount: number, method: string, orderId: string, customerDetails?: any): Promise<any>;
    private createMockPayment;
    private createRazorpayPayment;
    private createPaytmPayment;
    private createPhonePePayment;
    private isMockMode;
    private handlePaymentCaptured;
    private handlePaymentFailed;
    private handleRefundCreated;
    private processWalletTopupFromWebhook;
    private processAuctionPaymentFromWebhook;
    private markBidAsFailed;
    private processRefundToWallet;
}
export {};
