// src/payments/indian-payment.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: 'upi' | 'netbanking' | 'wallet' | 'card';
  provider?: 'razorpay' | 'payu' | 'cashfree' | 'stripe';
}

interface UPIPaymentRequest extends PaymentRequest {
  upiId?: string;
  upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'amazonpay' | 'bhim';
}

interface NetBankingRequest extends PaymentRequest {
  bankCode: string;
}

interface WalletRequest extends PaymentRequest {
  walletCode: 'paytm' | 'mobikwik' | ' OlaMoney' | 'jiomoney' | 'amazonpay';
}

@Injectable()
export class IndianPaymentService {
  private readonly logger = new Logger(IndianPaymentService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  // Razorpay Integration (Primary provider)
  private razorpayConfig = {
    keyId: this.configService.get('RAZORPAY_KEY_ID'),
    keySecret: this.configService.get('RAZORPAY_KEY_SECRET'),
    webhookSecret: this.configService.get('RAZORPAY_WEBHOOK_SECRET'),
  };

  // PayU Integration (Secondary provider)
  private payuConfig = {
    key: this.configService.get('PAYU_KEY'),
    salt: this.configService.get('PAYU_SALT'),
    webhookSalt: this.configService.get('PAYU_WEBHOOK_SALT'),
  };

  // Cashfree Integration (Secondary provider)
  private cashfreeConfig = {
    appId: this.configService.get('CASHFREE_APP_ID'),
    secretKey: this.configService.get('CASHFREE_SECRET_KEY'),
  };

  /**
   * Create UPI Payment Order
   */
  async createUPIPayment(request: UPIPaymentRequest) {
    try {
      const orderData = {
        amount: request.amount * 100, // Razorpay expects amount in paisa
        currency: request.currency,
        receipt: request.orderId,
        notes: {
          customerId: request.customerId,
          paymentMethod: 'upi',
          upiId: request.upiId || '',
          upiApp: request.upiApp || '',
        },
      };

      // Create order with Razorpay
      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        orderData,
        {
          auth: {
            username: this.razorpayConfig.keyId,
            password: this.razorpayConfig.keySecret,
          },
        }
      );

      // Store payment record
      const payment = await this.prisma.payment.create({
        data: {
          id: response.data.id,
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          paymentMethod: request.paymentMethod,
          provider: request.provider || 'razorpay',
          status: 'created',
          customerId: request.customerId,
          metadata: {
            upiId: request.upiId,
            upiApp: request.upiApp,
            razorpayOrderId: response.data.id,
          },
        },
      });

      this.logger.log(`UPI Payment order created: ${response.data.id}`);

      return {
        success: true,
        paymentId: payment.id,
        razorpayOrderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        upiApps: this.getAvailableUPIApps(),
      };
    } catch (error) {
      this.logger.error('UPI Payment creation failed:', error);
      throw new Error('Failed to create UPI payment');
    }
  }

