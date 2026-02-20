/**
 * Hook for Real-Time Auction Price Updates
 * 
 * Subscribes to WebSocket price updates for a specific auction.
 * Automatically handles connection, reconnection, and cleanup.
 * 
 * Usage:
 *   const { currentPrice, bidCount, lastUpdate } = useAuctionPriceUpdates('auction-123');
 * 
 * Returns:
 *   - currentPrice: Current highest bid amount (number)
 *   - bidCount: Total number of bids placed (number)
 *   - lastUpdate: Timestamp of last update (ISO string)
 *   - isConnected: Whether WebSocket is connected (boolean)
 */

import { useState, useEffect, useCallback } from 'react';
import { WebSocketManager, WebSocketMessage, getWebSocketInstance } from '../services/WebSocket';

export interface AuctionPriceUpdate {
  type: 'PRICE_UPDATE' | 'BID_PLACED' | 'AUCTION_ENDED';
  auctionId: string;
  currentPrice?: number;
  bidCount?: number;
  lastBidder?: string;
  timestamp: string;
}

export interface UseAuctionPriceUpdatesReturn {
  currentPrice: number | null;
  bidCount: number;
  lastUpdate: string | null;
  isConnected: boolean;
  error: string | null;
}

export function useAuctionPriceUpdates(auctionId: string): UseAuctionPriceUpdatesReturn {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [bidCount, setBidCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocketManager | null>(null);

  // Handler for incoming WebSocket messages
  const handleMessage = useCallback((data: WebSocketMessage) => {
    // Only process messages for this auction
    if (data.auctionId !== auctionId) return;

    const update = data as AuctionPriceUpdate;

    try {
      if (update.type === 'PRICE_UPDATE' && update.currentPrice !== undefined) {
        setCurrentPrice(update.currentPrice);
        setLastUpdate(update.timestamp);
      }

      if (update.bidCount !== undefined) {
        setBidCount(update.bidCount);
      }

      // Clear any previous errors on successful update
      setError(null);
    } catch (err) {
      console.error('[useAuctionPriceUpdates] Error handling message:', err);
    }
  }, [auctionId]);

  // Initialize WebSocket connection and subscribe
  useEffect(() => {
    let isMounted = true;
    let wsManager: WebSocketManager | null = null;

    const initializeConnection = async () => {
      try {
        // Get or create WebSocket instance
        wsManager = getWebSocketInstance();
        setWs(wsManager);

        // Connect if not already connected
        if (!wsManager.isConnected()) {
          await wsManager.connect();
        }

        if (isMounted) {
          setIsConnected(true);
          setError(null);
        }

        // Register message handler
        wsManager.onMessage(handleMessage);

        // Subscribe to this auction's updates
        wsManager.subscribe(auctionId);

        console.log(`[useAuctionPriceUpdates] Subscribed to auction ${auctionId}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to connect to price updates';
        console.error('[useAuctionPriceUpdates] Connection error:', err);

        if (isMounted) {
          setError(errorMsg);
          setIsConnected(false);
        }
      }
    };

    initializeConnection();

    // Cleanup: unsubscribe and remove handler on unmount
    return () => {
      isMounted = false;

      if (wsManager) {
        try {
          wsManager.unsubscribe(auctionId);
          wsManager.offMessage(handleMessage);
        } catch (err) {
          console.warn('[useAuctionPriceUpdates] Cleanup error:', err);
        }
      }
    };
  }, [auctionId, handleMessage]);

  return {
    currentPrice,
    bidCount,
    lastUpdate,
    isConnected,
    error,
  };
}

/**
 * Hook for multiple auction price updates
 * Useful when displaying a list of auctions
 * 
 * Usage:
 *   const updates = useMultipleAuctionUpdates(['auction-1', 'auction-2', 'auction-3']);
 */
export function useMultipleAuctionUpdates(auctionIds: string[]): Map<string, UseAuctionPriceUpdatesReturn> {
  const [updates, setUpdates] = useState<Map<string, UseAuctionPriceUpdatesReturn>>(new Map());

  useEffect(() => {
    let isMounted = true;
    let wsManager: WebSocketManager | null = null;

    const initializeConnection = async () => {
      try {
        wsManager = getWebSocketInstance();

        if (!wsManager.isConnected()) {
          await wsManager.connect();
        }

        // Initialize state for all auctions
        const initialUpdates = new Map<string, UseAuctionPriceUpdatesReturn>();
        auctionIds.forEach((id) => {
          initialUpdates.set(id, {
            currentPrice: null,
            bidCount: 0,
            lastUpdate: null,
            isConnected: true,
            error: null,
          });
        });

        if (isMounted) {
          setUpdates(initialUpdates);
        }

        // Register message handler
        const handleMessage = (data: WebSocketMessage) => {
          if (!auctionIds.includes(data.auctionId || '')) return;

          const update = data as AuctionPriceUpdate;
          setUpdates((prev) => {
            const newUpdates = new Map(prev);
            const current = newUpdates.get(update.auctionId) || {
              currentPrice: null,
              bidCount: 0,
              lastUpdate: null,
              isConnected: true,
              error: null,
            };

            newUpdates.set(update.auctionId, {
              ...current,
              currentPrice: update.currentPrice ?? current.currentPrice,
              bidCount: update.bidCount ?? current.bidCount,
              lastUpdate: update.timestamp,
              error: null,
            });

            return newUpdates;
          });
        };

        wsManager.onMessage(handleMessage);

        // Subscribe to all auctions
        auctionIds.forEach((id) => {
          wsManager!.subscribe(id);
        });

        console.log(`[useMultipleAuctionUpdates] Subscribed to ${auctionIds.length} auctions`);
      } catch (err) {
        console.error('[useMultipleAuctionUpdates] Connection error:', err);

        if (isMounted) {
          const errorUpdates = new Map<string, UseAuctionPriceUpdatesReturn>();
          auctionIds.forEach((id) => {
            errorUpdates.set(id, {
              currentPrice: null,
              bidCount: 0,
              lastUpdate: null,
              isConnected: false,
              error: 'Failed to connect',
            });
          });
          setUpdates(errorUpdates);
        }
      }
    };

    if (auctionIds.length > 0) {
      initializeConnection();
    }

    return () => {
      isMounted = false;
    };
  }, [auctionIds.join(',')]); // Using join to create stable dependency

  return updates;
}
