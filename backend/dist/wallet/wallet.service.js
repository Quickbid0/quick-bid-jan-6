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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let WalletService = WalletService_1 = class WalletService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async getBalance(userId) {
        try {
            const wallet = await this.prisma.wallet.findUnique({
                where: { userId },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            return {
                userId,
                availableBalance: wallet.balance - wallet.blockedBalance,
                heldBalance: wallet.blockedBalance,
                totalBalance: wallet.balance,
                currency: wallet.currency,
                lastUpdated: wallet.updatedAt,
                transactions: wallet.transactions.map(tx => ({
                    id: tx.id,
                    amount: tx.amount,
                    type: tx.type,
                    description: tx.description,
                    status: tx.status,
                    createdAt: tx.createdAt
                }))
            };
        }
        catch (error) {
            this.logger.error(`Failed to get wallet balance for user ${userId}:`, error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch wallet balance');
        }
    }
    async addFunds(userId, amount, purpose = 'wallet_topup', referenceId, referenceType, description, metadata) {
        try {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const transactionId = this.generateTransactionId();
            const result = await this.prisma.$transaction(async (tx) => {
                const transaction = await tx.walletTransaction.create({
                    data: {
                        id: transactionId,
                        userId,
                        amount,
                        type: 'credit',
                        purpose,
                        status: 'completed',
                        referenceId,
                        referenceType,
                        description: description || this.getTransactionDescription(purpose, amount),
                        metadata,
                    },
                });
                const wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException('Wallet not found');
                }
                const updatedWallet = await tx.wallet.update({
                    where: { userId },
                    data: {
                        balance: wallet.balance + amount,
                        updatedAt: new Date(),
                    },
                    select: {
                        balance: true,
                        blockedBalance: true,
                        currency: true,
                        updatedAt: true,
                    },
                });
                return {
                    transaction,
                    wallet: updatedWallet,
                };
            });
            const newBalance = {
                availableBalance: result.wallet.balance - result.wallet.blockedBalance,
                heldBalance: result.wallet.blockedBalance,
                totalBalance: result.wallet.balance,
                currency: result.wallet.currency,
                lastUpdated: result.wallet.updatedAt,
            };
            this.eventEmitter.emit('wallet.transaction.completed', {
                transaction: result.transaction,
                newBalance,
            });
            this.logger.log(`Credit transaction completed: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to add funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to add funds to wallet');
        }
    }
    async deductFunds(userId, amount, purpose = 'bid_placement', referenceId, referenceType, description, metadata) {
        try {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const transactionId = this.generateTransactionId();
            const result = await this.prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException('Wallet not found');
                }
                const availableBalance = wallet.balance - wallet.blockedBalance;
                if (availableBalance < amount) {
                    throw new common_1.BadRequestException('Insufficient funds in wallet');
                }
                const transaction = await tx.walletTransaction.create({
                    data: {
                        id: transactionId,
                        userId,
                        amount,
                        type: 'debit',
                        purpose,
                        status: 'completed',
                        referenceId,
                        referenceType,
                        description: description || this.getTransactionDescription(purpose, amount),
                        metadata,
                    },
                });
                const updatedWallet = await tx.wallet.update({
                    where: { userId },
                    data: {
                        balance: wallet.balance - amount,
                        updatedAt: new Date(),
                    },
                    select: {
                        balance: true,
                        blockedBalance: true,
                        currency: true,
                        updatedAt: true,
                    },
                });
                return {
                    transaction,
                    wallet: updatedWallet,
                };
            });
            const newBalance = {
                availableBalance: result.wallet.balance - result.wallet.blockedBalance,
                heldBalance: result.wallet.blockedBalance,
                totalBalance: result.wallet.balance,
                currency: result.wallet.currency,
                lastUpdated: result.wallet.updatedAt,
            };
            this.eventEmitter.emit('wallet.transaction.completed', {
                transaction: result.transaction,
                newBalance,
            });
            this.logger.log(`Debit transaction completed: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to deduct funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to deduct funds from wallet');
        }
    }
    async holdFunds(userId, amount, purpose, referenceId, referenceType, description, metadata) {
        try {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const transactionId = this.generateTransactionId();
            const result = await this.prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException('Wallet not found');
                }
                const availableBalance = wallet.balance - wallet.blockedBalance;
                if (availableBalance < amount) {
                    throw new common_1.BadRequestException('Insufficient funds in wallet');
                }
                const transaction = await tx.walletTransaction.create({
                    data: {
                        id: transactionId,
                        userId,
                        amount,
                        type: 'hold',
                        purpose,
                        status: 'completed',
                        referenceId,
                        referenceType,
                        description: description || this.getTransactionDescription(purpose, amount),
                        metadata,
                    },
                });
                const updatedWallet = await tx.wallet.update({
                    where: { userId },
                    data: {
                        blockedBalance: wallet.blockedBalance + amount,
                        updatedAt: new Date(),
                    },
                    select: {
                        balance: true,
                        blockedBalance: true,
                        currency: true,
                        updatedAt: true,
                    },
                });
                return {
                    transaction,
                    wallet: updatedWallet,
                };
            });
            const newBalance = {
                availableBalance: result.wallet.balance - result.wallet.blockedBalance,
                heldBalance: result.wallet.blockedBalance,
                totalBalance: result.wallet.balance,
                currency: result.wallet.currency,
                lastUpdated: result.wallet.updatedAt,
            };
            this.logger.log(`Hold transaction completed: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to hold funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to hold funds');
        }
    }
    async releaseFunds(userId, amount, originalTransactionId, description, metadata) {
        try {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const transactionId = this.generateTransactionId();
            const result = await this.prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException('Wallet not found');
                }
                if (wallet.blockedBalance < amount) {
                    throw new common_1.BadRequestException('Insufficient held funds to release');
                }
                const transaction = await tx.walletTransaction.create({
                    data: {
                        id: transactionId,
                        userId,
                        amount,
                        type: 'release',
                        purpose: 'refund',
                        status: 'completed',
                        referenceId: originalTransactionId,
                        referenceType: 'transaction',
                        description: description || `Funds released: ₹${amount}`,
                        metadata,
                    },
                });
                const updatedWallet = await tx.wallet.update({
                    where: { userId },
                    data: {
                        blockedBalance: wallet.blockedBalance - amount,
                        updatedAt: new Date(),
                    },
                    select: {
                        balance: true,
                        blockedBalance: true,
                        currency: true,
                        updatedAt: true,
                    },
                });
                return {
                    transaction,
                    wallet: updatedWallet,
                };
            });
            const newBalance = {
                availableBalance: result.wallet.balance - result.wallet.blockedBalance,
                heldBalance: result.wallet.blockedBalance,
                totalBalance: result.wallet.balance,
                currency: result.wallet.currency,
                lastUpdated: result.wallet.updatedAt,
            };
            this.logger.log(`Release transaction completed: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to release funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to release funds');
        }
    }
    async processRefund(refundRequest) {
        try {
            const { userId, amount, reason, referenceId, referenceType, originalTransactionId } = refundRequest;
            if (amount <= 0) {
                throw new common_1.BadRequestException('Refund amount must be positive');
            }
            const transactionId = this.generateTransactionId();
            const result = await this.prisma.$transaction(async (tx) => {
                const transaction = await tx.walletTransaction.create({
                    data: {
                        id: transactionId,
                        userId,
                        amount,
                        type: 'credit',
                        purpose: 'refund',
                        status: 'completed',
                        referenceId,
                        referenceType,
                        description: `Refund: ${reason} - ₹${amount}`,
                        metadata: {
                            originalTransactionId,
                            refundReason: reason,
                            processedAt: new Date(),
                        },
                    },
                });
                const wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException('Wallet not found');
                }
                const updatedWallet = await tx.wallet.update({
                    where: { userId },
                    data: {
                        balance: wallet.balance + amount,
                        updatedAt: new Date(),
                    },
                    select: {
                        balance: true,
                        blockedBalance: true,
                        currency: true,
                        updatedAt: true,
                    },
                });
                return {
                    transaction,
                    wallet: updatedWallet,
                };
            });
            const newBalance = {
                availableBalance: result.wallet.balance - result.wallet.blockedBalance,
                heldBalance: result.wallet.blockedBalance,
                totalBalance: result.wallet.balance,
                currency: result.wallet.currency,
                lastUpdated: result.wallet.updatedAt,
            };
            this.eventEmitter.emit('wallet.refund.processed', {
                userId,
                amount,
                reason,
                transactionId,
                newBalance,
            });
            this.logger.log(`Refund processed for user ${userId}: ₹${amount}, reason: ${reason}, transaction: ${transactionId}`);
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process refund for user ${refundRequest.userId}:`, error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process refund');
        }
    }
    async processAuctionSettlement(auctionId, winnerId, sellerId, finalPrice, platformFeePercent = 5) {
        try {
            const platformFee = Math.round(finalPrice * (platformFeePercent / 100) * 100) / 100;
            const sellerPayout = finalPrice - platformFee;
            if (sellerPayout <= 0) {
                throw new common_1.BadRequestException('Invalid seller payout calculation');
            }
            const winnerTransactionId = this.generateTransactionId();
            const sellerTransactionId = this.generateTransactionId();
            const result = await this.prisma.$transaction(async (tx) => {
                const winnerWallet = await tx.wallet.findUnique({
                    where: { userId: winnerId },
                });
                if (!winnerWallet) {
                    throw new common_1.NotFoundException('Winner wallet not found');
                }
                const winnerAvailableBalance = winnerWallet.balance - winnerWallet.blockedBalance;
                if (winnerAvailableBalance < finalPrice) {
                    throw new common_1.BadRequestException('Winner has insufficient funds');
                }
                const winnerTransaction = await tx.walletTransaction.create({
                    data: {
                        id: winnerTransactionId,
                        userId: winnerId,
                        amount: finalPrice,
                        type: 'debit',
                        purpose: 'auction_win',
                        status: 'completed',
                        referenceId: auctionId,
                        referenceType: 'auction',
                        description: `Auction win payment for ${auctionId}`,
                        metadata: {
                            sellerId,
                            platformFee,
                            sellerPayout,
                            finalPrice,
                        },
                    },
                });
                await tx.wallet.update({
                    where: { userId: winnerId },
                    data: {
                        balance: winnerWallet.balance - finalPrice,
                        updatedAt: new Date(),
                    },
                });
                const sellerTransaction = await tx.walletTransaction.create({
                    data: {
                        id: sellerTransactionId,
                        userId: sellerId,
                        amount: sellerPayout,
                        type: 'credit',
                        purpose: 'auction_payout',
                        status: 'completed',
                        referenceId: auctionId,
                        referenceType: 'auction',
                        description: `Auction payout for ${auctionId} (₹${finalPrice} - ₹${platformFee} fee)`,
                        metadata: {
                            winnerId,
                            finalPrice,
                            platformFee,
                            sellerPayout,
                        },
                    },
                });
                const sellerWallet = await tx.wallet.findUnique({
                    where: { userId: sellerId },
                });
                if (!sellerWallet) {
                    throw new common_1.NotFoundException('Seller wallet not found');
                }
                await tx.wallet.update({
                    where: { userId: sellerId },
                    data: {
                        balance: sellerWallet.balance + sellerPayout,
                        updatedAt: new Date(),
                    },
                });
                await tx.platformFee.create({
                    data: {
                        auctionId,
                        amount: platformFee,
                        winnerId,
                        sellerId,
                        processedAt: new Date(),
                    },
                });
                return {
                    winnerTransaction,
                    sellerTransaction,
                    platformFee,
                    sellerPayout,
                };
            });
            this.eventEmitter.emit('auction.settlement.completed', {
                auctionId,
                winnerId,
                sellerId,
                finalPrice,
                platformFee: result.platformFee,
                sellerPayout: result.sellerPayout,
                winnerTransactionId,
                sellerTransactionId,
            });
            this.logger.log(`Auction settlement completed: ${auctionId}, winner: ${winnerId}, seller: ${sellerId}, amount: ₹${finalPrice}, fee: ₹${result.platformFee}, payout: ₹${result.sellerPayout}`);
            return {
                success: true,
                winnerTransactionId,
                sellerTransactionId,
                platformFee: result.platformFee,
                sellerPayout: result.sellerPayout,
            };
        }
        catch (error) {
            this.logger.error(`Auction settlement failed for ${auctionId}:`, error);
            this.eventEmitter.emit('auction.settlement.failed', {
                auctionId,
                winnerId,
                sellerId,
                finalPrice,
                error: error.message,
            });
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process auction settlement');
        }
    }
    async refundAuctionBids(auctionId, bidDetails) {
        try {
            let refundedCount = 0;
            let totalRefunded = 0;
            const failedRefunds = [];
            for (const bid of bidDetails) {
                try {
                    await this.processRefund({
                        userId: bid.userId,
                        amount: bid.amount,
                        reason: 'Auction cancelled/failed',
                        referenceId: auctionId,
                        referenceType: 'auction',
                        originalTransactionId: bid.bidId,
                    });
                    refundedCount++;
                    totalRefunded += bid.amount;
                }
                catch (error) {
                    failedRefunds.push({
                        userId: bid.userId,
                        amount: bid.amount,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            this.logger.log(`Auction refunds processed: ${auctionId}, refunded: ${refundedCount}/${bidDetails.length} bids, total: ₹${totalRefunded}`);
            return {
                success: true,
                refundedCount,
                totalRefunded,
                failedRefunds,
            };
        }
        catch (error) {
            this.logger.error(`Auction refunds failed for ${auctionId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to process auction refunds');
        }
    }
    async getTransactionHistory(userId, limit = 50, offset = 0, type, purpose) {
        try {
            const mockTransactions = [
                {
                    id: 'txn_001',
                    userId,
                    amount: 10000,
                    type: 'credit',
                    purpose: 'wallet_topup',
                    status: 'completed',
                    description: 'Wallet recharge',
                    createdAt: new Date(Date.now() - 86400000),
                    updatedAt: new Date(Date.now() - 86400000),
                },
                {
                    id: 'txn_002',
                    userId,
                    amount: 5000,
                    type: 'debit',
                    purpose: 'bid_placement',
                    status: 'completed',
                    referenceId: 'auction_123',
                    referenceType: 'auction',
                    description: 'Bid placed on auction',
                    createdAt: new Date(Date.now() - 3600000),
                    updatedAt: new Date(Date.now() - 3600000),
                },
            ];
            let filteredTransactions = mockTransactions;
            if (type) {
                filteredTransactions = filteredTransactions.filter(t => t.type === type);
            }
            if (purpose) {
                filteredTransactions = filteredTransactions.filter(t => t.purpose === purpose);
            }
            const paginatedTransactions = filteredTransactions
                .slice(offset, offset + limit)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return {
                transactions: paginatedTransactions,
                totalCount: filteredTransactions.length,
                hasMore: offset + limit < filteredTransactions.length,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get transaction history for user ${userId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch transaction history');
        }
    }
    async getWalletStats(userId) {
        try {
            const history = await this.getTransactionHistory(userId, 1000);
            const credits = history.transactions
                .filter(t => t.type === 'credit' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);
            const debits = history.transactions
                .filter(t => t.type === 'debit' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);
            const netFlow = credits - debits;
            const transactionCount = history.transactions.length;
            const averageTransaction = transactionCount > 0 ? (credits + debits) / transactionCount : 0;
            const lastTransaction = history.transactions[0];
            return {
                totalCredits: credits,
                totalDebits: debits,
                netFlow,
                transactionCount,
                averageTransaction,
                lastTransactionDate: lastTransaction?.createdAt,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get wallet stats for user ${userId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch wallet statistics');
        }
    }
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getTransactionDescription(purpose, amount) {
        const descriptions = {
            wallet_topup: `Wallet recharge: ₹${amount}`,
            bid_placement: `Bid placed: ₹${amount}`,
            bid_refund: `Bid refund: ₹${amount}`,
            auction_win: `Auction win payment: ₹${amount}`,
            auction_payout: `Auction payout: ₹${amount}`,
            security_deposit: `Security deposit: ₹${amount}`,
            commission: `Commission earned: ₹${amount}`,
            penalty: `Penalty charged: ₹${amount}`,
            refund: `Refund processed: ₹${amount}`,
        };
        return descriptions[purpose] || `Transaction: ₹${amount}`;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], WalletService);
//# sourceMappingURL=wallet.service.js.map