  /**
   * Create Net Banking Payment
   */
  async createNetBankingPayment(request: NetBankingRequest) {
    try {
      const banks = this.getAvailableBanks();
      if (!banks.find(bank => bank.code === request.bankCode)) {
        throw new Error('Invalid bank code');
      }

      const orderData = {
        amount: request.amount * 100,
        currency: request.currency,
        receipt: request.orderId,
        method: 'netbanking',
        bank: request.bankCode,
        notes: {
          customerId: request.customerId,
          paymentMethod: 'netbanking',
          bankCode: request.bankCode,
        },
      };

      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        orderData,
        {
          auth: {
            username: this.razorpayConfig.keyId,
            password: this.razorpayConfig.keySecret,
          },
        }
      );

      const payment = await this.prisma.payment.create({
        data: {
          id: response.data.id,
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          paymentMethod: request.paymentMethod,
          provider: 'razorpay',
          status: 'created',
          customerId: request.customerId,
          metadata: {
            bankCode: request.bankCode,
            bankName: banks.find(b => b.code === request.bankCode)?.name,
          },
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        razorpayOrderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        bankDetails: banks.find(b => b.code === request.bankCode),
      };
    } catch (error) {
      this.logger.error('Net Banking payment creation failed:', error);
      throw new Error('Failed to create net banking payment');
    }
  }

  /**
   * Create Wallet Payment
   */
  async createWalletPayment(request: WalletRequest) {
    try {
      const wallets = this.getAvailableWallets();
      if (!wallets.find(wallet => wallet.code === request.walletCode)) {
        throw new Error('Invalid wallet code');
      }

      const orderData = {
        amount: request.amount * 100,
        currency: request.currency,
        receipt: request.orderId,
        method: 'wallet',
        wallet: request.walletCode,
        notes: {
          customerId: request.customerId,
          paymentMethod: 'wallet',
          walletCode: request.walletCode,
        },
      };

      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        orderData,
        {
          auth: {
            username: this.razorpayConfig.keyId,
            password: this.razorpayConfig.keySecret,
          },
        }
      );

      const payment = await this.prisma.payment.create({
        data: {
          id: response.data.id,
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          paymentMethod: request.paymentMethod,
          provider: 'razorpay',
          status: 'created',
          customerId: request.customerId,
          metadata: {
            walletCode: request.walletCode,
            walletName: wallets.find(w => w.code === request.walletCode)?.name,
          },
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        razorpayOrderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        walletDetails: wallets.find(w => w.code === request.walletCode),
      };
    } catch (error) {
      this.logger.error('Wallet payment creation failed:', error);
      throw new Error('Failed to create wallet payment');
    }
  }

  /**
   * Verify Payment Status
   */
  async verifyPayment(paymentId: string, razorpayPaymentId: string, razorpaySignature: string) {
    try {
      // Verify signature
      const sign = crypto
        .createHmac('sha256', this.razorpayConfig.keySecret)
        .update(`${paymentId}|${razorpayPaymentId}`)
        .digest('hex');

      if (sign !== razorpaySignature) {
        throw new Error('Payment signature verification failed');
      }

      // Get payment details from Razorpay
      const paymentDetails = await axios.get(
        `https://api.razorpay.com/v1/payments/${razorpayPaymentId}`,
        {
          auth: {
            username: this.razorpayConfig.keyId,
            password: this.razorpayConfig.keySecret,
          },
        }
      );

      // Update payment status in database
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: paymentDetails.data.status === 'captured' ? 'completed' : paymentDetails.data.status,
          transactionId: razorpayPaymentId,
          metadata: {
            ...paymentDetails.data,
            verified: true,
            verifiedAt: new Date(),
          },
        },
      });

      // Update related auction/order status
      if (updatedPayment.status === 'completed') {
        await this.updateOrderStatus(updatedPayment.orderId, 'paid');
      }

      return {
        success: true,
        payment: updatedPayment,
        razorpayDetails: paymentDetails.data,
      };
    } catch (error) {
      this.logger.error('Payment verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Handle Razorpay Webhook
   */
  async handleRazorpayWebhook(webhookBody: any, signature: string) {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayConfig.webhookSecret)
        .update(JSON.stringify(webhookBody))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Webhook signature verification failed');
      }

      const { event, payment } = webhookBody;

      if (event === 'payment.captured') {
        await this.prisma.payment.update({
          where: { id: payment.entity.id },
          data: {
            status: 'completed',
            metadata: {
              webhookReceived: true,
              webhookEvent: event,
              capturedAt: new Date(),
            },
          },
        });

        // Update order status
        const paymentRecord = await this.prisma.payment.findUnique({
          where: { id: payment.entity.id },
        });

        if (paymentRecord) {
          await this.updateOrderStatus(paymentRecord.orderId, 'paid');
        }
      }

      return { success: true, event };
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      throw new Error('Webhook processing failed');
    }
  }

  /**
   * Refund Payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || payment.status !== 'completed') {
        throw new Error('Payment not found or not completed');
      }

      const refundData = {
        payment_id: payment.transactionId,
        amount: amount ? amount * 100 : payment.amount * 100,
        notes: {
          reason: reason || 'customer_request',
        },
      };

      const response = await axios.post(
        'https://api.razorpay.com/v1/refunds',
        refundData,
        {
          auth: {
            username: this.razorpayConfig.keyId,
            password: this.razorpayConfig.keySecret,
          },
        }
      );

      // Create refund record
      await this.prisma.refund.create({
        data: {
          id: response.data.id,
          paymentId: paymentId,
          amount: response.data.amount / 100,
          reason: reason || 'customer_request',
          status: response.data.status,
          metadata: response.data,
        },
      });

      return {
        success: true,
        refundId: response.data.id,
        amount: response.data.amount / 100,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.error('Refund processing failed:', error);
      throw new Error('Refund processing failed');
    }
  }

  // Helper methods
  private async updateOrderStatus(orderId: string, status: string) {
    // Update auction bid status or escrow status
    // This would depend on your order/auction schema
    this.logger.log(`Order ${orderId} status updated to ${status}`);
  }

  private getAvailableUPIApps() {
    return [
      { code: 'gpay', name: 'Google Pay', logo: '/images/upi/gpay.png' },
      { code: 'phonepe', name: 'PhonePe', logo: '/images/upi/phonepe.png' },
      { code: 'paytm', name: 'Paytm UPI', logo: '/images/upi/paytm.png' },
      { code: 'amazonpay', name: 'Amazon Pay', logo: '/images/upi/amazonpay.png' },
      { code: 'bhim', name: 'BHIM UPI', logo: '/images/upi/bhim.png' },
    ];
  }

  private getAvailableBanks() {
    return [
      { code: 'HDFC', name: 'HDFC Bank', logo: '/images/banks/hdfc.png' },
      { code: 'ICICI', name: 'ICICI Bank', logo: '/images/banks/icici.png' },
      { code: 'SBI', name: 'State Bank of India', logo: '/images/banks/sbi.png' },
      { code: 'AXIS', name: 'Axis Bank', logo: '/images/banks/axis.png' },
      { code: 'KOTAK', name: 'Kotak Mahindra Bank', logo: '/images/banks/kotak.png' },
      { code: 'PNB', name: 'Punjab National Bank', logo: '/images/banks/pnb.png' },
      { code: 'BOB', name: 'Bank of Baroda', logo: '/images/banks/bob.png' },
      { code: 'CANARA', name: 'Canara Bank', logo: '/images/banks/canara.png' },
    ];
  }

  private getAvailableWallets() {
    return [
      { code: 'paytm', name: 'Paytm', logo: '/images/wallets/paytm.png' },
      { code: 'mobikwik', name: 'MobiKwik', logo: '/images/wallets/mobikwik.png' },
      { code: ' OlaMoney', name: ' Ola Money', logo: '/images/wallets/ola.png' },
      { code: 'jiomoney', name: 'JioMoney', logo: '/images/wallets/jio.png' },
      { code: 'amazonpay', name: 'Amazon Pay', logo: '/images/wallets/amazon.png' },
    ];
  }
}
