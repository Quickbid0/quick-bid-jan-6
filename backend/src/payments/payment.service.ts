import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import * as crypto from 'crypto';

// QuickMela Payment Service - Enterprise-grade payment processing
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly razorpayKeyId: string;
  private readonly razorpayKeySecret: string;
  private readonly razorpayWebhookSecret: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private walletService: WalletService
  ) {
    this.razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
    this.razorpayWebhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';

    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      this.logger.warn('Razorpay credentials not configured - payment features will not work');
    }
  }

  async createWalletTopupOrder(userId: string, amount: number, currency: string = 'INR') {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true
        }
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      const order = await this.prisma.transaction.create({
        data: {
          userId,
          walletId: userId,
          type: 'CREDIT',
          amount,
          description: `Wallet top-up order ${orderId}`,
          referenceId: orderId,
          referenceType: 'razorpay_order',
          status: 'PENDING',
          paymentMethod: 'RAZORPAY'
        }
      });

      const razorpayOrder = {
        id: orderId,
        amount: amount * 100,
        currency,
        receipt: orderId,
        status: 'created'
      };

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          resource: 'payment_order',
          resourceId: order.id,
          metadata: {
            razorpayOrderId: orderId,
            amount,
            currency
          }
        }
      });

      this.logger.log(`Wallet top-up order created: ₹${amount} for user ${user.email}`);

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: this.razorpayKeyId,
        user: {
          name: user.name,
          email: user.email,
          contact: user.phoneNumber
        }
      };
    } catch (error) {
      this.logger.error(`Create wallet top-up order error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
  }) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = paymentData;

      const sign = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (sign !== razorpay_signature) {
        throw new BadRequestException('Payment signature verification failed');
      }

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          userId,
          referenceId: razorpay_order_id,
          referenceType: 'razorpay_order',
          status: 'PENDING'
        }
      });

      if (!transaction) {
        throw new BadRequestException('Payment order not found');
      }

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        }
      });

      await this.walletService.addMoney(userId, transaction.amount, 'RAZORPAY', razorpay_order_id);

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          resource: 'payment',
          resourceId: transaction.id,
          oldValues: { status: 'PENDING' },
          newValues: {
            status: 'COMPLETED',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
          }
        }
      });

      this.logger.log(`Payment verified and processed: ₹${transaction.amount} credited to user ${userId}`);

      return {
        success: true,
        transactionId: transaction.id,
        amount: transaction.amount,
        message: `₹${transaction.amount} successfully added to wallet`
      };
    } catch (error) {
      this.logger.error(`Verify payment error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Payment verification failed');
    }
  }

  async processSubscriptionPayment(userId: string, plan: 'SILVER' | 'GOLD' | 'ENTERPRISE') {
    try {
      const planPricing = {
        'SILVER': 499,
        'GOLD': 1999,
        'ENTERPRISE': 9999
      };

      const amount = planPricing[plan];
      if (!amount) {
        throw new BadRequestException('Invalid subscription plan');
      }

      const wallet = await this.prisma.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      const availableBalance = wallet.balance - wallet.blockedBalance;
      if (availableBalance < amount) {
        throw new BadRequestException('Insufficient wallet balance for subscription');
      }

      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance - amount,
          totalDebits: wallet.totalDebits + amount
        }
      });

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const bidLimits = {
        'SILVER': 10,
        'GOLD': 50,
        'ENTERPRISE': 1000
      };

      const subscription = await this.prisma.subscription.upsert({
        where: { userId },
        update: {
          plan,
          status: 'ACTIVE',
          bidLimit: bidLimits[plan],
          price: amount,
          startDate,
          endDate,
          bidsUsed: 0,
          updatedAt: new Date()
        },
        create: {
          userId,
          plan,
          status: 'ACTIVE',
          bidLimit: bidLimits[plan],
          price: amount,
          startDate,
          endDate,
          bidsUsed: 0
        }
      });

      await this.prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'DEBIT',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - amount,
          description: `${plan} subscription purchase`,
          referenceId: subscription.id,
          referenceType: 'subscription',
          status: 'COMPLETED'
        }
      });

      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          resource: 'subscription',
          resourceId: subscription.id,
          metadata: {
            plan,
            amount,
            bidLimit: bidLimits[plan]
          }
        }
      });

      this.logger.log(`Subscription purchased: ${plan} for user ${userId}, amount: ₹${amount}`);

      return {
        success: true,
        subscriptionId: subscription.id,
        plan,
        amount,
        bidLimit: bidLimits[plan],
        validUntil: endDate,
        message: `${plan} subscription activated successfully`
      };
    } catch (error) {
      this.logger.error(`Process subscription payment error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Subscription payment failed');
    }
  }

  async processAuctionSettlement(auctionId: string) {
    try {
      const auction = await this.prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            where: { status: 'ACTIVE' },
            orderBy: { amount: 'desc' },
            include: {
              bidder: {
                include: {
                  wallet: true
                }
              }
            }
          },
          winner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!auction) {
        throw new BadRequestException('Auction not found');
      }

      if (auction.status !== 'COMPLETED') {
        throw new BadRequestException('Auction is not completed');
      }

      if (!auction.winnerId || !auction.winningBidId) {
        throw new BadRequestException('Auction has no winner');
      }

      const winningBid = auction.bids.find(bid => bid.id === auction.winningBidId);
      if (!winningBid) {
        throw new BadRequestException('Winning bid not found');
      }

      const finalPrice = winningBid.amount;
      const commission = 0;
      const sellerPayout = finalPrice - commission;

      const winnerPaymentResult = await this.walletService.confirmBidPayment(
        auction.winnerId,
        auctionId,
        auction.winningBidId,
        finalPrice
      );

      const sellerPayoutResult = await this.walletService.paySeller(
        auction.product.seller.id,
        auctionId,
        sellerPayout
      );

      await this.prisma.auction.update({
        where: { id: auctionId },
        data: {
          // Additional settlement metadata could be stored here
        }
      });

      await this.prisma.auditLog.create({
        data: {
          userId: auction.winnerId,
          action: 'CREATE',
          resource: 'auction_settlement',
          resourceId: auctionId,
          metadata: {
            finalPrice,
            commission,
            sellerPayout,
            sellerId: auction.product.seller.id
          }
        }
      });

      this.logger.log(`Auction settlement completed: ${auctionId}, winner: ${auction.winnerId}, seller: ${auction.product.seller.id}, amount: ₹${finalPrice}`);

      return {
        success: true,
        auctionId,
        winnerId: auction.winnerId,
        sellerId: auction.product.seller.id,
        finalPrice,
        commission,
        sellerPayout,
        winnerPayment: winnerPaymentResult,
        sellerPayment: sellerPayoutResult
      };
    } catch (error) {
      this.logger.error(`Process auction settlement error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Auction settlement failed');
    }
  }

  async processRefund(transactionId: string, refundAmount?: number, reason: string = 'Transaction cancelled') {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          wallet: true
        }
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      if (!transaction.isRefundable || transaction.refundedAt) {
        throw new BadRequestException('Transaction is not refundable or already refunded');
      }

      const refundAmt = refundAmount || transaction.amount;

      if (refundAmt > transaction.amount) {
        throw new BadRequestException('Refund amount cannot exceed transaction amount');
      }

      const refundResult = await this.walletService.addMoney(
        transaction.userId,
        refundAmt,
        'REFUND',
        transactionId
      );

      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          refundedAt: new Date(),
          refundAmount: refundAmt,
          description: `${transaction.description} - Refunded: ${reason}`
        }
      });

      await this.prisma.auditLog.create({
        data: {
          userId: transaction.userId,
          action: 'CREATE',
          resource: 'refund',
          resourceId: transactionId,
          metadata: {
            refundAmount: refundAmt,
            reason,
            originalAmount: transaction.amount
          }
        }
      });

      this.logger.log(`Refund processed: ₹${refundAmt} for transaction ${transactionId}, reason: ${reason}`);

      return {
        success: true,
        transactionId,
        refundAmount: refundAmt,
        reason,
        newBalance: refundResult.newBalance,
        message: `₹${refundAmt} refunded successfully`
      };
    } catch (error) {
      this.logger.error(`Process refund error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Refund processing failed');
    }
  }

  async handleWebhook(webhookData: any, signature: string) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayWebhookSecret)
        .update(JSON.stringify(webhookData))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const { event, payment } = webhookData;

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payment);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payment);
          break;
        case 'refund.processed':
          await this.handleRefundProcessed(payment);
          break;
        default:
          this.logger.log(`Unhandled webhook event: ${event}`);
      }

      return { success: true, event };
    } catch (error) {
      this.logger.error(`Webhook handling error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  async getPaymentStats() {
    try {
      const transactions = await this.prisma.transaction.findMany();

      const stats = {
        totalTransactions: transactions.length,
        totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        successfulPayments: transactions.filter(tx => tx.status === 'COMPLETED').length,
        failedPayments: transactions.filter(tx => tx.status === 'FAILED').length,
        refundedAmount: transactions
          .filter(tx => tx.refundedAt)
          .reduce((sum, tx) => sum + (tx.refundAmount || 0), 0),
        byType: {
          CREDIT: transactions.filter(tx => tx.type === 'CREDIT').length,
          DEBIT: transactions.filter(tx => tx.type === 'DEBIT').length,
          REFUND: transactions.filter(tx => tx.type === 'REFUND').length,
          COMMISSION: transactions.filter(tx => tx.type === 'COMMISSION').length
        }
      };

      return stats;
    } catch (error) {
      this.logger.error(`Get payment stats error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch payment statistics');
    }
  }

  private async handlePaymentCaptured(payment: any) {
    this.logger.log(`Payment captured: ${payment.id}, amount: ₹${payment.amount / 100}`);
  }

  private async handlePaymentFailed(payment: any) {
    this.logger.log(`Payment failed: ${payment.id}, reason: ${payment.error_description}`);
  }

  private async handleRefundProcessed(refund: any) {
    this.logger.log(`Refund processed: ${refund.id}, amount: ₹${refund.amount / 100}`);
  }
}
