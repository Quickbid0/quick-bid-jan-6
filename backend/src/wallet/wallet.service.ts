import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit' | 'hold' | 'release';
  purpose: 'wallet_topup' | 'bid_placement' | 'bid_refund' | 'auction_win' | 'auction_payout' | 'security_deposit' | 'commission' | 'penalty' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  referenceId?: string; // auction_id, payment_id, etc.
  referenceType?: string; // auction, payment, etc.
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  userId: string;
  availableBalance: number;
  heldBalance: number; // For security deposits, pending bids
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
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get wallet balance for a user
   */
  async getBalance(userId: string): Promise<WalletBalance> {
    try {
      // In production, fetch from database
      // For now, return mock data with proper structure
      const mockBalance: WalletBalance = {
        userId,
        availableBalance: 50000, // Mock available balance
        heldBalance: 5000, // Mock held amount (security deposits, pending bids)
        totalBalance: 55000,
        currency: 'INR',
        lastUpdated: new Date(),
      };

      return mockBalance;
    } catch (error) {
      this.logger.error(`Failed to get wallet balance for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch wallet balance');
    }
  }

  /**
   * Add funds to wallet (credit transaction)
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

      const transaction: WalletTransaction = {
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

      // In production, save to database within transaction
      this.logger.log(`Credit transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);

      // Update wallet balance
      const newBalance = await this.updateWalletBalance(userId, amount, 'credit');

      // Emit wallet event
      this.eventEmitter.emit('wallet.transaction.completed', {
        transaction,
        newBalance,
      });

      return {
        success: true,
        transactionId,
        newBalance,
      };
    } catch (error) {
      this.logger.error(`Failed to add funds for user ${userId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add funds to wallet');
    }
  }

  /**
   * Deduct funds from wallet (debit transaction)
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

      // Check available balance
      const currentBalance = await this.getBalance(userId);
      if (currentBalance.availableBalance < amount) {
        throw new BadRequestException('Insufficient funds in wallet');
      }

      const transactionId = this.generateTransactionId();

      const transaction: WalletTransaction = {
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

      // In production, save to database within transaction
      this.logger.log(`Debit transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);

      // Update wallet balance
      const newBalance = await this.updateWalletBalance(userId, amount, 'debit');

      // Emit wallet event
      this.eventEmitter.emit('wallet.transaction.completed', {
        transaction,
        newBalance,
      });

      return {
        success: true,
        transactionId,
        newBalance,
      };
    } catch (error) {
      this.logger.error(`Failed to deduct funds for user ${userId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to deduct funds from wallet');
    }
  }

  /**
   * Hold funds (for security deposits, pending bids)
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

      // Check available balance
      const currentBalance = await this.getBalance(userId);
      if (currentBalance.availableBalance < amount) {
        throw new BadRequestException('Insufficient funds in wallet');
      }

      const transactionId = this.generateTransactionId();

      const transaction: WalletTransaction = {
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

      // In production, save to database
      this.logger.log(`Hold transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);

      // Update wallet balance (move from available to held)
      const newBalance = await this.updateWalletBalance(userId, amount, 'hold');

      return {
        success: true,
        transactionId,
        newBalance,
      };
    } catch (error) {
      this.logger.error(`Failed to hold funds for user ${userId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to hold funds');
    }
  }

  /**
   * Release held funds back to available balance
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

      const transaction: WalletTransaction = {
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

      // In production, save to database
      this.logger.log(`Release transaction created: ${transactionId} for user ${userId}, amount: ₹${amount}`);

      // Update wallet balance (move from held to available)
      const newBalance = await this.updateWalletBalance(userId, amount, 'release');

      return {
        success: true,
        transactionId,
        newBalance,
      };
    } catch (error) {
      this.logger.error(`Failed to release funds for user ${userId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to release funds');
    }
  }

  /**
   * Process refund for failed bids or cancelled auctions
   */
  async processRefund(refundRequest: RefundRequest): Promise<{ success: boolean; transactionId: string; newBalance: WalletBalance }> {
    try {
      const { userId, amount, reason, referenceId, referenceType, originalTransactionId } = refundRequest;

      if (amount <= 0) {
        throw new BadRequestException('Refund amount must be positive');
      }

      // Create refund transaction
      const result = await this.addFunds(
        userId,
        amount,
        'refund',
        referenceId,
        referenceType,
        `Refund: ${reason} - ₹${amount}`,
        {
          originalTransactionId,
          refundReason: reason,
          processedAt: new Date(),
        }
      );

      this.logger.log(`Refund processed for user ${userId}: ₹${amount}, reason: ${reason}`);

      // Emit refund event
      this.eventEmitter.emit('wallet.refund.processed', {
        userId,
        amount,
        reason,
        transactionId: result.transactionId,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to process refund for user ${refundRequest.userId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  /**
   * Process auction settlement (winner pays, seller receives payout)
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
      const platformFee = finalPrice * (platformFeePercent / 100);
      const sellerPayout = finalPrice - platformFee;

      // Deduct from winner's wallet
      const winnerResult = await this.deductFunds(
        winnerId,
        finalPrice,
        'auction_win',
        auctionId,
        'auction',
        `Auction win payment for ${auctionId}`,
        { sellerId, platformFee, sellerPayout }
      );

      // Credit to seller's wallet (minus platform fee)
      const sellerResult = await this.addFunds(
        sellerId,
        sellerPayout,
        'auction_payout',
        auctionId,
        'auction',
        `Auction payout for ${auctionId} (₹${finalPrice} - ₹${platformFee} fee)`,
        { winnerId, finalPrice, platformFee }
      );

      // Record platform fee as commission (mock for now)
      await this.recordPlatformFee(auctionId, platformFee, winnerId, sellerId);

      this.logger.log(`Auction settlement completed: ${auctionId}, winner: ${winnerId}, seller: ${sellerId}, amount: ₹${finalPrice}`);

      return {
        success: true,
        winnerTransactionId: winnerResult.transactionId,
        sellerTransactionId: sellerResult.transactionId,
        platformFee,
        sellerPayout,
      };
    } catch (error) {
      this.logger.error(`Auction settlement failed for ${auctionId}:`, error);
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

  private async updateWalletBalance(
    userId: string,
    amount: number,
    operation: 'credit' | 'debit' | 'hold' | 'release'
  ): Promise<WalletBalance> {
    // In production, update database within transaction
    // For now, return mock updated balance
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

    const newBalance: WalletBalance = {
      ...currentBalance,
      availableBalance: newAvailableBalance,
      heldBalance: newHeldBalance,
      totalBalance: newAvailableBalance + newHeldBalance,
      lastUpdated: new Date(),
    };

    return newBalance;
  }

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

  private async recordPlatformFee(
    auctionId: string,
    feeAmount: number,
    winnerId: string,
    sellerId: string
  ): Promise<void> {
    // In production, record platform fee in separate ledger
    this.logger.log(`Platform fee recorded: ₹${feeAmount} for auction ${auctionId}`);
  }
}
