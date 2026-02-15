"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const crypto = __importStar(require("crypto"));
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(configService, prisma, walletService) {
        this.configService = configService;
        this.prisma = prisma;
        this.walletService = walletService;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.razorpayKeyId = this.configService.get('RAZORPAY_KEY_ID') || '';
        this.razorpayKeySecret = this.configService.get('RAZORPAY_KEY_SECRET') || '';
        this.razorpayWebhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET') || '';
        if (!this.razorpayKeyId || !this.razorpayKeySecret) {
            this.logger.warn('Razorpay credentials not configured - payment features will not work');
        }
    }
    async createWalletTopupOrder(userId, amount, currency = 'INR') {
        try {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be greater than 0');
            }
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
                throw new common_1.BadRequestException('User not found');
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
        }
        catch (error) {
            this.logger.error(`Create wallet top-up order error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create payment order');
        }
    }
    async verifyPayment(paymentData) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = paymentData;
            const sign = crypto
                .createHmac('sha256', this.razorpayKeySecret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');
            if (sign !== razorpay_signature) {
                throw new common_1.BadRequestException('Payment signature verification failed');
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
                throw new common_1.BadRequestException('Payment order not found');
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
        }
        catch (error) {
            this.logger.error(`Verify payment error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Payment verification failed');
        }
    }
    async processSubscriptionPayment(userId, plan) {
        try {
            const planPricing = {
                'SILVER': 499,
                'GOLD': 1999,
                'ENTERPRISE': 9999
            };
            const amount = planPricing[plan];
            if (!amount) {
                throw new common_1.BadRequestException('Invalid subscription plan');
            }
            const wallet = await this.prisma.wallet.findUnique({
                where: { userId }
            });
            if (!wallet) {
                throw new common_1.BadRequestException('Wallet not found');
            }
            const availableBalance = wallet.balance - wallet.blockedBalance;
            if (availableBalance < amount) {
                throw new common_1.BadRequestException('Insufficient wallet balance for subscription');
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
        }
        catch (error) {
            this.logger.error(`Process subscription payment error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Subscription payment failed');
        }
    }
    async processAuctionSettlement(auctionId) {
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
                throw new common_1.BadRequestException('Auction not found');
            }
            if (auction.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Auction is not completed');
            }
            if (!auction.winnerId || !auction.winningBidId) {
                throw new common_1.BadRequestException('Auction has no winner');
            }
            const winningBid = auction.bids.find(bid => bid.id === auction.winningBidId);
            if (!winningBid) {
                throw new common_1.BadRequestException('Winning bid not found');
            }
            const finalPrice = winningBid.amount;
            const commission = 0;
            const sellerPayout = finalPrice - commission;
            const winnerPaymentResult = await this.walletService.confirmBidPayment(auction.winnerId, auctionId, auction.winningBidId, finalPrice);
            const sellerPayoutResult = await this.walletService.paySeller(auction.product.seller.id, auctionId, sellerPayout);
            await this.prisma.auction.update({
                where: { id: auctionId },
                data: {}
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
        }
        catch (error) {
            this.logger.error(`Process auction settlement error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Auction settlement failed');
        }
    }
    async processRefund(transactionId, refundAmount, reason = 'Transaction cancelled') {
        try {
            const transaction = await this.prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    user: true,
                    wallet: true
                }
            });
            if (!transaction) {
                throw new common_1.BadRequestException('Transaction not found');
            }
            if (!transaction.isRefundable || transaction.refundedAt) {
                throw new common_1.BadRequestException('Transaction is not refundable or already refunded');
            }
            const refundAmt = refundAmount || transaction.amount;
            if (refundAmt > transaction.amount) {
                throw new common_1.BadRequestException('Refund amount cannot exceed transaction amount');
            }
            const refundResult = await this.walletService.addMoney(transaction.userId, refundAmt, 'REFUND', transactionId);
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
        }
        catch (error) {
            this.logger.error(`Process refund error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Refund processing failed');
        }
    }
    async handleWebhook(webhookData, signature) {
        try {
            const expectedSignature = crypto
                .createHmac('sha256', this.razorpayWebhookSecret)
                .update(JSON.stringify(webhookData))
                .digest('hex');
            if (expectedSignature !== signature) {
                throw new common_1.BadRequestException('Invalid webhook signature');
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
        }
        catch (error) {
            this.logger.error(`Webhook handling error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Webhook processing failed');
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
        }
        catch (error) {
            this.logger.error(`Get payment stats error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to fetch payment statistics');
        }
    }
    async handlePaymentCaptured(payment) {
        this.logger.log(`Payment captured: ${payment.id}, amount: ₹${payment.amount / 100}`);
    }
    async handlePaymentFailed(payment) {
        this.logger.log(`Payment failed: ${payment.id}, reason: ${payment.error_description}`);
    }
    async handleRefundProcessed(refund) {
        this.logger.log(`Refund processed: ${refund.id}, amount: ₹${refund.amount / 100}`);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        wallet_service_1.WalletService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map