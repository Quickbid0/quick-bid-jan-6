import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Type definitions for wallet operations
export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit' | 'hold' | 'release';
  purpose: 'wallet_topup' | 'bid_placement' | 'bid_refund' | 'auction_win' | 'auction_payout' | 'security_deposit' | 'commission' | 'penalty' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  referenceId?: string;
  referenceType?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  availableBalance: number;
  heldBalance: number;
  totalBalance: number;
  currency: string;
  lastUpdated: Date;
}

export interface RefundRequest {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  originalTransactionId?: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get wallet balance for a user
   */
  async getBalance(userId: string) {
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
        throw new NotFoundException('Wallet not found');
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
    } catch (error) {
      this.logger.error(`Failed to get wallet balance for user ${userId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch wallet balance');
    }
  }

  /**
   * Add funds to wallet (credit transaction) - ATOMIC OPERATION
   */
  async addFunds(
    userId: string,
    amount: number,
    purpose: WalletTransaction['purpose'] = 'wallet_topup',
    referenceId?: string,
    referenceType?: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; transactionId: string; newBalance: WalletBalance }> {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Amount must be positive');
      }

      const transactionId = this.generateTransactionId();

      // Execute wallet update and transaction creation in a single database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create the transaction record first
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

        // 2. Update wallet balance atomically
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
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

      const newBalance: WalletBalance = {
        availableBalance: result.wallet.balance - result.wallet.blockedBalance,
        heldBalance: result.wallet.blockedBalance,
        totalBalance: result.wallet.balance,
        currency: result.wallet.currency,
        lastUpdated: result.wallet.updatedAt,
      };

      // Emit wallet event
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
    } catch (error) {
      this.logger.error(`Failed to add funds for user ${userId}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add funds to wallet');
    }
  }

  /**
   * Deduct funds from wallet (debit transaction) - ATOMIC OPERATION
   */
  async deductFunds(
    userId: string,
    amount: number,
    purpose: WalletTransaction['purpose'] = 'bid_placement',
    referenceId?: string,
    referenceType?: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; transactionId: string; newBalance: WalletBalance }> {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Amount must be positive');
      }

      const transactionId = this.generateTransactionId();

