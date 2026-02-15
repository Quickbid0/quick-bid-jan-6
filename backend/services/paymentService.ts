import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface PaymentTokenizationRequest {
  userId: string;
  paymentMethod: 'card' | 'bank_account' | 'wallet';
  paymentData: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  amount: number;
  currency: string;
  description?: string;
}

interface TokenizedPayment {
  token: string;
  maskedData: string;
  paymentMethod: string;
  expiryDate?: string;
  tokenExpiry: Date;
  isActive: boolean;
}

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Tokenize payment data for PCI DSS compliance
   */
  async tokenizePayment(request: PaymentTokenizationRequest): Promise<TokenizedPayment> {
    try {
      // Validate input
      this.validatePaymentData(request);

      // Generate unique token
      const token = this.generatePaymentToken();

      // Mask sensitive data for storage/logs
      const maskedData = this.maskPaymentData(request);

      // Set token expiry (typically 1-2 years)
      const tokenExpiry = new Date();
      tokenExpiry.setFullYear(tokenExpiry.getFullYear() + 1);

      // Store tokenized payment (without sensitive data)
      const tokenizedPayment: TokenizedPayment = {
        token,
        maskedData,
        paymentMethod: request.paymentMethod,
        expiryDate: request.paymentData.expiryYear ?
                   `${request.paymentData.expiryMonth}/${request.paymentData.expiryYear}` : undefined,
        tokenExpiry,
        isActive: true
      };

      // In production, store mapping between token and actual payment data
      // in a secure, encrypted vault (e.g., AWS Payment Cryptography, Stripe, etc.)
      await this.storeTokenizedPayment(request.userId, tokenizedPayment);

      // Log tokenization for compliance
      await this.logPaymentAudit({
        userId: request.userId,
        action: 'PAYMENT_TOKENIZED',
        paymentMethod: request.paymentMethod,
        amount: request.amount,
        token: token,
        maskedData: maskedData,
        riskLevel: 'low'
      });

      return tokenizedPayment;
    } catch (error) {
      console.error('Payment tokenization failed:', error);
      throw new InternalServerErrorException('Payment tokenization failed');
    }
  }

  /**
   * Process payment using token
   */
  async processPaymentWithToken(
    userId: string,
    token: string,
    amount: number,
    currency: string,
    description?: string
  ): Promise<{ success: boolean; transactionId: string; details: any }> {
    try {
      // Retrieve tokenized payment
      const tokenizedPayment = await this.getTokenizedPayment(userId, token);

      if (!tokenizedPayment || !tokenizedPayment.isActive) {
        throw new BadRequestException('Invalid or expired payment token');
      }

      // In production, use the token to retrieve actual payment data from secure vault
      // and process payment through payment gateway (Razorpay, Stripe, etc.)

      // Simulate payment processing
      const transactionId = this.generateTransactionId();
      const success = Math.random() > 0.05; // 95% success rate for simulation

      const paymentDetails = {
        transactionId,
        amount,
        currency,
        description,
        paymentMethod: tokenizedPayment.paymentMethod,
        maskedData: tokenizedPayment.maskedData,
        processedAt: new Date(),
        status: success ? 'completed' : 'failed'
      };

      // Store transaction record
      await this.storePaymentTransaction(userId, paymentDetails);

      // Log payment processing
      await this.logPaymentAudit({
        userId,
        action: success ? 'PAYMENT_COMPLETED' : 'PAYMENT_FAILED',
        paymentMethod: tokenizedPayment.paymentMethod,
        amount,
        token,
        transactionId,
        riskLevel: success ? 'low' : 'medium'
      });

      return {
        success,
        transactionId,
        details: paymentDetails
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  /**
   * Deactivate payment token (for security)
   */
  async deactivatePaymentToken(userId: string, token: string): Promise<void> {
    try {
      // In production, mark token as inactive in secure vault
      await this.updateTokenizedPayment(userId, token, { isActive: false });

      await this.logPaymentAudit({
        userId,
        action: 'PAYMENT_TOKEN_DEACTIVATED',
        token,
        riskLevel: 'medium'
      });
    } catch (error) {
      console.error('Token deactivation failed:', error);
      throw new InternalServerErrorException('Failed to deactivate payment token');
    }
  }

  /**
   * Get user's active payment tokens
   */
  async getUserPaymentTokens(userId: string): Promise<TokenizedPayment[]> {
    try {
      // In production, retrieve from secure vault
      // For now, return mock data
      return [
        {
          token: 'tok_mock123',
          maskedData: '**** **** **** 1234',
          paymentMethod: 'card',
          expiryDate: '12/25',
          tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true
        }
      ];
    } catch (error) {
      console.error('Failed to retrieve payment tokens:', error);
      return [];
    }
  }

  /**
   * Validate payment data before tokenization
   */
  private validatePaymentData(request: PaymentTokenizationRequest): void {
    const { paymentMethod, paymentData } = request;

    switch (paymentMethod) {
      case 'card':
        if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
          throw new BadRequestException('Card details incomplete');
        }
        // Basic card number validation
        if (!this.isValidCardNumber(paymentData.cardNumber)) {
          throw new BadRequestException('Invalid card number');
        }
        break;

      case 'bank_account':
        if (!paymentData.accountNumber || !paymentData.ifscCode) {
          throw new BadRequestException('Bank account details incomplete');
        }
        break;

      case 'wallet':
        if (!paymentData.upiId) {
          throw new BadRequestException('UPI ID required for wallet payment');
        }
        break;

      default:
        throw new BadRequestException('Unsupported payment method');
    }
  }

  /**
   * Generate unique payment token
   */
  private generatePaymentToken(): string {
    return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mask sensitive payment data
   */
  private maskPaymentData(request: PaymentTokenizationRequest): string {
    const { paymentMethod, paymentData } = request;

    switch (paymentMethod) {
      case 'card':
        return `**** **** **** ${paymentData.cardNumber?.slice(-4)}`;

      case 'bank_account':
        return `****${paymentData.accountNumber?.slice(-4)}`;

      case 'wallet':
        return paymentData.upiId?.replace(/(.{2}).*(@.*)/, '$1****$2') || '****';

      default:
        return '****';
    }
  }

  /**
   * Basic card number validation (Luhn algorithm)
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Store tokenized payment (mock implementation)
   */
  private async storeTokenizedPayment(userId: string, payment: TokenizedPayment): Promise<void> {
    // In production, store in encrypted secure vault
    console.log('Tokenized payment stored:', { userId, token: payment.token });
  }

  /**
   * Retrieve tokenized payment (mock implementation)
   */
  private async getTokenizedPayment(userId: string, token: string): Promise<TokenizedPayment | null> {
    // In production, retrieve from secure vault
    // Mock implementation
    if (token.startsWith('tok_')) {
      return {
        token,
        maskedData: '**** **** **** 1234',
        paymentMethod: 'card',
        expiryDate: '12/25',
        tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true
      };
    }
    return null;
  }

  /**
   * Update tokenized payment (mock implementation)
   */
  private async updateTokenizedPayment(userId: string, token: string, updates: Partial<TokenizedPayment>): Promise<void> {
    // In production, update in secure vault
    console.log('Tokenized payment updated:', { userId, token, updates });
  }

  /**
   * Store payment transaction
   */
  private async storePaymentTransaction(userId: string, transaction: any): Promise<void> {
    // In production, store in payments table
    console.log('Payment transaction stored:', { userId, transaction });
  }

  /**
   * Log payment audit event
   */
  private async logPaymentAudit(params: {
    userId: string;
    action: string;
    paymentMethod?: string;
    amount?: number;
    token?: string;
    transactionId?: string;
    maskedData?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      // In production, log to audit table
      console.log('Payment audit logged:', params);
    } catch (error) {
      console.error('Payment audit logging failed:', error);
      // Don't throw - audit failure shouldn't break payment flow
    }
  }

  /**
   * Handle payment webhook (for payment gateway callbacks)
   */
  async handlePaymentWebhook(webhookData: any): Promise<void> {
    try {
      // Process webhook from payment gateway
      // Update transaction status, handle failures, etc.

      console.log('Payment webhook processed:', webhookData);

      // Log webhook receipt
      await this.logPaymentAudit({
        userId: webhookData.userId || 'unknown',
        action: 'PAYMENT_WEBHOOK_RECEIVED',
        transactionId: webhookData.transactionId,
        riskLevel: 'low'
      });

    } catch (error) {
      console.error('Payment webhook processing failed:', error);
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }
}
