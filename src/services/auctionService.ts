import { supabase } from '../config/supabaseClient';
import { notificationService } from './notificationService';
import { paymentService } from './paymentService';
import { aiService } from './aiService';
import { bidSchema, uuidSchema, priceSchema } from '../lib/validation';
import { errorHandler, createValidationError, createNetworkError, createNotFoundError, ApplicationError } from '../lib/errorHandler';

export interface AuctionData {
  productId: string;
  auctionType: 'live' | 'timed' | 'tender';
  startTime: string;
  endTime: string;
  startingPrice: number;
  reservePrice?: number;
  incrementAmount?: number;
  streamUrl?: string;
}

export interface BidData {
  auctionId: string;
  userId: string;
  amount: number;
  bidType?: 'regular' | 'auto' | 'sealed';
  maxAmount?: number;
}

class AuctionService {
  // Get system setting helper
  async getSystemSetting(key: string, defaultValue: any = null): Promise<any> {
    try {
      // First try to fetch as key-value pair
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .maybeSingle();

      if (!error && data) {
        try {
          return JSON.parse(data.setting_value);
        } catch {
          return data.setting_value;
        }
      }

      // Fallback: try to fetch as column in single-row table (legacy support)
      const { data: rowData, error: rowError } = await supabase
        .from('system_settings')
        .select(key)
        .limit(1)
        .maybeSingle();

      if (!rowError && rowData && rowData[key] !== undefined) {
        return rowData[key];
      }

      return defaultValue;
    } catch (e) {
      console.warn(`getSystemSetting failed for ${key}`, e);
      return defaultValue;
    }
  }

