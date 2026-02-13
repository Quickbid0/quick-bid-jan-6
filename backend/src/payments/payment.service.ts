import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
const Razorpay = require('razorpay');

interface PaymentProvider {
  name: string;
  code: string;
  supportedMethods: string[];
  baseUrl: string;
  apiKey: string;
  isActive: boolean;
}

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

interface CreateOrderDto {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

interface VerifyPaymentDto {
  paymentId: string;
  orderId: string;
  signature: string;
}

interface RefundDto {
  paymentId: string;
  amount?: number;
  notes?: Record<string, any>;
}

interface AuctionPaymentDto {
  auctionId: string;
  amount: number;
  paymentId: string;
  orderId: string;
  userId: string;
  sellerId: string;
}

enum EscrowState {
  PENDING = 'pending',
  FUNDED = 'funded',
  DELIVERED = 'delivered',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: any;
  private supabase: any;

  private providers: PaymentProvider[];

  private paymentMethods: PaymentMethod[] = [
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

  constructor(private configService: ConfigService) {
    this.initializeRazorpay();
    this.providers = [
      {
        name: 'Razorpay',
        code: 'razorpay',
        supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
        baseUrl: 'https://api.razorpay.com/v1',
        apiKey: this.configService.get<string>('RAZORPAY_KEY_ID') || 'demo_key',
        isActive: true
      },
      {
        name: 'Paytm',
        code: 'paytm',
        supportedMethods: ['upi', 'wallet', 'card'],
        baseUrl: 'https://securegw.paytm.in',
        apiKey: this.configService.get<string>('PAYTM_MERCHANT_KEY') || 'demo_key',
        isActive: true
      },
      {
        name: 'PhonePe',
        code: 'phonepe',
        supportedMethods: ['upi', 'wallet'],
        baseUrl: 'https://api.phonepe.com/apis/hermes',
        apiKey: this.configService.get<string>('PHONEPE_MERCHANT_ID') || 'demo_key',
        isActive: true
      }
    ];
  }

  private computePaymentAmount(auctionId: string): number {
    // Server-side computation - never trust client amount
    // For now, mock - in real app, fetch from DB
    return 10000; // ₹100
  }

  private initializeRazorpay() {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    // For development/testing, allow dummy credentials
    if (!keyId || !keySecret || keyId === 'dummy_key_id' || keySecret === 'dummy_key_secret') {
      this.logger.warn('Using mock Razorpay configuration for development/testing');
      this.razorpay = {
        orders: {
          create: async (data: any) => ({
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
          fetch: async (paymentId: string) => ({
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
          refund: async (paymentId: string, refundData: any) => ({
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
    } else {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    }
  }

  async createOrder(createOrderDto: any): Promise<any> {
    try {
      const { amount, currency = 'INR', receipt, notes } = createOrderDto;

      // Compute amount server-side - never trust client amount
      const computedAmount = this.computePaymentAmount(notes?.auctionId || 'default');
      if (computedAmount < 1) {
        throw new BadRequestException('Invalid payment amount');
      }

      // Convert amount to paisa (multiply by 100)
      const amountInPaisa = Math.round(computedAmount * 100);

      const orderOptions = {
        amount: amountInPaisa,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
        payment_capture: 1, // Auto capture payment
      };

      this.logger.log(`Creating Razorpay order: ${JSON.stringify(orderOptions)}`);

      const order = await this.razorpay.orders.create(orderOptions);

      this.logger.log(`Razorpay order created: ${order.id}`);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        key: this.configService.get<string>('RAZORPAY_KEY_ID'),
        receipt: order.receipt,
        notes: order.notes,
        createdAt: order.created_at,
      };
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  async verifyPayment(verifyPaymentDto: any): Promise<boolean> {
    try {
      const { paymentId, orderId, signature } = verifyPaymentDto;

      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      if (!secret) {
        throw new Error('Razorpay secret not configured');
      }

      // Create expected signature
      const expectedSignature = createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );

      if (isValid) {
        this.logger.log(`Payment verification successful for order: ${orderId}, payment: ${paymentId}`);
      } else {
        this.logger.warn(`Payment verification failed for order: ${orderId}, payment: ${paymentId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Payment verification error: ${error.message}`, error.stack);
      return false;
    }
  }

  async processAuctionPayment(auctionPaymentDto: AuctionPaymentDto): Promise<any> {
    try {
      const { auctionId, amount, paymentId, orderId, userId, sellerId } = auctionPaymentDto;

      // Verify payment first
      const isVerified = await this.verifyPayment({
        paymentId,
        orderId,
        signature: '', // Signature would be provided by frontend
      });

      if (!isVerified) {
        throw new BadRequestException('Payment verification failed');
      }

      // Fetch payment details from Razorpay to confirm
      const payment = await this.razorpay.payments.fetch(paymentId);

      if (payment.status !== 'captured') {
        throw new BadRequestException('Payment not captured');
      }

      // Here you would:
      // 1. Update auction winner status
      // 2. Transfer funds to seller (minus platform fees)
      // 3. Update wallet balances
      // 4. Send notifications
      // 5. Create transaction records

      const platformFee = amount * 0.05; // 5% platform fee
      const sellerAmount = amount - platformFee;

      this.logger.log(`Auction payment processed: Auction ${auctionId}, Amount ₹${amount}, Seller gets ₹${sellerAmount}`);

      // Mock database operations (replace with actual DB calls)
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
    } catch (error) {
      this.logger.error(`Auction payment processing failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process auction payment');
    }
  }

  async processRefund(refundDto: any): Promise<any> {
    try {
      const { paymentId, amount, notes } = refundDto;

      // First, fetch the payment to get details
      const payment = await this.razorpay.payments.fetch(paymentId);

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Calculate refund amount (full payment if not specified)
      const refundAmount = amount ? Math.round(amount * 100) : payment.amount;

      if (refundAmount > payment.amount) {
        throw new BadRequestException('Refund amount cannot exceed payment amount');
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
        amount: refund.amount / 100, // Convert back to rupees
        status: refund.status,
        paymentId: refund.payment_id,
        createdAt: refund.created_at,
      };
    } catch (error) {
      this.logger.error(`Refund processing failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  async getPayment(paymentId: string): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Failed to fetch payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch payment details');
    }
  }

  async getOrder(orderId: string): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Failed to fetch order: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch order details');
    }
  }

  async createCustomer(customerData: {
    name: string;
    email: string;
    contact: string;
    notes?: Record<string, string>;
  }): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async handleWebhook(webhookData: any, signature: string): Promise<boolean> {
    try {
      const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
      if (!secret) {
        throw new Error('Webhook secret not configured');
      }

      // Verify webhook signature with timing-safe comparison
      const expectedSignature = createHmac('sha256', secret)
        .update(JSON.stringify(webhookData))
        .digest('hex');

      const isValid = timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );

      if (isValid) {
        this.logger.log(`Webhook verified and processing: ${webhookData.event}`);

        // Additional validations
        const { event, data } = webhookData;

        // Validate orderId exists and amount/currency match DB
        if (event === 'payment.captured' || event === 'payment.failed') {
          const payment = data.payment;
          if (!payment.order_id) {
            this.logger.warn(`Webhook missing order_id: ${event}`);
            return false;
          }
          // In production: Validate amount and currency against DB record
          // if (payment.amount !== dbAmount || payment.currency !== dbCurrency) {
          //   this.logger.warn(`Webhook amount/currency mismatch: ${event}`);
          //   return false;
          // }
        }

        // Process webhook event with idempotency
        await this.processWebhookEventIdempotent(webhookData);
      } else {
        this.logger.warn(`Invalid webhook signature for event: ${webhookData.event}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      return false;
    }
  }

  private async processWebhookEventIdempotent(webhookData: any): Promise<void> {
    const { event, data } = webhookData;

    try {
      // Extract razorpay_id based on event type
      let razorpayId: string;
      let eventType: string;

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

      // Check idempotency - has this event already been processed?
      const alreadyProcessed = await this.isEventAlreadyProcessed(razorpayId);
      if (alreadyProcessed) {
        this.logger.log(`Webhook event ${event} for ${razorpayId} already processed - skipping`);
        return; // Already processed, safe to ignore
      }

      // Process the event
      await this.processWebhookEvent(webhookData);

      // Mark as processed (idempotency record)
      await this.markEventAsProcessed(razorpayId, eventType, webhookData);

      this.logger.log(`Successfully processed webhook event: ${event} for ${razorpayId}`);

    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event}: ${error.message}`, error.stack);
      // Don't throw - we want to acknowledge the webhook even if processing fails
      // Razorpay will retry if we return non-200, but for idempotency we need to be careful
    }
  }

  private async isEventAlreadyProcessed(razorpayId: string): Promise<boolean> {
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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        this.logger.error(`Error checking webhook idempotency: ${error.message}`, error);
        // On database error, assume not processed to avoid blocking legitimate events
        return false;
      }

      const alreadyProcessed = !!data;
      if (alreadyProcessed) {
        this.logger.log(`Webhook event for razorpay_id ${razorpayId} already processed`);
      }

      return alreadyProcessed;

    } catch (error) {
      this.logger.error(`Error checking event processing status: ${error.message}`, error.stack);
      // On error, assume not processed to avoid blocking legitimate events
      return false;
    }
  }

  private async markEventAsProcessed(razorpayId: string, eventType: string, webhookData: any): Promise<void> {
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
        // Handle unique constraint violation (duplicate razorpay_id)
        if (error.code === '23505') { // PostgreSQL unique constraint violation
          this.logger.warn(`Duplicate webhook event detected for razorpay_id: ${razorpayId}`);
          return; // Already processed, this is expected
        }

        this.logger.error(`Error marking webhook event as processed: ${error.message}`, error);
        throw new Error(`Failed to mark webhook event as processed: ${error.message}`);
      }

      this.logger.log(`Successfully marked webhook event as processed: ${eventType} for ${razorpayId}`);

    } catch (error) {
      this.logger.error(`Error marking event as processed: ${error.message}`, error.stack);
      // If we can't mark as processed, we should throw to prevent duplicate processing
      throw error;
    }
  }

  private async processWebhookEvent(webhookData: any): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event}: ${error.message}`, error.stack);
      // Don't throw - we want to acknowledge the webhook even if processing fails
    }
  }

  async getAvailablePaymentMethods(amount?: number): Promise<PaymentMethod[]> {
    let methods = this.paymentMethods.filter(method => method.isActive !== false);

    if (amount) {
      methods = methods.filter(method =>
        amount >= method.limits.min && amount <= method.limits.max
      );
    }

    return methods;
  }

  getSupportedMethods(): string[] {
    const allMethods = new Set<string>();
    this.providers.forEach(provider => {
      if (provider.isActive) {
        provider.supportedMethods.forEach(method => allMethods.add(method));
      }
    });
    return Array.from(allMethods);
  }

  async createPaymentWithMethod(
    amount: number,
    method: string,
    orderId: string,
    customerDetails?: any
  ): Promise<any> {
    const paymentMethod = this.paymentMethods.find(m => m.code === method);
    if (!paymentMethod) {
      throw new BadRequestException('Payment method not supported');
    }

    // Find best provider for this method
    const provider = this.providers.find(p =>
      p.isActive && p.supportedMethods.includes(paymentMethod.type)
    );

    if (!provider) {
      throw new BadRequestException('No provider available for this payment method');
    }

    // For demo/development, return mock payment data
    if (provider.code === 'razorpay' && this.isMockMode()) {
      return this.createMockPayment(amount, method, orderId, paymentMethod);
    }

    // In production, integrate with actual payment providers
    switch (provider.code) {
      case 'razorpay':
        return this.createRazorpayPayment(amount, method, orderId, customerDetails);
      case 'paytm':
        return this.createPaytmPayment(amount, method, orderId, customerDetails);
      case 'phonepe':
        return this.createPhonePePayment(amount, method, orderId, customerDetails);
      default:
        throw new BadRequestException('Provider not implemented');
    }
  }

  private createMockPayment(amount: number, method: string, orderId: string, paymentMethod: PaymentMethod): any {
    const mockPaymentId = `QM${Date.now().toString().slice(-10)}`;

    const response: any = {
      success: true,
      paymentId: mockPaymentId,
      orderId,
      amount,
      method,
      status: 'pending',
      provider: 'mock'
    };

    // Add method-specific mock data
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

  private async createRazorpayPayment(amount: number, method: string, orderId: string, customerDetails?: any): Promise<any> {
    // Create Razorpay order and return payment details
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
      razorpayKey: this.configService.get<string>('RAZORPAY_KEY_ID'),
      orderData: order
    };
  }

  private async createPaytmPayment(amount: number, method: string, orderId: string, customerDetails?: any): Promise<any> {
    // Mock Paytm integration - in production, integrate with Paytm APIs
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

  private async createPhonePePayment(amount: number, method: string, orderId: string, customerDetails?: any): Promise<any> {
    // Mock PhonePe integration - in production, integrate with PhonePe APIs
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

  private isMockMode(): boolean {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    return !keyId || !keySecret || keyId === 'dummy_key_id' || keySecret === 'dummy_key_secret';
  }

  private async handlePaymentCaptured(payment: any): Promise<void> {
    try {
      const { id: paymentId, amount, order_id, notes } = payment;
      const amountInRupees = Number(amount) / 100;

      this.logger.log(`Processing payment capture: ${paymentId}, amount: ₹${amountInRupees}`);

      // Extract metadata from notes (set during order creation)
      const { user_id: userId, bid_id: bidId, type } = notes || {};

      if (type === 'wallet_topup' && userId) {
        // Handle wallet topup
        await this.processWalletTopupFromWebhook(userId, amountInRupees, paymentId);
      } else if (bidId && userId) {
        // Handle auction payment
        await this.processAuctionPaymentFromWebhook(bidId, userId, amountInRupees, paymentId);
      } else {
        this.logger.warn(`Unknown payment type or missing metadata for payment: ${paymentId}`);
      }

      // Send success notification
      // if (userId) {
      //   await this.sendPaymentSuccessNotification(userId, amountInRupees, paymentId);
      // }

    } catch (error) {
      this.logger.error(`Failed to handle payment capture ${payment.id}: ${error.message}`, error.stack);
    }
  }

  private async handlePaymentFailed(payment: any): Promise<void> {
    try {
      const { id: paymentId, amount, order_id, error_code, error_description, notes } = payment;
      const amountInRupees = Number(amount) / 100;

      this.logger.log(`Processing payment failure: ${paymentId}, amount: ₹${amountInRupees}, error: ${error_description}`);

      // Extract metadata from notes
      const { user_id: userId, bid_id: bidId } = notes || {};

      // Mark bid as failed if applicable
      if (bidId) {
        await this.markBidAsFailed(bidId, error_description);
      }

      // Send failure notification
      // if (userId) {
      //   await this.sendPaymentFailureNotification(userId, amountInRupees, error_description);
      // }

    } catch (error) {
      this.logger.error(`Failed to handle payment failure ${payment.id}: ${error.message}`, error.stack);
    }
  }

  private async handleRefundCreated(refund: any): Promise<void> {
    try {
      const { id: refundId, payment_id: paymentId, amount, status, notes } = refund;
      const amountInRupees = Number(amount) / 100;

      this.logger.log(`Processing refund creation: ${refundId}, amount: ₹${amountInRupees}`);

      // Extract metadata from notes
      const { user_id: userId, reason } = notes || {};

      if (userId) {
        // Credit wallet
        await this.processRefundToWallet(userId, amountInRupees, refundId, reason);

        // Send refund notification
        // await this.sendRefundNotification(userId, amountInRupees, refundId);
      }

    } catch (error) {
      this.logger.error(`Failed to handle refund creation ${refund.id}: ${error.message}`, error.stack);
    }
  }

  private async processWalletTopupFromWebhook(userId: string, amount: number, paymentId: string): Promise<void> {
    // Implementation would update wallet balance in database
    this.logger.log(`Wallet topup processed for user ${userId}: ₹${amount} (payment: ${paymentId})`);

    // TODO: Implement actual database operations
    // await this.walletService.addFunds(userId, amount, paymentId);
  }

  private async processAuctionPaymentFromWebhook(bidId: string, userId: string, amount: number, paymentId: string): Promise<void> {
    // Implementation would mark auction as won and process payment
    this.logger.log(`Auction payment processed for bid ${bidId}: ₹${amount} (payment: ${paymentId})`);

    // TODO: Implement actual database operations
    // await this.auctionService.markBidAsWon(bidId);
    // await this.walletService.processAuctionPayment(bidId, userId, amount);
  }

  private async markBidAsFailed(bidId: string, reason: string): Promise<void> {
    this.logger.log(`Marking bid ${bidId} as failed: ${reason}`);

    // TODO: Implement actual database operations
    // await this.auctionService.markBidAsFailed(bidId, reason);
  }

  private async processRefundToWallet(userId: string, amount: number, refundId: string, reason?: string): Promise<void> {
    this.logger.log(`Processing refund to wallet for user ${userId}: ₹${amount} (refund: ${refundId})`);

    // TODO: Implement actual database operations
    // await this.walletService.addRefund(userId, amount, refundId, reason);
  }

  // private async sendPaymentSuccessNotification(userId: string, amount: number, paymentId: string): Promise<void> {
  //   this.logger.log(`Sending payment success notification to user ${userId}`);

  //   // TODO: Implement notification service
  //   // await this.notificationService.sendPaymentSuccess(userId, amount, paymentId);
  // }

  // private async sendPaymentFailureNotification(userId: string, amount: number, error: string): Promise<void> {
  //   this.logger.log(`Sending payment failure notification to user ${userId}`);

  //   // TODO: Implement notification service
  //   // await this.notificationService.sendPaymentFailure(userId, amount, error);
  // }

  // private async sendRefundNotification(userId: string, amount: number, refundId: string): Promise<void> {
  //   this.logger.log(`Sending refund notification to user ${userId}`);

  //   // TODO: Implement notification service
  //   // await this.notificationService.sendRefundProcessed(userId, amount, refundId);
  // }
}
