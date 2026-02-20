import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * FIX 18: Dashboard Widget Not Updating in Real-Time (ST-03)
 * Subscribe to WebSocket events to update dashboard widgets live
 */

export interface DashboardStats {
  totalBids: number;
  activeAuctions: number;
  totalWallet: number;
  pendingPayments: number;
}

export const useDashboardRealTime = (userId: string | null) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBids: 0,
    activeAuctions: 0,
    totalWallet: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io({
      reconnection: true,
      reconnectionDelay: 1000,
    });

    // Connect to auction updates
    socket.on('connect', () => {
      socket.emit('dashboard:subscribe', { userId });
    });

    // Listen for bid updates
    socket.on('auction:update', (event) => {
      if (event.type === 'BID_PLACED') {
        setStats((prev) => ({
          ...prev,
          totalBids: prev.totalBids + 1,
          activeAuctions: event.data?.activeAuctions ?? prev.activeAuctions,
        }));
      }
    });

    // Listen for wallet updates
    socket.on('wallet:updated', (data) => {
      setStats((prev) => ({
        ...prev,
        totalWallet: data.balance,
      }));
    });

    // Listen for auction status changes
    socket.on('auction:status-changed', (data) => {
      setStats((prev) => ({
        ...prev,
        activeAuctions: Math.max(0, prev.activeAuctions + (data.ended ? -1 : 0)),
      }));
    });

    return () => {
      socket.emit('dashboard:unsubscribe', { userId });
      socket.disconnect();
    };
  }, [userId]);

  return stats;
};
