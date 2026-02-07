import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Observable, Subject } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export interface RealTimeEvent {
  type: 'auction_bid' | 'auction_end' | 'auction_start' | 'user_notification' | 'system_alert' | 'price_update';
  auctionId?: string;
  userId?: string;
  data: any;
  timestamp: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SSEClient {
  id: string;
  userId?: string;
  response: any;
  lastActivity: Date;
  subscriptions: string[];
}

@Injectable()
export class RealTimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealTimeService.name);

  // WebSocket server instance (will be injected by gateway)
  private io: Server;

  // SSE clients
  private sseClients = new Map<string, SSEClient>();

  // Event subjects for different channels
  private eventSubjects = new Map<string, Subject<RealTimeEvent>>();

  // User subscriptions (user -> channels)
  private userSubscriptions = new Map<string, Set<string>>();

  // Channel subscriptions (channel -> users)
  private channelSubscriptions = new Map<string, Set<string>>();

  constructor(
    private eventEmitter: EventEmitter2,
    private prismaService: PrismaService,
  ) {}

  onModuleInit() {
    // Set up event listeners for various platform events
    this.setupEventListeners();
  }

  onModuleDestroy() {
    // Clean up event subjects
    for (const subject of this.eventSubjects.values()) {
      subject.complete();
    }
    this.eventSubjects.clear();
  }

  setWebSocketServer(io: Server) {
    this.io = io;
  }

  // WebSocket event handlers
  handleUserConnect(socket: Socket, userId?: string) {
    const clientId = socket.id;

    this.logger.log(`User connected: ${clientId} (User: ${userId || 'anonymous'})`);

    // Store user connection
    if (userId) {
      this.userSubscriptions.set(userId, new Set());
    }

    // Send welcome message
    socket.emit('connected', {
      clientId,
      userId,
      timestamp: new Date(),
      message: 'Connected to QuickMela real-time service'
    });
  }

  handleUserDisconnect(socket: Socket, userId?: string) {
    const clientId = socket.id;

    this.logger.log(`User disconnected: ${clientId} (User: ${userId || 'anonymous'})`);

    // Clean up subscriptions
    if (userId) {
      const userSubs = this.userSubscriptions.get(userId);
      if (userSubs) {
        for (const channel of userSubs) {
          const channelSubs = this.channelSubscriptions.get(channel);
          if (channelSubs) {
            channelSubs.delete(userId);
          }
        }
        this.userSubscriptions.delete(userId);
      }
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() socket: Socket
  ) {
    const { channels } = data;
    const userId = (socket as any).userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentication required for subscriptions' });
      return;
    }

    // Subscribe to channels
    const userSubs = this.userSubscriptions.get(userId) || new Set();
    for (const channel of channels) {
      userSubs.add(channel);

      const channelSubs = this.channelSubscriptions.get(channel) || new Set();
      channelSubs.add(userId);
      this.channelSubscriptions.set(channel, channelSubs);

      // Send confirmation
      socket.emit('subscribed', { channel, timestamp: new Date() });
    }

    this.userSubscriptions.set(userId, userSubs);
    this.logger.log(`User ${userId} subscribed to channels: ${channels.join(', ')}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() socket: Socket
  ) {
    const { channels } = data;
    const userId = (socket as any).userId;

    if (!userId) return;

    const userSubs = this.userSubscriptions.get(userId);
    if (userSubs) {
      for (const channel of channels) {
        userSubs.delete(channel);

        const channelSubs = this.channelSubscriptions.get(channel);
        if (channelSubs) {
          channelSubs.delete(userId);
        }
      }
    }

    this.logger.log(`User ${userId} unsubscribed from channels: ${channels.join(', ')}`);
  }

  @SubscribeMessage('auction:join')
  handleAuctionJoin(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() socket: Socket
  ) {
    const { auctionId } = data;
    const userId = (socket as any).userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    // Join auction room
    socket.join(`auction_${auctionId}`);

    // Send current auction state
    this.sendAuctionState(socket, auctionId);

    this.logger.log(`User ${userId} joined auction room: ${auctionId}`);
  }

  @SubscribeMessage('auction:leave')
  handleAuctionLeave(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() socket: Socket
  ) {
    const { auctionId } = data;

    socket.leave(`auction_${auctionId}`);
    this.logger.log(`User left auction room: ${auctionId}`);
  }

  @SubscribeMessage('auction:place_bid')
  async handleBidPlacement(
    @MessageBody() data: { auctionId: string; amount: number },
    @ConnectedSocket() socket: Socket
  ) {
    const { auctionId, amount } = data;
    const userId = (socket as any).userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    try {
      // Validate and place bid (this would call the auctions service)
      const bidResult = await this.validateAndPlaceBid(auctionId, userId, amount);

      if (bidResult.success) {
        // Broadcast bid to all users in auction room
        this.io.to(`auction_${auctionId}`).emit('auction:bid_placed', {
          auctionId,
          bid: bidResult.bid,
          auctionState: bidResult.auctionState,
          timestamp: new Date(),
        });

        // Send confirmation to bidder
        socket.emit('bid:confirmed', {
          bid: bidResult.bid,
          message: 'Bid placed successfully'
        });

        // Emit event for other services (notifications, analytics, etc.)
        this.eventEmitter.emit('auction.bidPlaced', {
          auctionId,
          bid: bidResult.bid,
          auctionState: bidResult.auctionState,
        });

      } else {
        socket.emit('bid:rejected', {
          reason: bidResult.reason,
          message: bidResult.message
        });
      }

    } catch (error) {
      socket.emit('error', {
        message: 'Failed to place bid',
        details: error.message
      });
    }
  }

  // SSE (Server-Sent Events) methods
  addSSEClient(clientId: string, userId: string | undefined, response: any) {
    const client: SSEClient = {
      id: clientId,
      userId,
      response,
      lastActivity: new Date(),
      subscriptions: [],
    };

    this.sseClients.set(clientId, client);

    // Send initial connection message
    this.sendSSEEvent(client, 'connected', {
      clientId,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`SSE client connected: ${clientId} (User: ${userId || 'anonymous'})`);
  }

  removeSSEClient(clientId: string) {
    const client = this.sseClients.get(clientId);
    if (client) {
      this.sseClients.delete(clientId);
      this.logger.log(`SSE client disconnected: ${clientId}`);
    }
  }

  subscribeSSEClient(clientId: string, channels: string[]) {
    const client = this.sseClients.get(clientId);
    if (client) {
      client.subscriptions = [...new Set([...client.subscriptions, ...channels])];
      client.lastActivity = new Date();
    }
  }

  sendSSEEvent(client: SSEClient, event: string, data: any) {
    try {
      const eventData = {
        event,
        data,
        timestamp: new Date(),
      };

      client.response.write(`data: ${JSON.stringify(eventData)}\n\n`);
      client.lastActivity = new Date();
    } catch (error) {
      // Client may have disconnected
      this.removeSSEClient(client.id);
    }
  }

  broadcastSSEEvent(event: string, data: any, targetUsers?: string[]) {
    const clients = targetUsers
      ? Array.from(this.sseClients.values()).filter(client => targetUsers.includes(client.userId || ''))
      : Array.from(this.sseClients.values());

    for (const client of clients) {
      this.sendSSEEvent(client, event, data);
    }
  }

  // Event emission methods
  async emitAuctionBid(auctionId: string, bidData: any) {
    const event: RealTimeEvent = {
      type: 'auction_bid',
      auctionId,
      data: bidData,
      timestamp: new Date(),
      priority: 'high',
    };

    // WebSocket broadcast
    this.io.to(`auction_${auctionId}`).emit('auction:bid', event);

    // SSE broadcast
    this.broadcastSSEEvent('auction:bid', event);

    // Event emitter for other services
    this.eventEmitter.emit('realtime.auction.bid', event);
  }

  async emitAuctionEnd(auctionId: string, endData: any) {
    const event: RealTimeEvent = {
      type: 'auction_end',
      auctionId,
      data: endData,
      timestamp: new Date(),
      priority: 'urgent',
    };

    // WebSocket broadcast
    this.io.to(`auction_${auctionId}`).emit('auction:ended', event);

    // SSE broadcast
    this.broadcastSSEEvent('auction:ended', event);

    // Event emitter
    this.eventEmitter.emit('realtime.auction.ended', event);
  }

  async emitUserNotification(userId: string, notification: any) {
    const event: RealTimeEvent = {
      type: 'user_notification',
      userId,
      data: notification,
      timestamp: new Date(),
      priority: 'normal',
    };

    // Send to specific user via WebSocket
    this.sendToUser(userId, 'notification', event);

    // Send via SSE
    this.broadcastSSEEvent('notification', event, [userId]);

    // Event emitter
    this.eventEmitter.emit('realtime.notification', event);
  }

  async emitSystemAlert(alert: any, targetUsers?: string[]) {
    const event: RealTimeEvent = {
      type: 'system_alert',
      data: alert,
      timestamp: new Date(),
      priority: 'high',
    };

    // WebSocket broadcast
    if (targetUsers) {
      for (const userId of targetUsers) {
        this.sendToUser(userId, 'system_alert', event);
      }
    } else {
      this.io.emit('system_alert', event);
    }

    // SSE broadcast
    this.broadcastSSEEvent('system_alert', event, targetUsers);

    // Event emitter
    this.eventEmitter.emit('realtime.system_alert', event);
  }

  // Helper methods
  private sendToUser(userId: string, event: string, data: any) {
    // Find all sockets for this user and send
    const sockets = this.getUserSockets(userId);
    for (const socket of sockets) {
      socket.emit(event, data);
    }
  }

  private getUserSockets(userId: string): Socket[] {
    // In a real implementation, you'd maintain a user -> sockets mapping
    // For now, return empty array
    return [];
  }

  private async sendAuctionState(socket: Socket, auctionId: string) {
    // Get current auction state from auctions service
    // This would call the auctions service to get current state
    const auctionState = {
      auctionId,
      status: 'active',
      currentPrice: 10000,
      timeLeft: 1800, // 30 minutes
      totalBids: 15,
      activeUsers: 8,
    };

    socket.emit('auction:state', auctionState);
  }

  private async validateAndPlaceBid(auctionId: string, userId: string, amount: number) {
    // This would call the auctions service to validate and place the bid
    // Mock implementation
    return {
      success: true,
      bid: {
        id: `bid_${Date.now()}`,
        auctionId,
        userId,
        amount,
        timestamp: new Date(),
      },
      auctionState: {
        auctionId,
        currentPrice: amount,
        totalBids: 16,
        timeLeft: 1750,
      },
      reason: undefined,
      message: undefined,
    };
  }

  private setupEventListeners() {
    // Listen for auction events from auctions service
    this.eventEmitter.on('auction.bidPlaced', async (data) => {
      await this.emitAuctionBid(data.auctionId, data);
    });

    this.eventEmitter.on('auction.ended', async (data) => {
      await this.emitAuctionEnd(data.auctionId, data);
    });

    // Listen for notification events
    this.eventEmitter.on('notification.send', async (data) => {
      await this.emitUserNotification(data.userId, data.notification);
    });

    // Listen for system alerts
    this.eventEmitter.on('system.alert', async (data) => {
      await this.emitSystemAlert(data.alert, data.targetUsers);
    });
  }

  // Health monitoring
  getConnectionStats() {
    return {
      websocketClients: this.io ? this.io.sockets.sockets.size : 0,
      sseClients: this.sseClients.size,
      activeChannels: this.channelSubscriptions.size,
      timestamp: new Date(),
    };
  }

  // Cleanup inactive connections
  cleanupInactiveConnections() {
    const now = Date.now();
    const timeoutMs = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, client] of this.sseClients.entries()) {
      if (now - client.lastActivity.getTime() > timeoutMs) {
        this.removeSSEClient(clientId);
      }
    }

    this.logger.log('Cleaned up inactive SSE connections');
  }
}
