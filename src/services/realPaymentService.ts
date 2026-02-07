import Razorpay from 'razorpay';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

export interface PaymentRequest {
  amount: number; // in rupees
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  userId: string;
  purpose: 'wallet_topup' | 'auction_payment' | 'security_deposit' | 'commission';
  auctionId?: string;
  bidId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  amount?: number;
  error?: string;
  requiresAction?: boolean;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  gateway_transaction_id?: string;
  auction_id?: string;
  bid_id?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionCalculation {
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  sellerAmount: number;
  platformAmount: number;
  gstAmount: number;
}

class RealPaymentService {
  private static instance: RealPaymentService;
  private razorpay: Razorpay | null = null;

  static getInstance(): RealPaymentService {
    if (!RealPaymentService.instance) {
      RealPaymentService.instance = new RealPaymentService();
    }
    return RealPaymentService.instance;
  }

  constructor() {
    // Initialize Razorpay with production keys
    if (typeof window !== 'undefined' && process.env.VITE_RAZORPAY_KEY_ID) {
      this.razorpay = new Razorpay({
        key_id: process.env.VITE_RAZORPAY_KEY_ID,
        key_secret: process.env.VITE_RAZORPAY_KEY_SECRET
      });
    }
  }

  /**
   * Create Razorpay order for payment
   */
  async createPaymentOrder(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate request
      if (!request.amount || request.amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount'
        };
      }

      if (!request.userId) {
        return {
          success: false,
          error: 'User ID required'
        };
      }

      // Convert amount to paise (Razorpay uses paise)
      const amountPaise = Math.round(request.amount * 100);

      // Create order in backend
      const orderData = {
        amount: amountPaise,
        currency: request.currency || 'INR',
        receipt: request.receipt || `receipt_${Date.now()}`,
        notes: {
          ...request.notes,
          userId: request.userId,
          purpose: request.purpose,
          auctionId: request.auctionId || '',
          bidId: request.bidId || '',
          timestamp: new Date().toISOString()
        }
      };

      // Call backend to create Razorpay order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const order = await response.json();

      // Store pending transaction in database
      await this.storePendingTransaction({
        userId: request.userId,
        amount: request.amount,
        purpose: request.purpose,
        orderId: order.id,
        auctionId: request.auctionId,
        bidId: request.bidId,
        status: 'pending'
      });

