// src/payments/indian-payment.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger
} from '@nestjs/common';
import { IndianPaymentService } from './indian-payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IndianPaymentController {
  private readonly logger = new Logger(IndianPaymentController.name);

  constructor(private readonly paymentService: IndianPaymentService) {}

  /**
   * Create UPI Payment Order
   */
  @Post('upi')
  async createUPIPayment(@Body() body: any) {
    try {
      const {
        amount,
        currency = 'INR',
        orderId,
        customerId,
        customerEmail,
        customerPhone,
        upiId,
        upiApp,
      } = body;

      if (!amount || !orderId || !customerId) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      const result = await this.paymentService.createUPIPayment({
        amount,
        currency,
        orderId,
        customerId,
        customerEmail,
        customerPhone,
        paymentMethod: 'upi',
        upiId,
        upiApp,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('UPI payment creation error:', error);
      throw new HttpException(
        error.message || 'Failed to create UPI payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create Net Banking Payment Order
   */
  @Post('netbanking')
  async createNetBankingPayment(@Body() body: any) {
    try {
      const {
        amount,
        currency = 'INR',
        orderId,
        customerId,
        customerEmail,
        customerPhone,
        bankCode,
      } = body;

      if (!amount || !orderId || !customerId || !bankCode) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      const result = await this.paymentService.createNetBankingPayment({
        amount,
        currency,
        orderId,
        customerId,
        customerEmail,
        customerPhone,
        paymentMethod: 'netbanking',
        bankCode,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Net banking payment creation error:', error);
      throw new HttpException(
        error.message || 'Failed to create net banking payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create Wallet Payment Order
   */
  @Post('wallet')
  async createWalletPayment(@Body() body: any) {
    try {
      const {
        amount,
        currency = 'INR',
        orderId,
        customerId,
        customerEmail,
        customerPhone,
        walletCode,
      } = body;

      if (!amount || !orderId || !customerId || !walletCode) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      const result = await this.paymentService.createWalletPayment({
        amount,
        currency,
        orderId,
        customerId,
        customerEmail,
        customerPhone,
        paymentMethod: 'wallet',
        walletCode,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Wallet payment creation error:', error);
      throw new HttpException(
        error.message || 'Failed to create wallet payment',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify Payment
   */
  @Post('verify')
  async verifyPayment(@Body() body: any) {
    try {
      const { paymentId, razorpayPaymentId, razorpaySignature } = body;

      if (!paymentId || !razorpayPaymentId || !razorpaySignature) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      const result = await this.paymentService.verifyPayment(
        paymentId,
        razorpayPaymentId,
        razorpaySignature
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Payment verification error:', error);
      throw new HttpException(
        error.message || 'Payment verification failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process Refund
   */
  @Post(':paymentId/refund')
  @Roles('admin', 'company')
  async refundPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { amount?: number; reason?: string }
  ) {
    try {
      const result = await this.paymentService.refundPayment(
        paymentId,
        body.amount,
        body.reason
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Refund processing error:', error);
      throw new HttpException(
        error.message || 'Refund processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Razorpay Webhook Handler
   */
  @Post('webhook/razorpay')
  async handleRazorpayWebhook(
    @Body() webhookBody: any,
    @Headers('x-razorpay-signature') signature: string
  ) {
    try {
      if (!signature) {
        throw new HttpException('Missing webhook signature', HttpStatus.BAD_REQUEST);
      }

      const result = await this.paymentService.handleRazorpayWebhook(
        webhookBody,
        signature
      );

      return {
        success: true,
        event: result.event,
      };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw new HttpException(
        error.message || 'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get Payment Methods
   */
  @Get('methods')
  async getPaymentMethods() {
    return {
      success: true,
      data: {
        upi: {
          available: true,
          apps: await this.getUPIMethods(),
        },
        netbanking: {
          available: true,
          banks: await this.getBankMethods(),
        },
        wallet: {
          available: true,
          wallets: await this.getWalletMethods(),
        },
        card: {
          available: true,
          providers: ['visa', 'mastercard', 'rupay', 'amex'],
        },
      },
    };
  }

  /**
   * Get Payment Status
   */
  @Get(':paymentId/status')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    try {
      // This would query the payment status from database
      // For now, return a placeholder
      return {
        success: true,
        data: {
          paymentId,
          status: 'pending', // This would be fetched from database
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Payment status check error:', error);
      throw new HttpException(
        'Failed to get payment status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper methods
  private async getUPIMethods() {
    return [
      {
        code: 'gpay',
        name: 'Google Pay',
        logo: '/images/payments/upi/gpay.png',
        description: 'Pay with Google Pay UPI',
      },
      {
        code: 'phonepe',
        name: 'PhonePe',
        logo: '/images/payments/upi/phonepe.png',
        description: 'Pay with PhonePe UPI',
      },
      {
        code: 'paytm',
        name: 'Paytm',
        logo: '/images/payments/upi/paytm.png',
        description: 'Pay with Paytm UPI',
      },
      {
        code: 'amazonpay',
        name: 'Amazon Pay',
        logo: '/images/payments/upi/amazonpay.png',
        description: 'Pay with Amazon Pay UPI',
      },
      {
        code: 'bhim',
        name: 'BHIM UPI',
        logo: '/images/payments/upi/bhim.png',
        description: 'Pay with BHIM UPI',
      },
    ];
  }

  private async getBankMethods() {
    return [
      {
        code: 'HDFC',
        name: 'HDFC Bank',
        logo: '/images/payments/banks/hdfc.png',
        popular: true,
      },
      {
        code: 'ICICI',
        name: 'ICICI Bank',
        logo: '/images/payments/banks/icici.png',
        popular: true,
      },
      {
        code: 'SBI',
        name: 'State Bank of India',
        logo: '/images/payments/banks/sbi.png',
        popular: true,
      },
      {
        code: 'AXIS',
        name: 'Axis Bank',
        logo: '/images/payments/banks/axis.png',
        popular: true,
      },
      {
        code: 'KOTAK',
        name: 'Kotak Mahindra Bank',
        logo: '/images/payments/banks/kotak.png',
        popular: false,
      },
      // Add more banks as needed
    ];
  }

  private async getWalletMethods() {
    return [
      {
        code: 'paytm',
        name: 'Paytm',
        logo: '/images/payments/wallets/paytm.png',
        description: 'Pay with Paytm Wallet',
      },
      {
        code: 'mobikwik',
        name: 'MobiKwik',
        logo: '/images/payments/wallets/mobikwik.png',
        description: 'Pay with MobiKwik Wallet',
      },
      {
        code: ' OlaMoney',
        name: ' Ola Money',
        logo: '/images/payments/wallets/ola.png',
        description: 'Pay with Ola Money Wallet',
      },
      {
        code: 'jiomoney',
        name: 'JioMoney',
        logo: '/images/payments/wallets/jio.png',
        description: 'Pay with JioMoney Wallet',
      },
      {
        code: 'amazonpay',
        name: 'Amazon Pay',
        logo: '/images/payments/wallets/amazon.png',
        description: 'Pay with Amazon Pay Wallet',
      },
    ];
  }
}
