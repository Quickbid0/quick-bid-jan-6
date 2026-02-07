import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

export interface Auction {
  id: string;
  product_id: string;
  seller_id: string;
  start_price: number;
  current_price: number;
  reserve_price?: number;
  min_increment: number;
  end_time: string;
  status: 'draft' | 'live' | 'ended' | 'cancelled';
  bids_count: number;
  winner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'manual' | 'auto' | 'admin_override';
  created_at: string;
  meta?: any;
}

export interface PlaceBidRequest {
  auctionId: string;
  userId: string;
  amount: number;
  type?: 'manual' | 'auto';
}

export interface PlaceBidResult {
  success: boolean;
  bid?: Bid;
  error?: string;
  requiresApproval?: boolean;
  insufficientFunds?: boolean;
  belowMinIncrement?: boolean;
  auctionEnded?: boolean;
}

export interface AuctionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class RealAuctionService {
  private static instance: RealAuctionService;

  static getInstance(): RealAuctionService {
    if (!RealAuctionService.instance) {
      RealAuctionService.instance = new RealAuctionService();
    }
    return RealAuctionService.instance;
  }

  /**
   * Validate auction before bidding
   */
  async validateAuctionForBidding(auctionId: string, userId: string): Promise<AuctionValidation> {
    const validation: AuctionValidation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Get auction details
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (auctionError || !auction) {
        validation.isValid = false;
        validation.errors.push('Auction not found');
        return validation;
      }

      // Check auction status
      if (auction.status !== 'live') {
        validation.isValid = false;
        validation.errors.push(`Auction is ${auction.status}`);
        return validation;
      }

      // Check if auction has ended
      if (new Date(auction.end_time) <= new Date()) {
        validation.isValid = false;
        validation.errors.push('Auction has ended');
        return validation;
      }

      // Check if user is the seller
      if (auction.seller_id === userId) {
        validation.isValid = false;
        validation.errors.push('You cannot bid on your own auction');
        return validation;
      }

      // Get user details
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        validation.isValid = false;
        validation.errors.push('User profile not found');
        return validation;
      }

      // Check KYC status
      if (user.kyc_status !== 'verified') {
        validation.isValid = false;
        validation.errors.push('KYC verification required to bid');
        return validation;
      }

      // Check wallet balance
      const walletBalance = Number(user.wallet_available_cents || 0) / 100; // Convert cents to rupees
      if (walletBalance < auction.start_price) {
        validation.isValid = false;
        validation.errors.push('Insufficient wallet balance');
        return validation;
      }

