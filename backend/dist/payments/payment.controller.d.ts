import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createOrder(body: {
        amount: number;
        currency?: string;
        receipt?: string;
        notes?: Record<string, string>;
    }): Promise<{
        success: boolean;
        order: any;
    }>;
    verifyPayment(body: {
        paymentId: string;
        orderId: string;
        signature: string;
    }): Promise<{
        success: boolean;
        verified: boolean;
        message: string;
    }>;
    processAuctionPayment(body: {
        auctionId: string;
        amount: number;
        paymentId: string;
        orderId: string;
        userId: string;
        sellerId: string;
        signature: string;
    }, req: any): Promise<any>;
    processRefund(body: {
        paymentId: string;
        amount?: number;
        notes?: Record<string, string>;
    }): Promise<any>;
    getPayment(paymentId: string): Promise<{
        success: boolean;
        payment: any;
    }>;
    getOrder(orderId: string): Promise<{
        success: boolean;
        order: any;
    }>;
    handleWebhook(webhookData: any, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
