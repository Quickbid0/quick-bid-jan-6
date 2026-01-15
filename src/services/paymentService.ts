import { supabase } from '../config/supabaseClient';
import { feeService } from './feeService';

export interface PaymentData {
  userId: string;
  amount: number;
  method: 'card' | 'upi' | 'netbanking' | 'wallet';
  purpose: 'wallet_topup' | 'auction_payment' | 'security_deposit' | 'commission';
  auctionId?: string;
  bidId?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gatewayResponse?: any;
}

class PaymentService {
  // Process payment
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Simulate payment gateway integration
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: paymentData.userId,
          amount: paymentData.amount,
          transaction_type: this.mapPurposeToType(paymentData.purpose),
          status: 'completed',
          payment_method: paymentData.method,
          gateway_transaction_id: transactionId,
          auction_id: paymentData.auctionId,
          bid_id: paymentData.bidId,
          description: this.generateTransactionDescription(paymentData)
        }]);

      if (transactionError) throw transactionError;

      // Update wallet balance for wallet topups
      if (paymentData.purpose === 'wallet_topup') {
        await this.updateWalletBalance(paymentData.userId, paymentData.amount);
      }

      // Best-effort notification for successful payment / wallet event
      try {
        const { title, message, type } = this.buildPaymentNotificationCopy(paymentData);
        await supabase
          .from('notifications')
          .insert([{
            user_id: paymentData.userId,
            type,
            title,
            message,
            metadata: {
              amount: paymentData.amount,
              method: paymentData.method,
              purpose: paymentData.purpose,
              auction_id: paymentData.auctionId,
              bid_id: paymentData.bidId,
              transaction_id: transactionId,
            },
            read: false,
            read_at: null,
          }]);
      } catch (notifErr) {
        console.error('Payment notification error:', notifErr);
      }

      return {
        success: true,
        transactionId
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      const message = error instanceof Error ? error.message : 'Payment failed';
      return {
        success: false,
        error: message
      };
    }
  }

  // Update wallet balance
  async updateWalletBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      const currentBalance = wallet?.balance || 0;
      const newBalance = currentBalance + amount;

      const { error } = await supabase
        .from('wallets')
        .upsert({
          user_id: userId,
          balance: newBalance,
          total_deposited: currentBalance + (amount > 0 ? amount : 0),
          total_withdrawn: currentBalance + (amount < 0 ? Math.abs(amount) : 0)
        });

      return !error;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return false;
    }
  }

  // Process refund
  async processRefund(userId: string, amount: number, reason: string, originalTransactionId?: string): Promise<PaymentResult> {
    try {
      const transactionId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create refund transaction
      const { error } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: userId,
          amount: amount,
          transaction_type: 'refund',
          status: 'completed',
          description: `Refund: ${reason}`,
          metadata: { original_transaction_id: originalTransactionId }
        }]);

      if (error) throw error;

      // Update wallet balance
      await this.updateWalletBalance(userId, amount);

      // Best-effort notification for refund
      try {
        await supabase
          .from('notifications')
          .insert([{
            user_id: userId,
            type: 'wallet',
            title: 'Refund processed',
            message: `A refund of ${amount} has been added to your wallet.`,
            metadata: {
              amount,
              reason,
              original_transaction_id: originalTransactionId,
            },
            read: false,
            read_at: null,
          }]);
      } catch (notifErr) {
        console.error('Refund notification error:', notifErr);
      }

      return {
        success: true,
        transactionId
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      const message = error instanceof Error ? error.message : 'Refund failed';
      return {
        success: false,
        error: message
      };
    }
  }

  // Calculate commission (fallback if no fee rule found)
  calculateCommission(amount: number, rate: number = 5): number {
    return Math.round(amount * (rate / 100));
  }

  // Process commission payment
  async processCommission(sellerId: string, amount: number, auctionId: string): Promise<boolean> {
    try {
      // Resolve auction and product for commission context
      const { data: auction } = await supabase
        .from('auctions')
        .select('product_id')
        .eq('id', auctionId)
        .single();

      const productId: string | null = (auction as any)?.product_id || null;

      let monetizationCategory: string | null = null;
      let monetizationSubCategory: string | null = null;

      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('main_category, category, sub_category')
          .eq('id', productId)
          .single();

        const rawMain = ((product as any)?.main_category || (product as any)?.category || '').toString().toLowerCase();
        const rawSub = ((product as any)?.sub_category || '').toString().toLowerCase();

        if (/vehicle|car|bike|scooter|truck|tractor|bus|commercial|two wheeler|four wheeler/.test(rawMain)) {
          monetizationCategory = 'vehicles';
          if (/premium/.test(rawMain) || /premium/.test(rawSub)) {
            monetizationSubCategory = 'premium_car';
          } else if (/commercial|truck|tractor|bus/.test(rawMain) || /commercial/.test(rawSub)) {
            monetizationSubCategory = 'commercial_vehicle';
          } else if (/bike|scooter|two wheeler/.test(rawMain) || /bike|scooter|two wheeler/.test(rawSub)) {
            monetizationSubCategory = 'two_wheeler';
          } else {
            monetizationSubCategory = 'car';
          }
        } else if (/craft|handmade/.test(rawMain) || /craft|handmade/.test(rawSub)) {
          monetizationCategory = 'handmade_crafts';
          monetizationSubCategory = 'handmade_crafts';
        } else if (/painting|artwork|art/.test(rawMain) || /painting|artwork|art/.test(rawSub)) {
          monetizationCategory = 'paintings_artwork';
          monetizationSubCategory = 'paintings';
        } else if (/sculpture/.test(rawMain) || /sculpture/.test(rawSub)) {
          monetizationCategory = 'paintings_artwork';
          monetizationSubCategory = 'sculptures';
        } else if (/wood/.test(rawMain) || /wood/.test(rawSub)) {
          monetizationCategory = 'paintings_artwork';
          monetizationSubCategory = 'woodwork';
        } else if (/antique|heritage|tribal/.test(rawMain) || /antique|heritage|tribal/.test(rawSub)) {
          monetizationCategory = 'antique_items';
          if (/heritage/.test(rawMain) || /heritage/.test(rawSub)) {
            monetizationSubCategory = 'heritage_items';
          } else if (/tribal/.test(rawMain) || /tribal/.test(rawSub)) {
            monetizationSubCategory = 'tribal_artifacts';
          } else {
            monetizationSubCategory = 'antique_items';
          }
        }
      }

      // Try QuickMela commissions table first
      let commission = 0;
      let commissionRuleId: string | null = null;

      if (monetizationCategory) {
        try {
          const { data: rule } = await supabase
            .from('commissions')
            .select('id, mode, commission_flat, commission_percent, min_commission')
            .eq('category', monetizationCategory)
            .eq('active', true)
            .maybeSingle();

          if (rule) {
            commissionRuleId = (rule as any).id as string;
            const mode = (rule as any).mode as string;
            const flat = Number((rule as any).commission_flat) || 0;
            const percent = Number((rule as any).commission_percent) || 0;
            const minCommission = Number((rule as any).min_commission) || 0;

            if (mode === 'flat') {
              commission = flat;
            } else if (mode === 'percent') {
              commission = Math.round(amount * (percent / 100));
              if (minCommission && commission < minCommission) {
                commission = minCommission;
              }
            }
          }
        } catch (e) {
          console.error('Error fetching commission rule:', e);
        }

        // Fallback to dynamic fee engine (fee_rules) if no QuickMela commission found
        if (!commission) {
          try {
            let categoryId: string | null = null;
            if (productId) {
              const { data: product } = await supabase
                .from('products')
                .select('category_id')
                .eq('id', productId)
                .single();
              categoryId = (product as any)?.category_id || null;
            }

            const appliedRule = await feeService.getActiveRule(categoryId, null);
            if (appliedRule) {
              const ctxProductId = productId ?? undefined;
              const ctxCategoryId = categoryId ?? undefined;
              const comps = feeService.calculateComponents(appliedRule, { productId: ctxProductId, categoryId: ctxCategoryId, amountBase: amount });
              commission = comps.commission || 0;
              await feeService.recordApplication(
                appliedRule.id,
                { productId: ctxProductId, categoryId: ctxCategoryId, amountBase: amount },
                { commission },
                'system',
              );
            }
          } catch (e) {
            console.warn('feeService commission fallback', e);
            commission = this.calculateCommission(amount);
          }
        }
      }

      const listingFeeAmount = 0;
      const boostFeeAmount = 0;
      const verificationFeeAmount = 0;
      const otherFees = 0;

      const netPayout = amount - commission - listingFeeAmount - boostFeeAmount - otherFees;

      const sellerAmount = netPayout;

      const { data: payoutRow, error: payoutError } = await supabase
        .from('payouts')
        .insert([{
          seller_id: sellerId,
          product_id: productId,
          listing_id: null,
          sale_price: amount,
          commission_amount: commission,
          commission_rule_id: commissionRuleId,
          listing_fee_amount: listingFeeAmount,
          boost_fee_amount: boostFeeAmount,
          verification_fee_amount: verificationFeeAmount,
          other_fees: otherFees,
          net_payout: sellerAmount,
          status: 'pending'
        }])
        .select()
        .single();

      if (payoutError) {
        throw payoutError;
      }

      await this.updateWalletBalance(sellerId, sellerAmount);

      await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: sellerId,
          amount: sellerAmount,
          transaction_type: 'payment',
          status: 'completed',
          auction_id: auctionId,
          description: `Auction payment (after ${commission} commission)`
        }]);

      if ((payoutRow as any)?.id) {
        await supabase
          .from('payouts')
          .update({ status: 'completed', paid_at: new Date().toISOString() })
          .eq('id', (payoutRow as any).id as string);
      }

      return true;
    } catch (error) {
      console.error('Commission processing error:', error);
      return false;
    }
  }

  // Get payment history
  async getPaymentHistory(userId: string, limit: number = 50): Promise<any[]> {
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
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  // Helper methods
  private mapPurposeToType(purpose: string): string {
    const mapping = {
      'wallet_topup': 'deposit',
      'auction_payment': 'payment',
      'security_deposit': 'bid_hold',
      'commission': 'commission'
    };
    return mapping[purpose] || 'deposit';
  }

  private generateTransactionDescription(paymentData: PaymentData): string {
    switch (paymentData.purpose) {
      case 'wallet_topup':
        return `Wallet top-up via ${paymentData.method}`;
      case 'auction_payment':
        return 'Auction payment';
      case 'security_deposit':
        return 'Security deposit for bid';
      case 'commission':
        return 'Platform commission';
      default:
        return 'Payment transaction';
    }
  }

  private buildPaymentNotificationCopy(paymentData: PaymentData): { title: string; message: string; type: string } {
    const amount = paymentData.amount;

    switch (paymentData.purpose) {
      case 'wallet_topup':
        return {
          type: 'wallet',
          title: 'Wallet top-up successful',
          message: `Your wallet has been credited with ${amount}.`,
        };
      case 'auction_payment':
        return {
          type: 'payment',
          title: 'Auction payment successful',
          message: `Your payment of ${amount} for the auction has been processed.`,
        };
      case 'security_deposit':
        return {
          type: 'wallet',
          title: 'Security deposit received',
          message: `A security deposit of ${amount} has been recorded for your bidding.`,
        };
      case 'commission':
        return {
          type: 'payment',
          title: 'Commission payment recorded',
          message: `A commission payment of ${amount} has been recorded.`,
        };
      default:
        return {
          type: 'wallet',
          title: 'Wallet transaction completed',
          message: `A wallet transaction of ${amount} has been completed.`,
        };
    }
  }
}

export const paymentService = new PaymentService();