      // Check for existing bids
      const { data: existingBids, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (bidsError) {
        validation.warnings.push('Could not check existing bids');
      }

      // Check if user is already winning
      if (existingBids && existingBids.length > 0) {
        const highestBid = await this.getHighestBid(auctionId);
        if (highestBid && highestBid.user_id === userId) {
          validation.warnings.push('You are currently the highest bidder');
        }
      }

      return validation;

    } catch (error) {
      validation.isValid = false;
      validation.errors.push('Validation failed: ' + error.message);
      return validation;
    }
  }

  /**
   * Calculate minimum bid amount
   */
  async calculateMinimumBid(auctionId: string): Promise<number> {
    try {
      const { data: auction } = await supabase
        .from('auctions')
        .select('current_price, min_increment, start_price')
        .eq('id', auctionId)
        .single();

      if (!auction) {
        throw new Error('Auction not found');
      }

      const currentPrice = Number(auction.current_price) || Number(auction.start_price);
      const minIncrement = Number(auction.min_increment) || 0;
      
      return currentPrice + minIncrement;
    } catch (error) {
      console.error('Error calculating minimum bid:', error);
      throw error;
    }
  }

  /**
   * Get highest bid for auction
   */
  async getHighestBid(auctionId: string): Promise<Bid | null> {
    try {
      const { data: bids, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .eq('status', 'accepted')
        .order('amount', { ascending: false })
        .limit(1);

      if (error) throw error;
      return bids && bids.length > 0 ? bids[0] : null;
    } catch (error) {
      console.error('Error getting highest bid:', error);
      return null;
    }
  }

  /**
   * Place a bid with comprehensive validation
   */
  async placeBid(request: PlaceBidRequest): Promise<PlaceBidResult> {
    const { auctionId, userId, amount, type = 'manual' } = request;

    try {
      // First validate the auction
      const validation = await this.validateAuctionForBidding(auctionId, userId);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0] || 'Validation failed'
        };
      }

      // Calculate minimum bid
      const minBid = await this.calculateMinimumBid(auctionId);
      if (amount < minBid) {
        return {
          success: false,
          belowMinIncrement: true,
          error: `Minimum bid is ₹${minBid.toLocaleString()}`
        };
      }

      // Get auction details for escrow calculation
      const { data: auction } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (!auction) {
        return {
          success: false,
          error: 'Auction not found'
        };
      }

      // Calculate required deposit (escrow)
      const depositPercent = auction.min_deposit_percent || 10;
      const depositFixed = auction.min_deposit_fixed_cents ? Number(auction.min_deposit_fixed_cents) / 100 : 0;
      const requiredDeposit = Math.max((amount * depositPercent) / 100, depositFixed);

      // Check user wallet balance
      const { data: user } = await supabase
        .from('user_profiles')
        .select('wallet_available_cents, wallet_escrow_cents')
        .eq('id', userId)
        .single();

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const availableBalance = Number(user.wallet_available_cents) / 100; // Convert cents to rupees
      if (availableBalance < requiredDeposit) {
        return {
          success: false,
          insufficientFunds: true,
          error: `Insufficient balance. Required deposit: ₹${requiredDeposit.toLocaleString()}`
        };
      }

      // Place the bid using RPC to ensure transactional integrity
      const { data: bidResult, error: bidError } = await supabase.rpc('place_bid', {
        p_auction_id: auctionId,
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_required_deposit_cents: Math.floor(requiredDeposit * 100) // Convert to cents
      });

      if (bidError) {
        console.error('Bid placement error:', bidError);
        
        // Handle specific error cases
        if (bidError.message.includes('INSUFFICIENT_WALLET')) {
          return {
            success: false,
            insufficientFunds: true,
            error: 'Insufficient wallet balance for this bid'
          };
        }
        
        if (bidError.message.includes('AUCTION_NOT_LIVE')) {
          return {
            success: false,
            auctionEnded: true,
            error: 'Auction is no longer active'
          };
        }

        return {
          success: false,
          error: bidError.message || 'Failed to place bid'
        };
      }

      // Update auction current price if bid was accepted
      if (bidResult.success) {
        await supabase
          .from('auctions')
          .update({ 
            current_price: amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', auctionId);

        // Show success message
        toast.success(`Bid placed: ₹${amount.toLocaleString()}`, {
          duration: 3000,
          position: 'top-center'
        });

        return {
          success: true,
          bid: bidResult.bid,
          requiresApproval: bidResult.requires_approval || false
        };
      } else {
        return {
          success: false,
          error: bidResult.error || 'Bid was not accepted'
        };
      }

    } catch (error) {
      console.error('Place bid error:', error);
      return {
        success: false,
        error: 'Connection error. Please try again.'
      };
    }
  }

  /**
   * Get auction with full details including product and seller info
   */
  async getAuctionDetails(auctionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          product:products(*),
          seller:user_profiles(id, name, avatar_url, is_verified),
          bids(
            id,
            amount,
            user_id,
            status,
            created_at,
            user:user_profiles(id, name)
          )
        `)
        .eq('id', auctionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting auction details:', error);
      throw error;
    }
  }

  /**
   * Get user's bidding history
   */
  async getUserBiddingHistory(userId: string, limit: number = 50): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          auction:auctions(id, end_time, status, product:products(title, images)),
          product:products(title, images)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting bidding history:', error);
      return [];
    }
  }

  /**
   * Get active auctions for user
   */
  async getActiveAuctions(userId?: string): Promise<Auction[]> {
    try {
      let query = supabase
        .from('auctions')
        .select(`
          *,
          product:products(title, images, category),
          seller:user_profiles(name, avatar_url),
          bids_count
        `)
        .eq('status', 'live')
        .gt('end_time', new Date().toISOString())
        .order('end_time', { ascending: true });

      if (userId) {
        query = query.neq('seller_id', userId); // Exclude user's own auctions
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active auctions:', error);
      return [];
    }
  }

  /**
   * End auction and determine winner
   */
  async endAuction(auctionId: string, adminId?: string): Promise<void> {
    try {
      const { data: auction } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.status === 'ended') {
        return; // Already ended
      }

      // Get highest bid
      const highestBid = await this.getHighestBid(auctionId);
      
      // Update auction status
      await supabase
        .from('auctions')
        .update({ 
          status: 'ended',
          winner_id: highestBid?.user_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      // Release escrow for non-winning bids
      if (highestBid) {
        await this.releaseEscrowForLosers(auctionId, highestBid.id);
        
        // Notify winner
        toast.success(`Auction ended! Winner: ${highestBid.user_id}`, {
          duration: 5000
        });
      } else {
        toast.error('Auction ended with no bids', {
          duration: 3000
        });
      }

    } catch (error) {
      console.error('Error ending auction:', error);
      throw error;
    }
  }

  /**
   * Release escrow funds for non-winning bids
   */
  private async releaseEscrowForLosers(auctionId: string, winningBidId: string): Promise<void> {
    try {
      // Get all losing bids
      const { data: losingBids, error } = await supabase
        .from('bids')
        .select('user_id, meta')
        .eq('auction_id', auctionId)
        .eq('status', 'accepted')
        .neq('id', winningBidId);

      if (error) throw error;

      // Release escrow for each loser
      for (const bid of losingBids || []) {
        const depositAmount = bid.meta?.depositSnapshot?.minRequiredEscrowCents || 0;
        
        if (depositAmount > 0) {
          await supabase.rpc('release_escrow', {
            p_user_id: bid.user_id,
            p_amount_cents: depositAmount
          });
        }
      }
    } catch (error) {
      console.error('Error releasing escrow:', error);
    }
  }

  /**
   * Get auction statistics
   */
  async getAuctionStats(auctionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('amount, user_id, created_at')
        .eq('auction_id', auctionId)
        .eq('status', 'accepted')
        .order('amount', { ascending: false });

      if (error) throw error;

      const bids = data || [];
      const uniqueBidders = new Set(bids.map(b => b.user_id)).size;
      const totalBids = bids.length;
      const highestBid = bids[0]?.amount || 0;
      const lowestBid = bids[bids.length - 1]?.amount || 0;
      const averageBid = totalBids > 0 ? bids.reduce((sum, b) => sum + b.amount, 0) / totalBids : 0;

      return {
        totalBids,
        uniqueBidders,
        highestBid,
        lowestBid,
        averageBid,
        bidHistory: bids
      };
    } catch (error) {
      console.error('Error getting auction stats:', error);
      return {
        totalBids: 0,
        uniqueBidders: 0,
        highestBid: 0,
        lowestBid: 0,
        averageBid: 0,
        bidHistory: []
      };
    }
  }
}

export const realAuctionService = RealAuctionService.getInstance();
