// Real Wallet Service - MVP Implementation
import { supabase } from '../config/supabaseClient';

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
  private static readonly SANDBOX_MODE = true;
  
  static async getWallet(userId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('WalletService: Failed to fetch wallet:', error);
        return null;
      }

      if (!data) {
        // Create new wallet
        return await this.createWallet(userId);
      }

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return {
        userId: data.user_id,
        balance: data.balance,
        isSandbox: data.is_sandbox,
        transactions: transactions?.map(t => ({
          id: t.id,
          userId: t.user_id,
          productId: t.product_id,
          type: t.type,
          amount: t.amount,
          status: t.status,
          isSandbox: t.is_sandbox,
          createdAt: new Date(t.created_at)
        })) || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('WalletService: Error fetching wallet:', error);
      return null;
    }
  }

  static async createWallet(userId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: this.SANDBOX_MODE ? 1000 : 0,
          is_sandbox: this.SANDBOX_MODE
        })
        .select('*')
        .single();

      if (error) {
        console.error('WalletService: Failed to create wallet:', error);
        return null;
      }

      return {
        userId: data.user_id,
        balance: data.balance,
        isSandbox: data.is_sandbox,
        transactions: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('WalletService: Error creating wallet:', error);
      return null;
    }
  }

  static async addFunds(userId: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('add_wallet_funds', {
        user_id: userId,
        amount: amount
      });

      if (error) {
        console.error('WalletService: Failed to add funds:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('WalletService: Error adding funds:', error);
      return false;
    }
  }

  static async placeBid(userId: string, productId: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('place_bid_transaction', {
        user_id: userId,
        product_id: productId,
        amount: amount
      });

      if (error) {
        console.error('WalletService: Failed to place bid:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('WalletService: Error placing bid:', error);
      return false;
    }
  }

  static async refundBid(userId: string, transactionId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('refund_bid_transaction', {
        user_id: userId,
        transaction_id: transactionId
      });

      if (error) {
        console.error('WalletService: Failed to refund bid:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('WalletService: Error refunding bid:', error);
      return false;
    }
  }
}