      // Execute wallet check and update in a single database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Get current wallet balance
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
        }

        // 2. Check available balance
        const availableBalance = wallet.balance - wallet.blockedBalance;
        if (availableBalance < amount) {
          throw new BadRequestException('Insufficient funds in wallet');
        }

        // 3. Create the transaction record
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

        // 4. Update wallet balance atomically
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

      const newBalance: WalletBalance = {
        availableBalance: result.wallet.balance - result.wallet.blockedBalance,
        heldBalance: result.wallet.blockedBalance,
        totalBalance: result.wallet.balance,
        currency: result.wallet.currency,
        lastUpdated: result.wallet.updatedAt,
      };

      // Emit wallet event
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
    } catch (error) {
      this.logger.error(`Failed to deduct funds for user ${userId}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to deduct funds from wallet');
    }
  }

  /**
   * Hold funds (for security deposits, pending bids) - ATOMIC OPERATION
   */
  async holdFunds(
    userId: string,
    amount: number,
    purpose: WalletTransaction['purpose'],
    referenceId?: string,
    referenceType?: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; transactionId: string; newBalance: WalletBalance }> {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Amount must be positive');
      }

      const transactionId = this.generateTransactionId();

      // Execute wallet check and hold operation in a single database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Get current wallet balance
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
        }

        // 2. Check available balance
        const availableBalance = wallet.balance - wallet.blockedBalance;
        if (availableBalance < amount) {
          throw new BadRequestException('Insufficient funds in wallet');
        }

        // 3. Create the hold transaction record
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

        // 4. Update wallet balance atomically (move from available to held)
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

      const newBalance: WalletBalance = {
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
    } catch (error) {
      this.logger.error(`Failed to hold funds for user ${userId}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to hold funds');
    }
  }

  /**
   * Release held funds back to available balance - ATOMIC OPERATION
   */
  async releaseFunds(
    userId: string,
    amount: number,
    originalTransactionId: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; transactionId: string; newBalance: WalletBalance }> {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Amount must be positive');
      }

      const transactionId = this.generateTransactionId();

      // Execute wallet check and release operation in a single database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Get current wallet balance
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
        }

        // 2. Check if sufficient held funds exist
        if (wallet.blockedBalance < amount) {
          throw new BadRequestException('Insufficient held funds to release');
        }

        // 3. Create the release transaction record
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

        // 4. Update wallet balance atomically (move from held to available)
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

      const newBalance: WalletBalance = {
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
    } catch (error) {
      this.logger.error(`Failed to release funds for user ${userId}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to release funds');
    }
  }

  /**
   * Process refund for failed bids or cancelled auctions - ATOMIC OPERATION
   */
  async processRefund(refundRequest: RefundRequest): Promise<{ success: boolean; transactionId: string; newBalance: WalletBalance }> {
    try {
      const { userId, amount, reason, referenceId, referenceType, originalTransactionId } = refundRequest;

      if (amount <= 0) {
        throw new BadRequestException('Refund amount must be positive');
      }

      const transactionId = this.generateTransactionId();

      // Execute refund in a single database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create the refund transaction record
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

        // 2. Update wallet balance atomically
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Wallet not found');
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

      const newBalance: WalletBalance = {
        availableBalance: result.wallet.balance - result.wallet.blockedBalance,
        heldBalance: result.wallet.blockedBalance,
        totalBalance: result.wallet.balance,
        currency: result.wallet.currency,
        lastUpdated: result.wallet.updatedAt,
      };

      // Emit refund event
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
    } catch (error) {
      this.logger.error(`Failed to process refund for user ${refundRequest.userId}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  /**
   * Process auction settlement (winner pays, seller receives payout) - ATOMIC OPERATION
   */
  async processAuctionSettlement(
    auctionId: string,
    winnerId: string,
    sellerId: string,
    finalPrice: number,
    platformFeePercent: number = 5
  ): Promise<{
    success: boolean;
    winnerTransactionId: string;
    sellerTransactionId: string;
    platformFee: number;
    sellerPayout: number;
  }> {
    try {
      const platformFee = Math.round(finalPrice * (platformFeePercent / 100) * 100) / 100; // Round to 2 decimal places
      const sellerPayout = finalPrice - platformFee;

      if (sellerPayout <= 0) {
        throw new BadRequestException('Invalid seller payout calculation');
      }

      const winnerTransactionId = this.generateTransactionId();
      const sellerTransactionId = this.generateTransactionId();

      // Execute entire auction settlement in a single database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Verify winner has sufficient funds and deduct payment
        const winnerWallet = await tx.wallet.findUnique({
          where: { userId: winnerId },
        });

        if (!winnerWallet) {
          throw new NotFoundException('Winner wallet not found');
        }

        const winnerAvailableBalance = winnerWallet.balance - winnerWallet.blockedBalance;
        if (winnerAvailableBalance < finalPrice) {
          throw new BadRequestException('Winner has insufficient funds');
        }

        // 2. Create winner's debit transaction
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

        // 3. Update winner's wallet balance
        await tx.wallet.update({
          where: { userId: winnerId },
          data: {
            balance: winnerWallet.balance - finalPrice,
            updatedAt: new Date(),
          },
        });

        // 4. Create seller's credit transaction
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

        // 5. Update seller's wallet balance
        const sellerWallet = await tx.wallet.findUnique({
          where: { userId: sellerId },
        });

        if (!sellerWallet) {
          throw new NotFoundException('Seller wallet not found');
        }

        await tx.wallet.update({
          where: { userId: sellerId },
          data: {
            balance: sellerWallet.balance + sellerPayout,
            updatedAt: new Date(),
          },
        });

        // 6. Record platform fee (could be stored separately for accounting)
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

      // Emit auction settlement event
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
    } catch (error) {
      this.logger.error(`Auction settlement failed for ${auctionId}:`, error);

      // Emit settlement failure event
      this.eventEmitter.emit('auction.settlement.failed', {
        auctionId,
        winnerId,
        sellerId,
        finalPrice,
        error: error.message,
      });

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process auction settlement');
    }
  }

  /**
   * Refund all bids for cancelled/failed auction
   */
  async refundAuctionBids(auctionId: string, bidDetails: Array<{ userId: string; amount: number; bidId: string }>): Promise<{
    success: boolean;
    refundedCount: number;
    totalRefunded: number;
    failedRefunds: Array<{ userId: string; amount: number; error: string }>;
  }> {
    try {
      let refundedCount = 0;
      let totalRefunded = 0;
      const failedRefunds: Array<{ userId: string; amount: number; error: string }> = [];

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
        } catch (error) {
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
    } catch (error) {
      this.logger.error(`Auction refunds failed for ${auctionId}:`, error);
      throw new InternalServerErrorException('Failed to process auction refunds');
    }
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    type?: WalletTransaction['type'],
    purpose?: WalletTransaction['purpose']
  ): Promise<{
    transactions: WalletTransaction[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      // In production, query database with filters
      // For now, return mock transaction history
      const mockTransactions: WalletTransaction[] = [
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
    } catch (error) {
      this.logger.error(`Failed to get transaction history for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch transaction history');
    }
  }

  /**
   * Get wallet statistics for a user
   */
  async getWalletStats(userId: string): Promise<{
    totalCredits: number;
    totalDebits: number;
    netFlow: number;
    transactionCount: number;
    averageTransaction: number;
    lastTransactionDate?: Date;
  }> {
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
    } catch (error) {
      this.logger.error(`Failed to get wallet stats for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch wallet statistics');
    }
  }

  // Private helper methods

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTransactionDescription(purpose: WalletTransaction['purpose'], amount: number): string {
    const descriptions: Record<WalletTransaction['purpose'], string> = {
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
}
