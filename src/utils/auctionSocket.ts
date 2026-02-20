import { io, Socket } from 'socket.io-client';

/**
 * FIX 20: WebSocket Reconnection Missed Events (RT-04)
 * On reconnect after network drop, fetch latest auction state to fill the gap
 */

export class AuctionSocketManager {
  private socket: Socket | null = null;
  private auctionId: string | null = null;
  private onBidPlaced?: (data: any) => void;
  private onAuctionUpdated?: (data: any) => void;

  connect() {
    this.socket = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      extraHeaders: {
        'x-client-version': '1.0',
      },
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // FIX 20: On reconnect, fetch latest auction state
    this.socket.on('connect', async () => {
      if (this.auctionId && !this.socket?.recovered) {
        console.log('🔄 Reconnected after disconnect - fetching latest state...');
        try {
          // Fetch latest auction data to fill missed events
          const response = await fetch(`/api/auctions/${this.auctionId}`);
          const latestAuction = await response.json();

          // Notify listeners of the updated state
          this.onAuctionUpdated?.(latestAuction);
        } catch (err) {
          console.error('Failed to fetch latest auction state:', err);
        }
      }
    });

    return this;
  }

  joinAuction(auctionId: string) {
    this.auctionId = auctionId;
    this.socket?.emit('auction:join', { auctionId });
    return this;
  }

  leaveAuction() {
    if (this.auctionId) {
      this.socket?.emit('auction:leave', { auctionId: this.auctionId });
      this.auctionId = null;
    }
    return this;
  }

  onBid(callback: (data: any) => void) {
    this.onBidPlaced = callback;
    this.socket?.on('bid:placed', callback);
    return this;
  }

  onUpdate(callback: (data: any) => void) {
    this.onAuctionUpdated = callback;
    this.socket?.on('auction:updated', callback);
    return this;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.auctionId = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const createAuctionSocket = () => new AuctionSocketManager();
