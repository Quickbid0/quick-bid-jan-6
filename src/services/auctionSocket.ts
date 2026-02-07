import { io, Socket } from 'socket.io-client';
import { AuctionState, Bid } from '../types/auction';

export interface AuctionSocketEvents {
  // Outgoing events (client -> server)
  joinAuction: (data: { auctionId: string; userId: string; userName: string }) => void;
  leaveAuction: (data: { auctionId: string }) => void;
  placeBid: (data: { auctionId: string; userId: string; amount: number; userName: string }) => void;
  getAuctionState: (data: { auctionId: string }) => void;

  // Admin events
  startAuction: (data: { auctionId: string; adminId: string }) => void;
  endAuction: (data: { auctionId: string; adminId: string }) => void;
  pauseAuction: (data: { auctionId: string; adminId: string }) => void;
}

export interface AuctionSocketListeners {
  // Incoming events (server -> client)
  auctionState: (data: AuctionState) => void;
  bidPlaced: (data: { bid: Bid; auctionState: AuctionState; timestamp: Date }) => void;
  bidConfirmed: (data: { bid: Bid; message: string }) => void;
  bidRejected: (data: { reason: string; message: string }) => void;
  bidError: (data: { message: string }) => void;

  userJoined: (data: { userId: string; userName: string; timestamp: Date; totalUsers: number }) => void;
  userLeft: (data: { userId: string; userName: string; timestamp: Date; totalUsers: number }) => void;

  auctionStarted: (data: { auctionId: string; startTime: Date; endTime: Date }) => void;
  auctionEnded: (data: { auctionId: string; winner: any; finalPrice: number; endTime: Date }) => void;
  auctionPaused: (data: { auctionId: string; pauseTime: Date; reason: string }) => void;
  auctionExtended: (data: { newEndTime: Date; reason: string }) => void;

  auctionUpdate: (data: any) => void;
}

class AuctionSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private eventListeners: Map<string, Function[]> = new Map();

  constructor(private backendUrl: string = 'http://localhost:4011') {}

  connect(userId?: string, userName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(`${this.backendUrl}/auction`, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('Connected to auction socket server');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Emit stored user data if available
        if (userId && userName) {
          this.socket?.emit('userAuthenticated', { userId, userName });
        }

        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from auction socket server:', reason);
        this.isConnected = false;

        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Auction socket connection error:', error);
        this.isConnected = false;
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to auction server after maximum attempts'));
        }
      });

      // Set up event forwarding
      this.setupEventForwarding();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Auction room management
  joinAuction(auctionId: string, userId: string, userName: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log(`Joining auction room: ${auctionId} as ${userName}`);
    this.socket.emit('joinAuction', { auctionId, userId, userName });
  }

  leaveAuction(auctionId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    console.log(`Leaving auction room: ${auctionId}`);
    this.socket.emit('leaveAuction', { auctionId });
  }

  // Bidding
  placeBid(auctionId: string, userId: string, amount: number, userName: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log(`Placing bid: ₹${amount} on auction ${auctionId} by ${userName}`);
    this.socket.emit('placeBid', { auctionId, userId, amount, userName });
  }

  getAuctionState(auctionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('getAuctionState', { auctionId });
  }

  // Admin controls
  startAuction(auctionId: string, adminId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('startAuction', { auctionId, adminId });
  }

  endAuction(auctionId: string, adminId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('endAuction', { auctionId, adminId });
  }

  pauseAuction(auctionId: string, adminId: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('pauseAuction', { auctionId, adminId });
  }

  // Event listener management
  on<T extends keyof AuctionSocketListeners>(
    event: T,
    listener: AuctionSocketListeners[T]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)!.push(listener);
  }

  off<T extends keyof AuctionSocketListeners>(
    event: T,
    listener?: AuctionSocketListeners[T]
  ): void {
    if (!this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event)!;

    if (listener) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      listeners.length = 0;
    }

    if (listeners.length === 0) {
      this.eventListeners.delete(event);
    }
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    const events: (keyof AuctionSocketListeners)[] = [
      'auctionState',
      'bidPlaced',
      'bidConfirmed',
      'bidRejected',
      'bidError',
      'userJoined',
      'userLeft',
      'auctionStarted',
      'auctionEnded',
      'auctionPaused',
      'auctionExtended',
      'auctionUpdate',
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
          listeners.forEach(listener => {
            try {
              listener(data);
            } catch (error) {
              console.error(`Error in ${event} listener:`, error);
            }
          });
        }
      });
    });
  }

  // Connection status
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get connectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'connecting';
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
  }
}

// Singleton instance
let auctionSocketManager: AuctionSocketManager | null = null;

export const getAuctionSocket = (): AuctionSocketManager => {
  if (!auctionSocketManager) {
    auctionSocketManager = new AuctionSocketManager();
  }
  return auctionSocketManager;
};

export const destroyAuctionSocket = (): void => {
  if (auctionSocketManager) {
    auctionSocketManager.destroy();
    auctionSocketManager = null;
  }
};

export default AuctionSocketManager;
