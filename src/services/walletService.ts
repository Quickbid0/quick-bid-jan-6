// Safe Wallet & Transaction Handling
export interface Wallet {
  userId: string;
  balance: number;
  isSandbox: boolean;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  productId: string;
  type: 'bid' | 'win' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  isSandbox: boolean;
  createdAt: Date;
}

export class WalletService {
  private static readonly SANDBOX_MODE = true; // Always true initially
  
  static async getWallet(userId: string): Promise<Wallet | null> {
    // TODO: Implement wallet fetching from database
    return {
      userId,
      balance: 1000, // Default sandbox balance
      isSandbox: this.SANDBOX_MODE,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  static async placeBid(userId: string, productId: string, amount: number): Promise<Transaction> {
    const wallet = await this.getWallet(userId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      type: 'bid',
      amount,
      status: 'pending',
      isSandbox: this.SANDBOX_MODE,
      createdAt: new Date()
    };
    
    // Update wallet balance (in sandbox mode)
    if (this.SANDBOX_MODE) {
      wallet.balance -= amount;
      wallet.transactions.push(transaction);
      wallet.updatedAt = new Date();
    }
    
    return transaction;
  }
  
  static async refundBid(userId: string, transactionId: string): Promise<Transaction> {
    // TODO: Implement refund logic
    const wallet = await this.getWallet(userId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    const originalTransaction = wallet.transactions.find(t => t.id === transactionId);
    if (!originalTransaction) {
      throw new Error('Transaction not found');
    }
    
    const refundTransaction: Transaction = {
      id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId: originalTransaction.productId,
      type: 'refund',
      amount: originalTransaction.amount,
      status: 'completed',
      isSandbox: this.SANDBOX_MODE,
      createdAt: new Date()
    };
    
    // Refund balance (in sandbox mode)
    if (this.SANDBOX_MODE) {
      wallet.balance += originalTransaction.amount;
      wallet.transactions.push(refundTransaction);
      wallet.updatedAt = new Date();
    }
    
    return refundTransaction;
  }
  
  static isSandboxMode(): boolean {
    return this.SANDBOX_MODE;
  }
  
  static getSandboxMessage(): string {
    return this.SANDBOX_MODE 
      ? "No real money involved (Beta)" 
      : "Real transactions enabled";
  }
}
