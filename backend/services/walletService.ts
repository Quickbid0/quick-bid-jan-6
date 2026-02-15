import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient, Wallet, WalletTransaction } from '@prisma/client';
import { RedisService } from './redis.service'; // Assuming Redis service exists

interface WalletTransactionInput {
  walletId: string;
  transactionType: 'deposit' | 'withdrawal' | 'bid_lock' | 'bid_release' | 'commission' | 'refund' | 'payment';
  amount: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  metadata?: any;
}

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaClient,
    private redisService: RedisService,
  ) {}

  /**
   * Get wallet by user ID with balance check
   */
  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { userId },
    });
  }

  /**
   * Create wallet for new user
   */
  async createWallet(userId: string): Promise<Wallet> {
    // Check if wallet already exists
    const existingWallet = await this.getWalletByUserId(userId);
    if (existingWallet) {
      throw new BadRequestException('Wallet already exists for this user');
    }

    return this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        lockedBalance: 0,
        currency: 'INR',
      },
    });
  }

  /**
   * Atomic wallet transaction with double-spend protection
   * Uses Redis locking and database transactions
   */
  async executeWalletTransaction(input: WalletTransactionInput): Promise<WalletTransaction> {
    const lockKey = `wallet_lock:${input.walletId}`;
    const lockTTL = 30000; // 30 seconds

    // Acquire Redis lock to prevent concurrent modifications
    const lockAcquired = await this.redisService.acquireLock(lockKey, lockTTL);
    if (!lockAcquired) {
      throw new BadRequestException('Wallet is currently being updated. Please try again.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Get current wallet state with row locking
        const wallet = await tx.wallet.findUnique({
          where: { id: input.walletId },
          lock: 'UPDATE', // PostgreSQL row-level locking
        });

        if (!wallet) {
          throw new BadRequestException('Wallet not found');
        }

        // Calculate new balances based on transaction type
        let balanceChange = 0;
        let lockedBalanceChange = 0;

        switch (input.transactionType) {
          case 'deposit':
            if (input.amount <= 0) throw new BadRequestException('Deposit amount must be positive');
            balanceChange = input.amount;
            break;

          case 'withdrawal':
            if (input.amount <= 0) throw new BadRequestException('Withdrawal amount must be positive');
            if (wallet.balance - wallet.lockedBalance < input.amount) {
              throw new BadRequestException('Insufficient available balance');
            }
            balanceChange = -input.amount;
            break;

          case 'bid_lock':
            if (input.amount <= 0) throw new BadRequestException('Lock amount must be positive');
            if (wallet.balance - wallet.lockedBalance < input.amount) {
              throw new BadRequestException('Insufficient available balance for bid');
            }
            lockedBalanceChange = input.amount;
            break;

          case 'bid_release':
            if (input.amount <= 0) throw new BadRequestException('Release amount must be positive');
            if (wallet.lockedBalance < input.amount) {
              throw new BadRequestException('Insufficient locked balance to release');
            }
            lockedBalanceChange = -input.amount;
            break;

          case 'commission':
            if (input.amount < 0) throw new BadRequestException('Commission amount cannot be negative');
            balanceChange = input.amount; // Commission credited to platform
            break;

          case 'refund':
            if (input.amount <= 0) throw new BadRequestException('Refund amount must be positive');
            balanceChange = input.amount;
            break;

          case 'payment':
            if (input.amount <= 0) throw new BadRequestException('Payment amount must be positive');
            if (wallet.balance - wallet.lockedBalance < input.amount) {
              throw new BadRequestException('Insufficient available balance for payment');
            }
            balanceChange = -input.amount;
            break;

          default:
            throw new BadRequestException('Invalid transaction type');
        }

        // Calculate new balances
        const newBalance = wallet.balance + balanceChange;
        const newLockedBalance = wallet.lockedBalance + lockedBalanceChange;

        // Validate final balances (should never be negative due to checks above)
        if (newBalance < 0 || newLockedBalance < 0) {
          throw new InternalServerErrorException('Invalid balance calculation');
        }

        // Update wallet atomically
        const updatedWallet = await tx.wallet.update({
          where: { id: input.walletId },
          data: {
            balance: newBalance,
            lockedBalance: newLockedBalance,
            updatedAt: new Date(),
          },
        });

        // Create transaction record
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: input.walletId,
            transactionType: input.transactionType,
            amount: input.amount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            referenceId: input.referenceId,
            referenceType: input.referenceType,
            description: input.description,
            status: 'completed',
            metadata: input.metadata,
          },
        });

        return transaction;
      });
    } finally {
      // Always release the lock
      await this.redisService.releaseLock(lockKey);
    }
  }

  /**
   * Check if wallet has sufficient balance for transaction
   */
  async checkSufficientBalance(walletId: string, amount: number): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true, lockedBalance: true },
    });

    if (!wallet) return false;

    const availableBalance = wallet.balance - wallet.lockedBalance;
    return availableBalance >= amount;
  }

  /**
   * Get wallet balance (available and locked)
   */
  async getWalletBalance(walletId: string): Promise<{ balance: number; lockedBalance: number; availableBalance: number }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true, lockedBalance: true },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const availableBalance = wallet.balance - wallet.lockedBalance;

    return {
      balance: wallet.balance,
      lockedBalance: wallet.lockedBalance,
      availableBalance,
    };
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(walletId: string, limit: number = 50, offset: number = 0): Promise<WalletTransaction[]> {
    return this.prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Bulk wallet operations (for admin use)
   */
  async bulkWalletOperation(
    walletIds: string[],
    operation: 'credit' | 'debit',
    amount: number,
    description: string,
    adminId: string
  ): Promise<WalletTransaction[]> {
    const transactions: WalletTransaction[] = [];

    for (const walletId of walletIds) {
      try {
        const transaction = await this.executeWalletTransaction({
          walletId,
          transactionType: operation === 'credit' ? 'deposit' : 'withdrawal',
          amount,
          description,
          metadata: { adminId, bulkOperation: true },
        });
        transactions.push(transaction);
      } catch (error) {
        // Log error but continue with other wallets
        console.error(`Failed to process wallet ${walletId}:`, error);
      }
    }

    return transactions;
  }

  /**
   * Wallet reconciliation (admin function)
   */
  async reconcileWallet(walletId: string): Promise<{ expectedBalance: number; actualBalance: number; difference: number }> {
    // Calculate expected balance from transaction history
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { walletId, status: 'completed' },
      orderBy: { createdAt: 'asc' },
    });

    let expectedBalance = 0;
    for (const tx of transactions) {
      switch (tx.transactionType) {
        case 'deposit':
        case 'commission':
        case 'refund':
          expectedBalance += tx.amount;
          break;
        case 'withdrawal':
        case 'payment':
          expectedBalance -= tx.amount;
          break;
        // bid_lock/release don't affect final balance
      }
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });

    const actualBalance = wallet?.balance || 0;
    const difference = actualBalance - expectedBalance;

    return { expectedBalance, actualBalance, difference };
  }
}
