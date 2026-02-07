import { useEffect, useState, useCallback, useRef } from 'react';
import { getAuctionSocket } from '../services/auctionSocket';
import { AuctionState, Bid, BidResponse } from '../types/auction';

interface UseAuctionSocketOptions {
  auctionId: string;
  userId?: string;
  userName?: string;
  currentPrice?: number;
  incrementAmount?: number;
}

export interface AuctionSocketState {
  connected: boolean;
  auctionState: AuctionState | null;
  bidHistory: Bid[];
  activeUsers: number;
  lastBid: Bid | null;
  isConnecting: boolean;
  error: string | null;
  isRateLimited: boolean;
  lastBidTime: number | null;
  pendingBids: Set<string>; // Track pending bid IDs to prevent duplicates
}

export function useAuctionSocket({ auctionId, userId, userName, currentPrice = 0, incrementAmount = 100 }: UseAuctionSocketOptions) {
  const [state, setState] = useState<AuctionSocketState>({
    connected: false,
    auctionState: null,
    bidHistory: [],
    activeUsers: 0,
    lastBid: null,
    isConnecting: false,
    error: null,
    isRateLimited: false,
    lastBidTime: null,
    pendingBids: new Set(),
  });

  const auctionSocket = getAuctionSocket();
  const rateLimitRef = useRef<{ lastBidTime: number; bidCount: number }>({ lastBidTime: 0, bidCount: 0 });
  const pendingBidsRef = useRef<Set<string>>(new Set());

  // Connect to auction socket
  useEffect(() => {
    if (!auctionId) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const connectSocket = async () => {
      try {
        await auctionSocket.connect(userId, userName);
        auctionSocket.joinAuction(auctionId, userId || 'anonymous', userName || 'Anonymous');

        setState(prev => ({
          ...prev,
          connected: true,
          isConnecting: false,
        }));

        // Get initial auction state
        auctionSocket.getAuctionState(auctionId);
      } catch (error) {
        console.error('Failed to connect to auction socket:', error);
        setState(prev => ({
          ...prev,
          connected: false,
          isConnecting: false,
          error: error instanceof Error ? error.message : 'Failed to connect',
        }));
      }
    };

    connectSocket();

    return () => {
      auctionSocket.leaveAuction(auctionId);
    };
  }, [auctionId, userId, userName]);

  // Set up event listeners
  useEffect(() => {
    if (!auctionId) return;

    // Auction state updates
    const handleAuctionState = (auctionState: AuctionState) => {
      setState(prev => ({
        ...prev,
        auctionState,
        activeUsers: auctionState.activeUsers,
        error: null,
      }));
    };

    // Bid placed events
    const handleBidPlaced = (data: { bid: Bid; auctionState: AuctionState; timestamp: Date }) => {
      setState(prev => ({
        ...prev,
        auctionState: data.auctionState,
        lastBid: data.bid,
        bidHistory: [data.bid, ...prev.bidHistory.slice(0, 49)], // Keep last 50 bids
        error: null,
      }));
    };

    // User join/leave events
    const handleUserJoined = (data: { userId: string; userName: string; timestamp: Date; totalUsers: number }) => {
      setState(prev => ({
        ...prev,
        activeUsers: data.totalUsers,
      }));
    };

    const handleUserLeft = (data: { userId: string; userName: string; timestamp: Date; totalUsers: number }) => {
      setState(prev => ({
        ...prev,
        activeUsers: data.totalUsers,
      }));
    };

    // Auction control events
    const handleAuctionStarted = (data: { auctionId: string; startTime: Date; endTime: Date }) => {
      setState(prev => ({
        ...prev,
        auctionState: prev.auctionState ? {
          ...prev.auctionState,
          status: 'active',
          endTime: data.endTime,
        } : null,
      }));
    };

    const handleAuctionEnded = (data: { auctionId: string; winner: any; finalPrice: number; endTime: Date }) => {
      setState(prev => ({
        ...prev,
        auctionState: prev.auctionState ? {
          ...prev.auctionState,
          status: 'ended',
          currentPrice: data.finalPrice,
          timeLeft: 0,
        } : null,
      }));
    };

    const handleAuctionExtended = (data: { newEndTime: Date; reason: string }) => {
      setState(prev => ({
        ...prev,
        auctionState: prev.auctionState ? {
          ...prev.auctionState,
          endTime: data.newEndTime,
          isExtended: true,
        } : null,
      }));
    };

    // Bid events
    const handleBidConfirmed = (data: { bid: Bid; message: string }) => {
      // Bid was accepted - already handled in bidPlaced
    };

    const handleBidRejected = (data: { reason: string; message: string }) => {
      setState(prev => ({
        ...prev,
        error: data.message,
      }));
    };

    const handleBidError = (data: { message: string }) => {
      setState(prev => ({
        ...prev,
        error: data.message,
      }));
    };

    // Register event listeners
    auctionSocket.on('auctionState', handleAuctionState);
    auctionSocket.on('bidPlaced', handleBidPlaced);
    auctionSocket.on('userJoined', handleUserJoined);
    auctionSocket.on('userLeft', handleUserLeft);
    auctionSocket.on('auctionStarted', handleAuctionStarted);
    auctionSocket.on('auctionEnded', handleAuctionEnded);
    auctionSocket.on('auctionExtended', handleAuctionExtended);
    auctionSocket.on('bidConfirmed', handleBidConfirmed);
    auctionSocket.on('bidRejected', handleBidRejected);
    auctionSocket.on('bidError', handleBidError);

    return () => {
      // Clean up event listeners
      auctionSocket.off('auctionState', handleAuctionState);
      auctionSocket.off('bidPlaced', handleBidPlaced);
      auctionSocket.off('userJoined', handleUserJoined);
      auctionSocket.off('userLeft', handleUserLeft);
      auctionSocket.off('auctionStarted', handleAuctionStarted);
      auctionSocket.off('auctionEnded', handleAuctionEnded);
      auctionSocket.off('auctionExtended', handleAuctionExtended);
      auctionSocket.off('bidConfirmed', handleBidConfirmed);
      auctionSocket.off('bidRejected', handleBidRejected);
      auctionSocket.off('bidError', handleBidError);
    };
  }, [auctionId]);

  // Place bid function with validation and rate limiting
  const placeBid = useCallback(async (amount: number): Promise<BidResponse> => {
    if (!auctionId || !userId || !userName) {
      return {
        success: false,
        reason: 'not_authenticated',
        message: 'You must be logged in to place a bid',
      };
    }

    if (!state.connected) {
      return {
        success: false,
        reason: 'not_connected',
        message: 'Not connected to auction server',
      };
    }

    // 1. Client-side bid validation
    const validation = validateBid(amount, currentPrice, incrementAmount, state.auctionState);
    if (!validation.valid) {
      return {
        success: false,
        reason: validation.reason,
        message: validation.message,
      };
    }

    // 2. Rate limiting check
    const now = Date.now();
    const timeSinceLastBid = now - rateLimitRef.current.lastBidTime;

    // Rate limiting: max 3 bids per 10 seconds
    if (timeSinceLastBid < 10000 && rateLimitRef.current.bidCount >= 3) {
      setState(prev => ({ ...prev, isRateLimited: true }));
      setTimeout(() => setState(prev => ({ ...prev, isRateLimited: false })), 10000 - timeSinceLastBid);

      return {
        success: false,
        reason: 'rate_limited',
        message: `Too many bids. Please wait ${Math.ceil((10000 - timeSinceLastBid) / 1000)} seconds.`,
      };
    }

    // 3. Prevent duplicate bids (race condition protection)
    const bidId = `${auctionId}-${userId}-${amount}-${now}`;
    if (pendingBidsRef.current.has(bidId) || state.pendingBids.has(bidId)) {
      return {
        success: false,
        reason: 'duplicate_bid',
        message: 'Bid already in progress',
      };
    }

    // Add to pending bids
    pendingBidsRef.current.add(bidId);
    setState(prev => ({
      ...prev,
      pendingBids: new Set([...prev.pendingBids, bidId])
    }));

    // Update rate limiting
    rateLimitRef.current.bidCount++;
    rateLimitRef.current.lastBidTime = now;

    // Reset bid count after 10 seconds
    setTimeout(() => {
      rateLimitRef.current.bidCount = Math.max(0, rateLimitRef.current.bidCount - 1);
    }, 10000);

    try {
      auctionSocket.placeBid(auctionId, userId, amount, userName);

      // Optimistic update - immediately update UI
      setState(prev => ({
        ...prev,
        lastBidTime: now,
        error: null,
      }));

      // Set timeout to remove from pending bids if no response
      setTimeout(() => {
        pendingBidsRef.current.delete(bidId);
        setState(prev => {
          const newPending = new Set(prev.pendingBids);
          newPending.delete(bidId);
          return { ...prev, pendingBids: newPending };
        });
      }, 5000); // 5 second timeout

      return {
        success: true,
        message: 'Bid placed successfully',
      };
    } catch (error) {
      // Remove from pending on error
      pendingBidsRef.current.delete(bidId);
      setState(prev => {
        const newPending = new Set(prev.pendingBids);
        newPending.delete(bidId);
        return { ...prev, pendingBids: newPending };
      });

      console.error('Error placing bid:', error);
      return {
        success: false,
        reason: 'network_error',
        message: 'Failed to place bid. Please try again.',
      };
    }
  }, [auctionId, userId, userName, state.connected, currentPrice, incrementAmount, state.auctionState, state.pendingBids, auctionSocket]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    placeBid,
    clearError,
  };
}

