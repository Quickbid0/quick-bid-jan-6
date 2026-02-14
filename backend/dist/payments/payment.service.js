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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const Razorpay = require('razorpay');
var EscrowState;
(function (EscrowState) {
    EscrowState["PENDING"] = "pending";
    EscrowState["FUNDED"] = "funded";
    EscrowState["DELIVERED"] = "delivered";
    EscrowState["RELEASED"] = "released";
    EscrowState["CANCELLED"] = "cancelled";
    EscrowState["REFUNDED"] = "refunded";
})(EscrowState || (EscrowState = {}));
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.paymentMethods = [
            {
                code: 'gpay',
                name: 'Google Pay',
                type: 'upi',
                icon: '💰',
                description: 'Pay with Google Pay UPI',
                fees: 0,
                processingTime: 'Instant',
                limits: { min: 1, max: 100000 },
                providers: ['razorpay', 'paytm']
            },
            {
                code: 'paytm',
                name: 'Paytm',
                type: 'wallet',
                icon: '🟡',
                description: 'Pay with Paytm Wallet',
                fees: 0,
                processingTime: 'Instant',
                limits: { min: 1, max: 50000 },
                providers: ['paytm']
            },
            {
                code: 'phonepe',
                name: 'PhonePe',
                type: 'upi',
                icon: '🟣',
                description: 'Pay with PhonePe UPI',
                fees: 0,
                processingTime: 'Instant',
                limits: { min: 1, max: 100000 },
                providers: ['phonepe']
            },
            {
                code: 'amazonpay',
                name: 'Amazon Pay',
                type: 'wallet',
                icon: '📦',
                description: 'Pay with Amazon Pay',
                fees: 0,
                processingTime: 'Instant',
                limits: { min: 1, max: 50000 },
                providers: ['razorpay']
            },
            {
                code: 'card',
                name: 'Credit/Debit Card',
                type: 'card',
                icon: '💳',
                description: 'Pay with Visa, Mastercard, RuPay',
                fees: 1.5,
                processingTime: 'Instant',
                limits: { min: 1, max: 200000 },
                providers: ['razorpay', 'paytm']
            },
            {
                code: 'netbanking',
                name: 'Net Banking',
                type: 'netbanking',
                icon: '🏦',
                description: 'Pay using online banking',
                fees: 0,
                processingTime: '2-3 minutes',
                limits: { min: 1, max: 500000 },
                providers: ['razorpay']
            },
            {
                code: 'upi',
                name: 'UPI',
                type: 'upi',
                icon: '📱',
                description: 'Pay using any UPI app',
                fees: 0,
                processingTime: 'Instant',
                limits: { min: 1, max: 100000 },
                providers: ['razorpay', 'paytm', 'phonepe']
            }
        ];
        this.initializeRazorpay();
        this.providers = [
            {
                name: 'Razorpay',
                code: 'razorpay',
                supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
                baseUrl: 'https://api.razorpay.com/v1',
                apiKey: this.configService.get('RAZORPAY_KEY_ID') || 'demo_key',
                isActive: true
            },
            {
                name: 'Paytm',
                code: 'paytm',
                supportedMethods: ['upi', 'wallet', 'card'],
                baseUrl: 'https://securegw.paytm.in',
                apiKey: this.configService.get('PAYTM_MERCHANT_KEY') || 'demo_key',
                isActive: true
            },
            {
                name: 'PhonePe',
                code: 'phonepe',
                supportedMethods: ['upi', 'wallet'],
                baseUrl: 'https://api.phonepe.com/apis/hermes',
                apiKey: this.configService.get('PHONEPE_MERCHANT_ID') || 'demo_key',
                isActive: true
            }
        ];
    }
    computePaymentAmount(auctionId) {
        return 10000;
    }
    initializeRazorpay() {
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (!keyId || !keySecret || keyId === 'dummy_key_id' || keySecret === 'dummy_key_secret') {
            this.logger.warn('Using mock Razorpay configuration for development/testing');
            this.razorpay = {
                orders: {
                    create: async (data) => ({
                        id: `order_${Date.now()}`,
                        entity: 'order',
                        amount: data.amount,
                        amount_paid: 0,
                        amount_due: data.amount,
                        currency: data.currency || 'INR',
                        receipt: data.receipt,
                        offer_id: null,
                        status: 'created',
                        attempts: 0,
                        notes: data.notes || [],
                        created_at: Date.now()
                    })
                },
                payments: {
                    fetch: async (paymentId) => ({
                        id: paymentId,
                        entity: 'payment',
                        amount: 10000,
                        currency: 'INR',
                        status: 'captured',
                        order_id: null,
                        invoice_id: null,
                        international: false,
                        method: 'card',
                        amount_refunded: 0,
                        refund_status: null,
                        captured: true,
                        description: 'Test payment',
                        card_id: null,
                        bank: null,
                        wallet: null,
                        vpa: null,
                        email: 'test@example.com',
                        contact: '+919876543210',
                        notes: [],
                        fee: 0,
                        tax: 0,
                        error_code: null,
                        error_description: null,
                        created_at: Date.now()
                    }),
                    refund: async (paymentId, refundData) => ({
                        id: `refund_${Date.now()}`,
                        entity: 'refund',
                        amount: refundData.amount,
                        currency: 'INR',
                        payment_id: paymentId,
                        status: 'processed',
                        speed_processed: 'normal',
                        speed_requested: 'normal',
                        receipt: null,
                        notes: refundData.notes || [],
                        created_at: Date.now()
                    })
                }
            };
        }
        else {
            this.razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret
            });
        }
    }
    async createOrder(createOrderDto) {
        try {
            const { amount, currency = 'INR', receipt, notes } = createOrderDto;
            const computedAmount = this.computePaymentAmount(notes?.auctionId || 'default');
            if (computedAmount < 1) {
                throw new common_1.BadRequestException('Invalid payment amount');
            }
            const amountInPaisa = Math.round(computedAmount * 100);
            const orderOptions = {
                amount: amountInPaisa,
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
                notes: notes || {},
                payment_capture: 1,
            };
            this.logger.log(`Creating Razorpay order: ${JSON.stringify(orderOptions)}`);
            const order = await this.razorpay.orders.create(orderOptions);
            this.logger.log(`Razorpay order created: ${order.id}`);
            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                key: this.configService.get('RAZORPAY_KEY_ID'),
                receipt: order.receipt,
                notes: order.notes,
                createdAt: order.created_at,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create payment order');
        }
    }
    async verifyPayment(verifyPaymentDto) {
        try {
            const { paymentId, orderId, signature } = verifyPaymentDto;
            const secret = this.configService.get('RAZORPAY_KEY_SECRET');
            if (!secret) {
                throw new Error('Razorpay secret not configured');
            }
            const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
                .update(`${orderId}|${paymentId}`)
                .digest('hex');
            const isValid = (0, crypto_1.timingSafeEqual)(Buffer.from(expectedSignature, 'hex'), Buffer.from(signature, 'hex'));
            if (isValid) {
                this.logger.log(`Payment verification successful for order: ${orderId}, payment: ${paymentId}`);
            }
            else {
                this.logger.warn(`Payment verification failed for order: ${orderId}, payment: ${paymentId}`);
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Payment verification error: ${error.message}`, error.stack);
            return false;
        }
    }
    async processAuctionPayment(auctionPaymentDto) {
        try {
            const { auctionId, amount, paymentId, orderId, userId, sellerId } = auctionPaymentDto;
            const isVerified = await this.verifyPayment({
                paymentId,
                orderId,
                signature: '',
            });
            if (!isVerified) {
                throw new common_1.BadRequestException('Payment verification failed');
            }
            const payment = await this.razorpay.payments.fetch(paymentId);
            if (payment.status !== 'captured') {
                throw new common_1.BadRequestException('Payment not captured');
            }
            const platformFee = amount * 0.05;
            const sellerAmount = amount - platformFee;
            this.logger.log(`Auction payment processed: Auction ${auctionId}, Amount ₹${amount}, Seller gets ₹${sellerAmount}`);
            const transaction = {
                id: `txn_${Date.now()}`,
                auctionId,
                buyerId: userId,
                sellerId,
                amount,
                platformFee,
                sellerAmount,
                paymentId,
                orderId,
                status: 'completed',
                createdAt: new Date(),
            };
            return {
                success: true,
                transaction,
                message: 'Auction payment processed successfully',
            };
        }
        catch (error) {
            this.logger.error(`Auction payment processing failed: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to process auction payment');
        }
    }
    async processRefund(refundDto) {
        try {
            const { paymentId, amount, notes } = refundDto;
            const payment = await this.razorpay.payments.fetch(paymentId);
            if (!payment) {
                throw new common_1.BadRequestException('Payment not found');
            }
            const refundAmount = amount ? Math.round(amount * 100) : payment.amount;
            if (refundAmount > payment.amount) {
                throw new common_1.BadRequestException('Refund amount cannot exceed payment amount');
            }
            const refundOptions = {
                payment_id: paymentId,
                amount: refundAmount,
                notes: notes || {},
            };
            this.logger.log(`Processing refund: ${JSON.stringify(refundOptions)}`);
            const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
            this.logger.log(`Refund processed successfully: ${refund.id}`);
            return {
                success: true,
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                paymentId: refund.payment_id,
                createdAt: refund.created_at,
            };
        }
        catch (error) {
            this.logger.error(`Refund processing failed: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to process refund');
        }
    }
    async getPayment(paymentId) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            return {
                id: payment.id,
                amount: Number(payment.amount) / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                orderId: payment.order_id,
                captured: payment.captured,
                description: payment.description,
                email: payment.email,
                contact: payment.contact,
                fee: payment.fee ? Number(payment.fee) / 100 : 0,
                tax: payment.tax ? Number(payment.tax) / 100 : 0,
                createdAt: payment.created_at,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch payment: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to fetch payment details');
        }
    }
    async getOrder(orderId) {
        try {
            const order = await this.razorpay.orders.fetch(orderId);
            return {
                id: order.id,
                amount: Number(order.amount) / 100,
                currency: order.currency,
                status: order.status,
                receipt: order.receipt,
                notes: order.notes,
                createdAt: order.created_at,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch order: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to fetch order details');
        }
    }
    async createCustomer(customerData) {
        try {
            const customer = await this.razorpay.customers.create(customerData);
            this.logger.log(`Customer created: ${customer.id}`);
            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                contact: customer.contact,
                notes: customer.notes,
                createdAt: customer.created_at,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create customer');
        }
    }
    async handleWebhook(webhookData, signature) {
        try {
            const secret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
            if (!secret) {
                throw new Error('Webhook secret not configured');
            }
            const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
                .update(JSON.stringify(webhookData))
                .digest('hex');
            const isValid = (0, crypto_1.timingSafeEqual)(Buffer.from(expectedSignature, 'hex'), Buffer.from(signature, 'hex'));
            if (isValid) {
                this.logger.log(`Webhook verified and processing: ${webhookData.event}`);
                const { event, data } = webhookData;
                if (event === 'payment.captured' || event === 'payment.failed') {
                    const payment = data.payment;
                    if (!payment.order_id) {
                        this.logger.warn(`Webhook missing order_id: ${event}`);
                        return false;
                    }
                }
                await this.processWebhookEventIdempotent(webhookData);
            }
            else {
                this.logger.warn(`Invalid webhook signature for event: ${webhookData.event}`);
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
            return false;
        }
    }
    async processWebhookEventIdempotent(webhookData) {
        const { event, data } = webhookData;
        try {
            let razorpayId;
            let eventType;
            switch (event) {
                case 'payment.captured':
                    razorpayId = data.payment.id;
                    eventType = 'payment.captured';
                    break;
                case 'payment.failed':
                    razorpayId = data.payment.id;
                    eventType = 'payment.failed';
                    break;
                case 'refund.created':
                    razorpayId = data.refund.id;
                    eventType = 'refund.created';
                    break;
                default:
                    this.logger.log(`Unhandled webhook event: ${event}`);
                    return;
            }
            const alreadyProcessed = await this.isEventAlreadyProcessed(razorpayId);
            if (alreadyProcessed) {
                this.logger.log(`Webhook event ${event} for ${razorpayId} already processed - skipping`);
                return;
            }
            await this.processWebhookEvent(webhookData);
            await this.markEventAsProcessed(razorpayId, eventType, webhookData);
            this.logger.log(`Successfully processed webhook event: ${event} for ${razorpayId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event ${event}: ${error.message}`, error.stack);
        }
    }
    async isEventAlreadyProcessed(razorpayId) {
        try {
            if (!this.supabase) {
                this.logger.warn('Supabase not initialized - assuming event not processed');
                return false;
            }
            const { data, error } = await this.supabase
                .from('processed_webhook_events')
                .select('id')
                .eq('razorpay_id', razorpayId)
                .single();
            if (error && error.code !== 'PGRST116') {
                this.logger.error(`Error checking webhook idempotency: ${error.message}`, error);
                return false;
            }
            const alreadyProcessed = !!data;
            if (alreadyProcessed) {
                this.logger.log(`Webhook event for razorpay_id ${razorpayId} already processed`);
            }
            return alreadyProcessed;
        }
        catch (error) {
            this.logger.error(`Error checking event processing status: ${error.message}`, error.stack);
            return false;
        }
    }
    async markEventAsProcessed(razorpayId, eventType, webhookData) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized - cannot mark event as processed');
            }
            const { data, error } = await this.supabase
                .from('processed_webhook_events')
                .insert({
                razorpay_id: razorpayId,
                event_type: eventType,
                event_data: webhookData,
                processed_at: new Date().toISOString()
            })
                .select();
            if (error) {
                if (error.code === '23505') {
                    this.logger.warn(`Duplicate webhook event detected for razorpay_id: ${razorpayId}`);
                    return;
                }
                this.logger.error(`Error marking webhook event as processed: ${error.message}`, error);
                throw new Error(`Failed to mark webhook event as processed: ${error.message}`);
            }
            this.logger.log(`Successfully marked webhook event as processed: ${eventType} for ${razorpayId}`);
        }
        catch (error) {
            this.logger.error(`Error marking event as processed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processWebhookEvent(webhookData) {
        const { event, data } = webhookData;
        try {
            switch (event) {
                case 'payment.captured':
                    await this.handlePaymentCaptured(data.payment);
                    break;
                case 'payment.failed':
                    await this.handlePaymentFailed(data.payment);
                    break;
                case 'refund.created':
                    await this.handleRefundCreated(data.refund);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event: ${event}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event ${event}: ${error.message}`, error.stack);
        }
    }
    async getAvailablePaymentMethods(amount) {
        let methods = this.paymentMethods.filter(method => method.isActive !== false);
        if (amount) {
            methods = methods.filter(method => amount >= method.limits.min && amount <= method.limits.max);
        }
        return methods;
    }
    getSupportedMethods() {
        const allMethods = new Set();
        this.providers.forEach(provider => {
            if (provider.isActive) {
                provider.supportedMethods.forEach(method => allMethods.add(method));
            }
        });
        return Array.from(allMethods);
    }
    async createPaymentWithMethod(amount, method, orderId, customerDetails) {
        const paymentMethod = this.paymentMethods.find(m => m.code === method);
        if (!paymentMethod) {
            throw new common_1.BadRequestException('Payment method not supported');
        }
        const provider = this.providers.find(p => p.isActive && p.supportedMethods.includes(paymentMethod.type));
        if (!provider) {
            throw new common_1.BadRequestException('No provider available for this payment method');
        }
        if (provider.code === 'razorpay' && this.isMockMode()) {
            return this.createMockPayment(amount, method, orderId, paymentMethod);
        }
        switch (provider.code) {
            case 'razorpay':
                return this.createRazorpayPayment(amount, method, orderId, customerDetails);
            case 'paytm':
                return this.createPaytmPayment(amount, method, orderId, customerDetails);
            case 'phonepe':
                return this.createPhonePePayment(amount, method, orderId, customerDetails);
            default:
                throw new common_1.BadRequestException('Provider not implemented');
        }
    }
    createMockPayment(amount, method, orderId, paymentMethod) {
        const mockPaymentId = `QM${Date.now().toString().slice(-10)}`;
        const response = {
            success: true,
            paymentId: mockPaymentId,
            orderId,
            amount,
            method,
            status: 'pending',
            provider: 'mock'
        };
        switch (method) {
            case 'gpay':
            case 'phonepe':
            case 'upi':
                response.upiId = `quickmela@upi`;
                response.qrCode = `https://api.quickmela.com/payments/qr/${mockPaymentId}`;
                break;
            case 'paytm':
            case 'amazonpay':
                response.paymentUrl = `https://payments.quickmela.com/${mockPaymentId}`;
                break;
            case 'card':
                response.paymentUrl = `https://payments.quickmela.com/card/${mockPaymentId}`;
                break;
        }
        return response;
    }
    async createRazorpayPayment(amount, method, orderId, customerDetails) {
        const order = await this.createOrder({
            amount,
            currency: 'INR',
            receipt: orderId,
            notes: { payment_method: method, ...customerDetails }
        });
        return {
            success: true,
            paymentId: order.orderId,
            orderId,
            amount,
            method,
            status: 'created',
            provider: 'razorpay',
            razorpayKey: this.configService.get('RAZORPAY_KEY_ID'),
            orderData: order
        };
    }
    async createPaytmPayment(amount, method, orderId, customerDetails) {
        this.logger.log(`Creating Paytm payment: ${orderId}, amount: ${amount}`);
        return {
            success: true,
            paymentId: `PAYTM${Date.now()}`,
            orderId,
            amount,
            method,
            status: 'pending',
            provider: 'paytm',
            paymentUrl: `https://securegw.paytm.in/pay?orderId=${orderId}`
        };
    }
    async createPhonePePayment(amount, method, orderId, customerDetails) {
        this.logger.log(`Creating PhonePe payment: ${orderId}, amount: ${amount}`);
        return {
            success: true,
            paymentId: `PHONEPE${Date.now()}`,
            orderId,
            amount,
            method,
            status: 'pending',
            provider: 'phonepe',
            upiId: `quickmela@phonepe`,
            qrCode: `https://api.phonepe.com/qr/${orderId}`
        };
    }
    isMockMode() {
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        return !keyId || !keySecret || keyId === 'dummy_key_id' || keySecret === 'dummy_key_secret';
    }
    async handlePaymentCaptured(payment) {
        try {
            const { id: paymentId, amount, order_id, notes } = payment;
            const amountInRupees = Number(amount) / 100;
            this.logger.log(`Processing payment capture: ${paymentId}, amount: ₹${amountInRupees}`);
            const { user_id: userId, bid_id: bidId, type } = notes || {};
            if (type === 'wallet_topup' && userId) {
                await this.processWalletTopupFromWebhook(userId, amountInRupees, paymentId);
            }
            else if (bidId && userId) {
                await this.processAuctionPaymentFromWebhook(bidId, userId, amountInRupees, paymentId);
            }
            else {
                this.logger.warn(`Unknown payment type or missing metadata for payment: ${paymentId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle payment capture ${payment.id}: ${error.message}`, error.stack);
        }
    }
    async handlePaymentFailed(payment) {
        try {
            const { id: paymentId, amount, order_id, error_code, error_description, notes } = payment;
            const amountInRupees = Number(amount) / 100;
            this.logger.log(`Processing payment failure: ${paymentId}, amount: ₹${amountInRupees}, error: ${error_description}`);
            const { user_id: userId, bid_id: bidId } = notes || {};
            if (bidId) {
                await this.markBidAsFailed(bidId, error_description);
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle payment failure ${payment.id}: ${error.message}`, error.stack);
        }
    }
    async handleRefundCreated(refund) {
        try {
            const { id: refundId, payment_id: paymentId, amount, status, notes } = refund;
            const amountInRupees = Number(amount) / 100;
            this.logger.log(`Processing refund creation: ${refundId}, amount: ₹${amountInRupees}`);
            const { user_id: userId, reason } = notes || {};
            if (userId) {
                await this.processRefundToWallet(userId, amountInRupees, refundId, reason);
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle refund creation ${refund.id}: ${error.message}`, error.stack);
        }
    }
    async processWalletTopupFromWebhook(userId, amount, paymentId) {
        this.logger.log(`Wallet topup processed for user ${userId}: ₹${amount} (payment: ${paymentId})`);
    }
    async processAuctionPaymentFromWebhook(bidId, userId, amount, paymentId) {
        this.logger.log(`Auction payment processed for bid ${bidId}: ₹${amount} (payment: ${paymentId})`);
    }
    async markBidAsFailed(bidId, reason) {
        this.logger.log(`Marking bid ${bidId} as failed: ${reason}`);
    }
    async processRefundToWallet(userId, amount, refundId, reason) {
        this.logger.log(`Processing refund to wallet for user ${userId}: ₹${amount} (refund: ${refundId})`);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map