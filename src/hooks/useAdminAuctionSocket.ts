import { useEffect, useMemo, useState, useCallback } from 'react';
import { socket } from '../socket/socket';
import { useLiveAuctionSocket } from './useLiveAuctionSocket';

export interface AdminPendingBid {
  id: string;
  amountCents?: number;
  userId?: string;
  username?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface UseAdminAuctionSocketOptions {
  auctionId: string;
  token?: string;
}

interface AdminActionLogEvent {
  action: {
    type: string;
    bidId?: string;
    adminId?: string;
    previousAmount?: number;
    newAmount?: number;
    [key: string]: any;
  };
}

export function useAdminAuctionSocket({
  auctionId,
  token,
}: UseAdminAuctionSocketOptions) {
  // Reuse the buyer-side socket lifecycle & basic events
  const base = useLiveAuctionSocket({ auctionId, token });

  const [pendingBids, setPendingBids] = useState<AdminPendingBid[]>([]);
  const [adminActions, setAdminActions] = useState<AdminActionLogEvent[]>([]);

  useEffect(() => {
    if (!auctionId) return;

    const handleBidPending = ({ bidId }: { bidId: string }) => {
      setPendingBids(prev => {
        if (prev.some(b => b.id === bidId)) return prev;
        return [...prev, { id: bidId, status: 'pending' }];
      });
    };

    const handleNewBid = ({ bid, accepted }: { bid: any; accepted: boolean }) => {
      if (!bid?.id) return;
      setPendingBids(prev => {
        const existing = prev.find(b => b.id === bid.id);
        if (!existing) return prev;

        const updated: AdminPendingBid = {
          ...existing,
          id: String(bid.id),
          amountCents: typeof bid.amount_cents === 'number' ? bid.amount_cents : existing.amountCents,
          userId: bid.user_id ? String(bid.user_id) : existing.userId,
          username: bid.username || existing.username,
          status: bid.status as AdminPendingBid['status'],
        };

        // Once decision is made (accepted/rejected), remove from pending list
        if (updated.status !== 'pending') {
          return prev.filter(b => b.id !== bid.id);
        }

        return prev.map(b => (b.id === bid.id ? updated : b));
      });
    };

    const handleAdminActionLog = (payload: AdminActionLogEvent) => {
      setAdminActions(prev => [payload, ...prev].slice(0, 50));
    };

    socket.on('bid-pending', handleBidPending);
    socket.on('new-bid', handleNewBid);
    socket.on('admin-action-log', handleAdminActionLog);

    return () => {
      socket.off('bid-pending', handleBidPending);
      socket.off('new-bid', handleNewBid);
      socket.off('admin-action-log', handleAdminActionLog);
    };
  }, [auctionId]);

  const approveBid = useCallback((bidId: string) => {
    socket.emit('admin-approve-bid', { bidId, action: 'accept' });
  }, []);

  const rejectBid = useCallback((bidId: string) => {
    socket.emit('admin-approve-bid', { bidId, action: 'reject' });
  }, []);

  const overrideBid = useCallback((bidId: string, overrideAmountCents: number) => {
    socket.emit('admin-approve-bid', { bidId, action: 'override', overrideAmountCents });
  }, []);

  const latestAdminActions = useMemo(() => adminActions, [adminActions]);

  return {
    ...base,
    pendingBids,
    adminActions: latestAdminActions,
    approveBid,
    rejectBid,
    overrideBid,
  };
}
