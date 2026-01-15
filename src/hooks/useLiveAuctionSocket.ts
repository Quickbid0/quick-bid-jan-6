import { useEffect, useState, useCallback } from 'react';
import { socket } from '../socket/socket';

export interface BidOverlayEvent {
  amountCents: number;
  username: string;
  flags?: any;
}

export interface DepositRequiredPayload {
  minDepositCents: number | null;
}

interface UseLiveAuctionSocketOptions {
  auctionId: string;
  token?: string;
}

export function useLiveAuctionSocket({ auctionId, token }: UseLiveAuctionSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [overlays, setOverlays] = useState<BidOverlayEvent[]>([]);
  const [pendingBidIds, setPendingBidIds] = useState<Set<string>>(new Set());
  const [lastError, setLastError] = useState<string | null>(null);
  const [depositRequired, setDepositRequired] = useState<DepositRequiredPayload | null>(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!auctionId) return;

    setIsConnecting(true);
    
    const handleConnect = () => {
      setConnected(true);
      setIsConnecting(false);
      socket.emit('join-auction', { auctionId, token });
    };

    const handleDisconnect = () => {
      setConnected(false);
      setIsConnecting(false);
    };

    const handleConnectError = (error: any) => {
      setLastError(error?.message || 'Connection failed');
      setIsConnecting(false);
    };

    // Prevent duplicate connections
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      // Only disconnect if this component owns the connection
      if (auctionId) {
        socket.disconnect();
      }
    };
  }, [auctionId, token]);

  useEffect(() => {
    const handleBidOverlay = (payload: BidOverlayEvent) => {
      setOverlays(prev => {
        const next = [payload, ...prev];
        return next.slice(0, 3);
      });
    };

    const handleBidPending = ({ bidId }: { bidId: string }) => {
      setPendingBidIds(prev => new Set(prev).add(bidId));
    };

    const handleNewBid = ({ bid, accepted }: { bid: any; accepted: boolean }) => {
      setPendingBidIds(prev => {
        const next = new Set(prev);
        if (bid?.id) next.delete(bid.id);
        return next;
      });
    };

    const handleError = (payload: { code: string }) => {
      setLastError(payload.code || 'UNKNOWN_ERROR');
    };

    const handleDepositRequired = (payload: DepositRequiredPayload) => {
      setDepositRequired(payload);
    };

    const handleAuctionEnded = () => {
      setAuctionEnded(true);
    };

    socket.on('bid-overlay', handleBidOverlay);
    socket.on('bid-pending', handleBidPending);
    socket.on('new-bid', handleNewBid);
    socket.on('error', handleError);
    socket.on('deposit-required', handleDepositRequired);
    socket.on('auction-ended', handleAuctionEnded);

    return () => {
      socket.off('bid-overlay', handleBidOverlay);
      socket.off('bid-pending', handleBidPending);
      socket.off('new-bid', handleNewBid);
      socket.off('error', handleError);
      socket.off('deposit-required', handleDepositRequired);
      socket.off('auction-ended', handleAuctionEnded);
    };
  }, []);

  const placeBid = useCallback(
    (amountCents: number, idempotencyKey?: string) => {
      if (!auctionId) return;
      socket.emit('place-bid', { auctionId, amountCents, idempotencyKey });
    },
    [auctionId],
  );

  const clearDepositRequired = useCallback(() => {
    setDepositRequired(null);
  }, []);

  return {
    connected,
    overlays,
    pendingBidIds,
    lastError,
    depositRequired,
    clearDepositRequired,
    placeBid,
    auctionEnded,
    isConnecting,
  };
}