// Bid validation function
function validateBid(
  amount: number,
  currentPrice: number,
  incrementAmount: number,
  auctionState: AuctionState | null
): { valid: boolean; reason?: string; message?: string } {
  // 1. Basic validation
  if (!amount || amount <= 0) {
    return {
      valid: false,
      reason: 'invalid_amount',
      message: 'Bid amount must be greater than zero',
    };
  }

  // 2. Minimum bid validation
  const minBid = currentPrice + incrementAmount;
  if (amount < minBid) {
    return {
      valid: false,
      reason: 'below_minimum',
      message: `Bid must be at least ₹${minBid.toLocaleString()}`,
    };
  }

  // 3. Auction status validation
  if (!auctionState) {
    return {
      valid: false,
      reason: 'auction_not_found',
      message: 'Auction not found',
    };
  }

  if (auctionState.status !== 'active' && auctionState.status !== 'live') {
    return {
      valid: false,
      reason: 'auction_not_active',
      message: 'Auction is not currently active',
    };
  }

  // 4. Time validation
  if (auctionState.endTime && new Date(auctionState.endTime) <= new Date()) {
    return {
      valid: false,
      reason: 'auction_ended',
      message: 'Auction has ended',
    };
  }

  // 5. Maximum bid validation (prevent extremely high bids)
  const maxReasonableBid = currentPrice * 10; // Max 10x current price to prevent excessive bids
  if (amount > maxReasonableBid) {
    return {
      valid: false,
      reason: 'excessive_amount',
      message: `Bid amount is too high. Maximum allowed: ₹${maxReasonableBid.toLocaleString()}`,
    };
  }

  // 6. Minimum increment validation (prevent tiny increments)
  const minIncrement = Math.max(100, currentPrice * 0.01); // At least 1% or ₹100
  if (amount - currentPrice < minIncrement) {
    return {
      valid: false,
      reason: 'insufficient_increment',
      message: `Minimum increment required: ₹${minIncrement.toLocaleString()}`,
    };
  }

  return { valid: true };
}