      return {
        success: true,
        orderId: order.id,
        amount: request.amount
      };

    } catch (error) {
      console.error('Error creating payment order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment order'
      };
    }
  }

  /**
   * Process payment using Razorpay checkout
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create order first
      const orderResult = await this.createPaymentOrder(request);
      
      if (!orderResult.success || !orderResult.orderId) {
        return orderResult;
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(request.amount * 100),
        currency: request.currency || 'INR',
        name: 'QuickBid',
        description: this.getPaymentDescription(request.purpose),
        order_id: orderResult.orderId,
        handler: async (response: any) => {
          // Handle successful payment
          const result = await this.verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            userId: request.userId,
            amount: request.amount,
            purpose: request.purpose,
            auctionId: request.auctionId,
            bidId: request.bidId
          });

          if (result.success) {
            toast.success('Payment processed successfully!', {
              duration: 3000
            });
          } else {
            toast.error('Payment verification failed', {
              duration: 3000
            });
          }

          return result;
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled', {
              duration: 2000
            });
          },
          escape: true,
          backdropclose: false,
          confirm_close: true,
          handle_back: true,
          animation: 'slideFromBottom'
        },
        prefill: {
          name: '', // Will be filled from user profile
          email: '', // Will be filled from user profile
          contact: '' // Will be filled from user profile
        },
        notes: {
          ...request.notes,
          userId: request.userId,
          purpose: request.purpose,
          auctionId: request.auctionId || '',
          bidId: request.bidId || '',
          timestamp: new Date().toISOString()
        },
        theme: {
          color: '#3399cc'
        }
      };

      // Get user details for prefill
      const { data: user } = await supabase
        .from('user_profiles')
        .select('name, email, phone')
        .eq('id', request.userId)
        .single();

      if (user) {
        options.prefill.name = user.name || '';
        options.prefill.email = user.email || '';
        options.prefill.contact = user.phone || '';
      }

      // Open checkout
      if (this.razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }

      return {
        success: true,
        orderId: orderResult.orderId,
        requiresAction: true
      };

    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Verify payment signature and update records
   */
  async verifyPayment(paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    userId: string;
    amount: number;
    purpose: string;
    auctionId?: string;
    bidId?: string;
  }): Promise<PaymentResult> {
    try {
      // Call backend to verify payment
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentData.orderId,
          paymentId: paymentData.paymentId,
          signature: paymentData.signature
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const verification = await response.json();

      if (verification.verified) {
        // Update transaction status
        await this.updateTransactionStatus(paymentData.orderId, 'completed');

        // Process based on purpose
        await this.processPaymentPurpose(paymentData);

        return {
          success: true,
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          signature: paymentData.signature,
          amount: paymentData.amount
        };
      } else {
        await this.updateTransactionStatus(paymentData.orderId, 'failed');
        return {
          success: false,
          error: 'Payment verification failed'
        };
      }

    } catch (error) {
      console.error('Error verifying payment:', error);
      await this.updateTransactionStatus(paymentData.orderId, 'failed');
      return {
        success: false,
        error: error.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Process payment based on purpose
   */
  private async processPaymentPurpose(paymentData: {
    userId: string;
    amount: number;
    purpose: string;
    auctionId?: string;
    bidId?: string;
  }): Promise<void> {
    switch (paymentData.purpose) {
      case 'wallet_topup':
        await this.processWalletTopup(paymentData.userId, paymentData.amount);
        break;
      case 'auction_payment':
        await this.processAuctionPayment(paymentData);
        break;
      case 'security_deposit':
        await this.processSecurityDeposit(paymentData);
        break;
      case 'commission':
        await this.processCommission(paymentData);
        break;
    }
  }

  /**
   * Process wallet topup
   */
  private async processWalletTopup(userId: string, amount: number): Promise<void> {
    try {
      // Add funds to user wallet
      const { error } = await supabase.rpc('add_wallet_balance', {
        p_user_id: userId,
        p_amount_cents: Math.round(amount * 100)
      });

      if (error) throw error;

      toast.success(`₹${amount.toLocaleString()} added to wallet`, {
        duration: 3000
      });

    } catch (error) {
      console.error('Error processing wallet topup:', error);
      throw error;
    }
  }

  /**
   * Process auction payment (when user wins auction)
   */
  private async processAuctionPayment(paymentData: {
    userId: string;
    amount: number;
    auctionId?: string;
    bidId?: string;
  }): Promise<void> {
    try {
      if (!paymentData.auctionId) {
        throw new Error('Auction ID required for auction payment');
      }

      // Calculate commission
      const commission = this.calculateCommission(paymentData.amount);

      // Deduct from wallet and transfer to seller
      const { error } = await supabase.rpc('process_auction_payment', {
        p_buyer_id: paymentData.userId,
        p_auction_id: paymentData.auctionId,
        p_amount_cents: Math.round(paymentData.amount * 100),
        p_commission_cents: Math.round(commission.commissionAmount * 100)
      });

      if (error) throw error;

      toast.success('Auction payment processed successfully', {
        duration: 3000
      });

    } catch (error) {
      console.error('Error processing auction payment:', error);
      throw error;
    }
  }

  /**
   * Process security deposit
   */
  private async processSecurityDeposit(paymentData: {
    userId: string;
    amount: number;
    auctionId?: string;
    bidId?: string;
  }): Promise<void> {
    try {
      // Security deposit is handled during bid placement
      // This is just for record keeping
      console.log('Security deposit processed:', paymentData);
    } catch (error) {
      console.error('Error processing security deposit:', error);
    }
  }

  /**
   * Process commission payment
   */
  private async processCommission(paymentData: {
    userId: string;
    amount: number;
    auctionId?: string;
    bidId?: string;
  }): Promise<void> {
    try {
      // Commission is calculated and deducted during auction payment
      console.log('Commission processed:', paymentData);
    } catch (error) {
      console.error('Error processing commission:', error);
    }
  }

  /**
   * Calculate platform commission
   */
  calculateCommission(amount: number): CommissionCalculation {
    const commissionRate = 0.05; // 5% commission
    const gstRate = 0.18; // 18% GST on commission

    const commissionAmount = amount * commissionRate;
    const gstAmount = commissionAmount * gstRate;
    const totalCommission = commissionAmount + gstAmount;
    const sellerAmount = amount - totalCommission;
    const platformAmount = totalCommission;

    return {
      totalAmount: amount,
      commissionRate: commissionRate * 100,
      commissionAmount,
      sellerAmount,
      platformAmount,
      gstAmount
    };
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_available_cents')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return Number(data?.wallet_available_cents || 0) / 100; // Convert cents to rupees
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return [];
    }
  }

  /**
   * Store pending transaction
   */
  private async storePendingTransaction(transaction: {
    userId: string;
    amount: number;
    purpose: string;
    orderId: string;
    auctionId?: string;
    bidId?: string;
    status: string;
  }): Promise<void> {
    try {
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: transaction.userId,
          amount: transaction.amount,
          transaction_type: 'credit',
          status: transaction.status,
          payment_method: 'razorpay',
          gateway_transaction_id: transaction.orderId,
          auction_id: transaction.auctionId,
          bid_id: transaction.bidId,
          description: this.getPaymentDescription(transaction.purpose)
        });
    } catch (error) {
      console.error('Error storing pending transaction:', error);
    }
  }

  /**
   * Update transaction status
   */
  private async updateTransactionStatus(orderId: string, status: string): Promise<void> {
    try {
      await supabase
        .from('wallet_transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('gateway_transaction_id', orderId);
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  }

  /**
   * Get payment description
   */
  private getPaymentDescription(purpose: string): string {
    switch (purpose) {
      case 'wallet_topup':
        return 'Wallet Top-up';
      case 'auction_payment':
        return 'Auction Payment';
      case 'security_deposit':
        return 'Security Deposit';
      case 'commission':
        return 'Platform Commission';
      default:
        return 'Payment';
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: amount ? Math.round(amount * 100) : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      const refund = await response.json();

      return {
        success: true,
        paymentId: refund.id,
        amount: amount || (refund.amount / 100)
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error.message || 'Refund failed'
      };
    }
  }
}

export const realPaymentService = RealPaymentService.getInstance();
