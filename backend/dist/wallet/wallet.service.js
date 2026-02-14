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
const event_emitter_1 = require("@nestjs/event-emitter");
let WalletService = WalletService_1 = class WalletService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async getBalance(userId) {
        try {
            const mockBalance = {
                userId,
                availableBalance: 50000,
                heldBalance: 5000,
                totalBalance: 55000,
                currency: 'INR',
                lastUpdated: new Date(),
            };
            return mockBalance;
        }
        catch (error) {
            this.logger.error(`Failed to get wallet balance for user ${userId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch wallet balance');
        }
    }
    async addFunds(userId, amount, purpose = 'wallet_topup', referenceId, referenceType, description, metadata) {
        try {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const transactionId = this.generateTransactionId();
            const transaction = {
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
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.logger.log(`Credit transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            const newBalance = await this.updateWalletBalance(userId, amount, 'credit');
            this.eventEmitter.emit('wallet.transaction.completed', {
                transaction,
                newBalance,
            });
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to add funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException) {
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
            const currentBalance = await this.getBalance(userId);
            if (currentBalance.availableBalance < amount) {
                throw new common_1.BadRequestException('Insufficient funds in wallet');
            }
            const transactionId = this.generateTransactionId();
            const transaction = {
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
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.logger.log(`Debit transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            const newBalance = await this.updateWalletBalance(userId, amount, 'debit');
            this.eventEmitter.emit('wallet.transaction.completed', {
                transaction,
                newBalance,
            });
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to deduct funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException) {
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
            const currentBalance = await this.getBalance(userId);
            if (currentBalance.availableBalance < amount) {
                throw new common_1.BadRequestException('Insufficient funds in wallet');
            }
            const transactionId = this.generateTransactionId();
            const transaction = {
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
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.logger.log(`Hold transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            const newBalance = await this.updateWalletBalance(userId, amount, 'hold');
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to hold funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException) {
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
            const transaction = {
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
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.logger.log(`Release transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);
            const newBalance = await this.updateWalletBalance(userId, amount, 'release');
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            this.logger.error(`Failed to release funds for user ${userId}:`, error);
            if (error instanceof common_1.BadRequestException) {
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
            const result = await this.addFunds(userId, amount, 'refund', referenceId, referenceType, `Refund: ${reason} - ₹${amount}`, {
                originalTransactionId,
                refundReason: reason,
                processedAt: new Date(),
            });
            this.logger.log(`Refund processed for user ${userId}: ₹${amount}, reason: ${reason}`);
            this.eventEmitter.emit('wallet.refund.processed', {
                userId,
                amount,
                reason,
                transactionId: result.transactionId,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to process refund for user ${refundRequest.userId}:`, error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to process refund');
        }
    }
    async processAuctionSettlement(auctionId, winnerId, sellerId, finalPrice, platformFeePercent = 5) {
        try {
            const platformFee = finalPrice * (platformFeePercent / 100);
            const sellerPayout = finalPrice - platformFee;
            const winnerResult = await this.deductFunds(winnerId, finalPrice, 'auction_win', auctionId, 'auction', `Auction win payment for ${auctionId}`, { sellerId, platformFee, sellerPayout });
            const sellerResult = await this.addFunds(sellerId, sellerPayout, 'auction_payout', auctionId, 'auction', `Auction payout for ${auctionId} (₹${finalPrice} - ₹${platformFee} fee)`, { winnerId, finalPrice, platformFee });
            await this.recordPlatformFee(auctionId, platformFee, winnerId, sellerId);
            this.logger.log(`Auction settlement completed: ${auctionId}, winner: ${winnerId}, seller: ${sellerId}, amount: ₹${finalPrice}`);
            return {
                success: true,
                winnerTransactionId: winnerResult.transactionId,
                sellerTransactionId: sellerResult.transactionId,
                platformFee,
                sellerPayout,
            };
        }
        catch (error) {
            this.logger.error(`Auction settlement failed for ${auctionId}:`, error);
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
    async updateWalletBalance(userId, amount, operation) {
        const currentBalance = await this.getBalance(userId);
        let newAvailableBalance = currentBalance.availableBalance;
        let newHeldBalance = currentBalance.heldBalance;
        switch (operation) {
            case 'credit':
                newAvailableBalance += amount;
                break;
            case 'debit':
                newAvailableBalance -= amount;
                break;
            case 'hold':
                newAvailableBalance -= amount;
                newHeldBalance += amount;
                break;
            case 'release':
                newAvailableBalance += amount;
                newHeldBalance -= amount;
                break;
        }
        const newBalance = {
            ...currentBalance,
            availableBalance: newAvailableBalance,
            heldBalance: newHeldBalance,
            totalBalance: newAvailableBalance + newHeldBalance,
            lastUpdated: new Date(),
        };
        return newBalance;
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
    async recordPlatformFee(auctionId, feeAmount, winnerId, sellerId) {
        this.logger.log(`Platform fee recorded: ₹${feeAmount} for auction ${auctionId}`);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], WalletService);
//# sourceMappingURL=wallet.service.js.map