  // Create new auction
  async createAuction(auctionData: AuctionData, sellerId: string): Promise<string | null> {
    try {
      // Seller restriction guard (cooldown / blocks)
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const resp = await fetch(`/api/risk/sellers/${sellerId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (resp.ok) {
            const body = await resp.json();
            const status = (body.status || 'normal') as 'normal' | 'limited' | 'blocked' | 'flagged';
            const cooldownActive = !!(body.cooldownActive ?? body.cooldown_active);
            if (status === 'blocked' || (status === 'limited' && cooldownActive)) {
              console.warn('createAuction blocked by seller restriction', { sellerId, status, cooldownActive });
              return null;
            }
          }
        }
      } catch (e) {
        console.warn('auctionService.createAuction: failed to check seller restriction', e);
      }

      const { data, error } = await supabase
        .from('auctions')
        .insert([{
          product_id: auctionData.productId,
          auction_type: auctionData.auctionType,
          start_date: auctionData.startTime,
          end_date: auctionData.endTime,
          starting_price: auctionData.startingPrice,
          current_price: auctionData.startingPrice,
          reserve_price: auctionData.reservePrice,
          increment_amount: auctionData.incrementAmount || 100,
          stream_url: auctionData.streamUrl,
          seller_id: sellerId,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update product status
      await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', auctionData.productId);

      return data.id;
    } catch (error) {
      console.error('Error creating auction:', error);
      return null;
    }
  }

  // Approve winner for an auction that is in pending_approval status.
  // This finalizes the sale: pays commission, refunds losing deposits, and notifies winner.
  async approveAuctionWinner(auctionId: string): Promise<boolean> {
    try {
      const { data: auction } = await supabase
        .from('auctions')
        .select(`
          *,
          bids(user_id, amount, security_deposit)
        `)
        .eq('id', auctionId)
        .single();

      if (!auction || auction.status !== 'pending_approval' || !auction.winner_id || !auction.final_price) {
        return false;
      }

      const bids = auction.bids || [];
      const winningBid = bids.find((b: any) => b.user_id === auction.winner_id) || null;
      if (!winningBid) {
        return false;
      }

      // Move auction to ended
      await supabase
        .from('auctions')
        .update({
          status: 'ended',
          actual_end_time: new Date().toISOString()
        })
        .eq('id', auctionId);

      // Fund escrow from winner's wallet for the final price
      try {
        const escrowResponse = await fetch('/.netlify/functions/escrow-fund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auctionId,
            buyerId: auction.winner_id,
            sellerId: auction.seller_id,
            amountCents: Math.round(auction.final_price * 100),
          }),
        });
        if (!escrowResponse.ok) {
          console.error('escrow-fund failed in approveAuctionWinner', auctionId);
        }
      } catch (e) {
        console.error('escrow-fund request error in approveAuctionWinner', auctionId, e);
      }

      // Process commission based on final_price
      await paymentService.processCommission(auction.seller_id, auction.final_price, auctionId);

      // Refund losing bidders
      const autoRefundEnabled = await this.getSystemSetting('auto_refund_enabled', true);
      
      if (autoRefundEnabled) {
        const losingBids = bids.filter((bid: any) => bid.user_id !== auction.winner_id) || [];
        for (const bid of losingBids) {
          if (bid.security_deposit && bid.security_deposit > 0) {
            try {
              const releaseResponse = await fetch('/.netlify/functions/wallet-release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: bid.user_id,
                  amountCents: Math.round(bid.security_deposit * 100),
                  refType: 'auction_security_deposit',
                  refId: auctionId,
                }),
              });
              if (!releaseResponse.ok) {
                console.error('wallet-release failed for losing bidder', bid.user_id, auctionId);
              }
            } catch (e) {
              console.error('wallet-release request error for losing bidder', bid.user_id, auctionId, e);
            }
          }
        }
      } else {
        console.info(`Auto-refund disabled. Losing bidders for auction ${auctionId} were not refunded automatically.`);
      }

      // Notify winner
      await notificationService.sendNotification({
        userId: auction.winner_id,
        title: 'Congratulations! You Won!',
        message: `You won this auction with a bid of ${auction.final_price.toLocaleString()}. We will send an SMS to your registered mobile with your winner/claim ID. Please keep that SMS or a clear screenshot, and carry a valid government photo ID when you come for delivery or pickup. If home delivery is available, you must pay the full winning amount and applicable delivery charges to QuickMela before dispatch. If delivery is not available, you will need to pick up the vehicle from the nearest QuickMela yard/branch. Note: standard refund policy does not apply after you are declared the winner. You can also view full winner instructions at /winner/${auctionId}.`,
        type: 'bid_won',
        auctionId
      });

      return true;
    } catch (error) {
      console.error('Error approving auction winner:', error);
      return false;
    }
  }

  // Place bid
  async placeBid(bidData: BidData): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input data
      const validationResult = bidSchema.safeParse(bidData);
      if (!validationResult.success) {
        return { 
          success: false, 
          error: validationResult.error.errors.map(e => e.message).join(', ') 
        };
      }

      // Validate UUIDs
      const auctionIdValid = uuidSchema.safeParse(bidData.auctionId);
      if (!auctionIdValid.success) {
        return { success: false, error: 'Invalid auction ID' };
      }

      // Validate bid amount
      const amountValid = priceSchema.safeParse(bidData.amount);
      if (!amountValid.success) {
        return { success: false, error: 'Invalid bid amount' };
      }

      // Fraud detection check
      const fraudCheck = await aiService.detectFraud(bidData.userId, bidData.amount, bidData.auctionId);
      
      if (fraudCheck.recommendation === 'reject') {
        return { success: false, error: 'Bid rejected due to security concerns' };
      }

      // Check wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', bidData.userId)
        .single();

      const securityDeposit = bidData.amount * 0.1; // 10% security deposit
      const requiredAmount = bidData.amount + securityDeposit;

      if (!wallet || wallet.balance < requiredAmount) {
        return { success: false, error: 'Insufficient wallet balance' };
      }

      // Hold security deposit via wallet ledger (Netlify function)
      try {
        const holdResponse = await fetch('/.netlify/functions/wallet-hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: bidData.userId,
            amountCents: Math.round(securityDeposit * 100),
            refType: 'auction_security_deposit',
            refId: bidData.auctionId,
          }),
        });

        if (!holdResponse.ok) {
          let message = 'Failed to hold security deposit';
          try {
            const body = await holdResponse.json();
            if (body?.error) message = body.error;
          } catch {
            // ignore JSON parse errors
          }
          return { success: false, error: message };
        }
      } catch (e) {
        console.error('wallet-hold request failed', e);
        return { success: false, error: 'Could not reserve security deposit. Please try again.' };
      }

      // Place bid
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .insert([{
          auction_id: bidData.auctionId,
          user_id: bidData.userId,
          amount: bidData.amount,
          bid_type: bidData.bidType || 'regular',
          max_amount: bidData.maxAmount,
          security_deposit: securityDeposit,
          status: 'active'
        }])
        .select()
        .single();

      if (bidError) throw bidError;

      // Update auction current price
      await supabase
        .from('auctions')
        .update({ current_price: bidData.amount })
        .eq('id', bidData.auctionId);

      // Send notifications
      await notificationService.sendBidNotifications(bidData.auctionId, bidData.amount, bidData.userId);

      // Consent-gated WhatsApp/SMS outbid notifications via notification_events queue
      // Resolve product id from auction
      try {
        const { data: auct } = await supabase
          .from('auctions')
          .select('product_id')
          .eq('id', bidData.auctionId)
          .single();
        const productId = (auct as any)?.product_id;
        if (productId) {
          await notificationService.enqueueOutbidEvents(productId, bidData.amount, bidData.userId);
        }
      } catch (e) {
        console.warn('enqueue outbid events failed', e);
      }

      // Fire-and-forget referral bonus for first bid (non-blocking)
      try {
        if ((bid as any)?.id) {
          fetch('/api/referral/apply-first-bid-bonus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: bidData.userId,
              bidId: (bid as any).id,
            }),
          }).catch((err) => {
            console.warn('apply-first-bid-bonus request error (ignored)', err);
          });
        }
      } catch (e) {
        console.warn('apply-first-bid-bonus unexpected error (ignored)', e);
      }

      return { success: true };
    } catch (error) {
      const appError = errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)), 
        'placeBid', 
        bidData.userId
      );
      
      // Return user-friendly error message
      const userMessage = appError.type === 'VALIDATION' 
        ? appError.message 
        : 'Failed to place bid. Please try again.';
        
      return { success: false, error: userMessage };
    }
  }

  // End auction
  // If options.autoApprove is false and reserve is met, the auction will be moved to
  // 'pending_approval' with a winner set, but commission/refunds/notifications are deferred.
  async endAuction(auctionId: string, options?: { autoApprove?: boolean }): Promise<boolean> {
    try {
      const autoApprove = options?.autoApprove ?? true;
      // Get auction details
      const { data: auction } = await supabase
        .from('auctions')
        .select(`
          *,
          bids(user_id, amount, security_deposit)
        `)
        .eq('id', auctionId)
        .single();

      if (!auction) return false;

      const bids = auction.bids || [];

      // Find highest bid, if any
      const winningBid = bids.length
        ? bids.reduce((highest: any, current: any) =>
            current.amount > highest.amount ? current : highest
          )
        : null;

      const reservePrice: number | null = auction.reserve_price ?? null;

      // No bids at all: just mark auction ended with no winner
      if (!winningBid) {
        await supabase
          .from('auctions')
          .update({
            status: 'ended',
            winner_id: null,
            final_price: null,
            actual_end_time: new Date().toISOString()
          })
          .eq('id', auctionId);

        return true;
      }

      // Reserve price logic: if reserve is set and highest bid is below it,
      // end the auction without a winner and refund all bidders' deposits.
      if (reservePrice !== null && winningBid.amount < reservePrice) {
        await supabase
          .from('auctions')
          .update({
            status: 'ended',
            winner_id: null,
            final_price: null,
            actual_end_time: new Date().toISOString()
          })
          .eq('id', auctionId);

        // Refund security deposits for all bidders since no sale happens
        for (const bid of bids) {
          if (bid.security_deposit && bid.security_deposit > 0) {
            try {
              const releaseResponse = await fetch('/.netlify/functions/wallet-release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: bid.user_id,
                  amountCents: Math.round(bid.security_deposit * 100),
                  refType: 'auction_security_deposit',
                  refId: auctionId,
                }),
              });
              if (!releaseResponse.ok) {
                console.error('wallet-release failed for reserve-not-met bidder', bid.user_id, auctionId);
              }
            } catch (e) {
              console.error('wallet-release request error for reserve-not-met bidder', bid.user_id, auctionId, e);
            }
          }
        }

        // Optionally notify top bidder that reserve was not met
        await notificationService.sendNotification({
          userId: winningBid.user_id,
          title: 'Reserve not met',
          message: 'Your bid was the highest but did not meet the seller\'s reserve price. No sale was made.',
          type: 'auction_ending',
          auctionId
        });

        return true;
      }

      // Reserve met (or no reserve set)
      if (!autoApprove) {
        // Manual approval mode: record the winner and final_price, but leave status as pending_approval
        await supabase
          .from('auctions')
          .update({
            status: 'pending_approval',
            winner_id: winningBid.user_id,
            final_price: winningBid.amount,
            actual_end_time: new Date().toISOString()
          })
          .eq('id', auctionId);

        // No commission, refunds, or notifications yet – these will be handled by approveAuctionWinner
        return true;
      }

      // Auto-approval flow: reserve met (or no reserve set) and autoApprove=true
      await supabase
        .from('auctions')
        .update({
          status: 'ended',
          winner_id: winningBid.user_id,
          final_price: winningBid.amount,
          actual_end_time: new Date().toISOString()
        })
        .eq('id', auctionId);

      // Fund escrow from winner's wallet for the final price (auto-approval)
      try {
        const escrowResponse = await fetch('/.netlify/functions/escrow-fund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auctionId,
            buyerId: winningBid.user_id,
            sellerId: auction.seller_id,
            amountCents: Math.round(winningBid.amount * 100),
          }),
        });
        if (!escrowResponse.ok) {
          console.error('escrow-fund failed in endAuction auto-approval', auctionId);
        }
      } catch (e) {
        console.error('escrow-fund request error in endAuction auto-approval', auctionId, e);
      }

      // Process payment to seller (commission/settlement)
      await paymentService.processCommission(auction.seller_id, winningBid.amount, auctionId);

      // Refund losing bidders
      const autoRefundEnabled = await this.getSystemSetting('auto_refund_enabled', true);

      if (autoRefundEnabled) {
        const losingBids = bids.filter((bid: any) => bid.user_id !== winningBid.user_id) || [];
        for (const bid of losingBids) {
          if (bid.security_deposit && bid.security_deposit > 0) {
            try {
              const releaseResponse = await fetch('/.netlify/functions/wallet-release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: bid.user_id,
                  amountCents: Math.round(bid.security_deposit * 100),
                  refType: 'auction_security_deposit',
                  refId: auctionId,
                }),
              });
              if (!releaseResponse.ok) {
                console.error('wallet-release failed for auto-approval losing bidder', bid.user_id, auctionId);
              }
            } catch (e) {
              console.error('wallet-release request error for auto-approval losing bidder', bid.user_id, auctionId, e);
            }
          }
        }
      } else {
        console.info(`Auto-refund disabled. Losing bidders for auction ${auctionId} were not refunded automatically.`);
      }

      // Send winner notification
      await notificationService.sendNotification({
        userId: winningBid.user_id,
        title: 'Congratulations! You Won!',
        message: `You won this auction with a bid of ${winningBid.amount.toLocaleString()}. We will send an SMS to your registered mobile with your winner/claim ID. Please keep that SMS or a clear screenshot, and carry a valid government photo ID when you come for delivery or pickup. If home delivery is available, you must pay the full winning amount and applicable delivery charges to QuickMela before dispatch. If delivery is not available, you will need to pick up the vehicle from the nearest QuickMela yard/branch. Note: standard refund policy does not apply after you are declared the winner. You can also view full winner instructions at /winner/${auctionId}.`,
        type: 'bid_won',
        auctionId
      });

      return true;
    } catch (error) {
      console.error('Error ending auction:', error);
      return false;
    }
  }

  // Get active auctions
  async getActiveAuctions(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          product:products(*),
          seller:profiles(id, name, is_verified, avatar_url, kyc_status)
        `)
        .in('status', ['active', 'live'])
        .order('end_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      const auctions = data || [];

      // Enrich with seller_metrics so frontends can show trust/earnings without extra queries
      const sellerIds = Array.from(
        new Set(
          auctions
            .map((a: any) => a.seller?.id)
            .filter(Boolean),
        ),
      ) as string[];

      const metricsBySellerId: Record<string, { total_auctions: number | null; total_sales: number | null }> = {};
      if (sellerIds.length > 0) {
        const { data: metrics, error: metricsError } = await supabase
          .from('seller_metrics')
          .select('seller_id, total_auctions, total_sales')
          .in('seller_id', sellerIds);

        if (metricsError) {
          console.error('Error loading seller_metrics for active auctions', metricsError);
        } else {
          (metrics || []).forEach((m: any) => {
            metricsBySellerId[String(m.seller_id)] = {
              total_auctions: m.total_auctions != null ? Number(m.total_auctions) : null,
              total_sales: m.total_sales != null ? Number(m.total_sales) : null,
            };
          });
        }
      }

      const enriched = auctions.map((a: any) => ({
        ...a,
        seller_metrics: a.seller?.id ? metricsBySellerId[String(a.seller.id)] || { total_auctions: null, total_sales: null } : { total_auctions: null, total_sales: null },
      }));

      return enriched;
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      return [];
    }
  }

  // Auto-extend auction if bid placed in final minutes
  async checkAutoExtension(auctionId: string): Promise<void> {
    try {
      const { data: auction } = await supabase
        .from('auctions')
        .select('end_date, increment_amount')
        .eq('id', auctionId)
        .single();

      if (!auction) return;

      const timeLeft = new Date(auction.end_date).getTime() - Date.now();
      const minutesLeft = timeLeft / (1000 * 60);

      // If less than 5 minutes left, extend by 5 minutes
      if (minutesLeft < 5) {
        const newEndTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        
        await supabase
          .from('auctions')
          .update({ end_date: newEndTime })
          .eq('id', auctionId);
      }
    } catch (error) {
      console.error('Error checking auto extension:', error);
    }
  }

  // Monitor auction endings
  async monitorAuctionEndings(): Promise<void> {
    try {
      const { data: endingAuctions } = await supabase
        .from('auctions')
        .select('id')
        .eq('status', 'active')
        .lte('end_date', new Date().toISOString());

      if (endingAuctions) {
        for (const auction of endingAuctions) {
          await this.endAuction(auction.id);
        }
      }
    } catch (error) {
      console.error('Error monitoring auction endings:', error);
    }
  }
}

export const auctionService = new AuctionService();
