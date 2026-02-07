import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { AuctionsService } from './auctions.service';

interface BidData {
  auctionId: string;
  userId: string;
  amount: number;
  userName: string;
}

interface JoinAuctionData {
  auctionId: string;
  userId: string;
  userName: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3021',
      'http://localhost:3024',
      'http://localhost:3000',
      'https://quickmela.com',
      'https://www.quickmela.com',
    ],
    credentials: true,
  },
  namespace: '/auction',
})
export class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuctionsGateway.name);
  private auctionRooms = new Map<string, Set<string>>(); // auctionId -> Set of socketIds

  constructor(private readonly auctionsService: AuctionsService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove client from all auction rooms
    for (const [auctionId, clients] of this.auctionRooms.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.logger.log(`Removed ${client.id} from auction room ${auctionId}`);

        // Notify room about user leaving
        this.server.to(auctionId).emit('userLeft', {
          userId: client.data.userId,
          userName: client.data.userName,
          timestamp: new Date(),
        });

        // If room is empty, clean it up
        if (clients.size === 0) {
          this.auctionRooms.delete(auctionId);
          this.logger.log(`Auction room ${auctionId} is now empty and cleaned up`);
        }
      }
    }
  }

  @SubscribeMessage('joinAuction')
  async handleJoinAuction(
    @MessageBody() data: JoinAuctionData,
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId, userId, userName } = data;

    // Store user data on socket for later use
    client.data.userId = userId;
    client.data.userName = userName;

    // Join the auction room
    client.join(auctionId);

    // Track clients in this auction room
    if (!this.auctionRooms.has(auctionId)) {
      this.auctionRooms.set(auctionId, new Set());
    }
    this.auctionRooms.get(auctionId).add(client.id);

    this.logger.log(`User ${userName} (${userId}) joined auction ${auctionId}`);

    // Notify room about new user
    client.to(auctionId).emit('userJoined', {
      userId,
      userName,
      timestamp: new Date(),
      totalUsers: this.auctionRooms.get(auctionId).size,
    });

    // Send current auction state to the new user
    const auctionState = await this.auctionsService.getAuctionState(auctionId);
    client.emit('auctionState', auctionState);

    return { success: true, message: 'Joined auction successfully' };
  }

  @SubscribeMessage('leaveAuction')
  async handleLeaveAuction(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId } = data;

    client.leave(auctionId);

    if (this.auctionRooms.has(auctionId)) {
      this.auctionRooms.get(auctionId).delete(client.id);

      // Notify room about user leaving
      this.server.to(auctionId).emit('userLeft', {
        userId: client.data.userId,
        userName: client.data.userName,
        timestamp: new Date(),
        totalUsers: this.auctionRooms.get(auctionId).size,
      });

      // Clean up empty rooms
      if (this.auctionRooms.get(auctionId).size === 0) {
        this.auctionRooms.delete(auctionId);
      }
    }

    return { success: true, message: 'Left auction successfully' };
  }

  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @MessageBody() data: BidData,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { auctionId, userId, amount, userName } = data;

      this.logger.log(`Bid attempt: User ${userName} bidding ₹${amount} on auction ${auctionId}`);

      // Validate bid through auction service
      const bidResult = await this.auctionsService.placeBid({
        auctionId,
        userId,
        amount,
        userName,
      });

      if (bidResult.success) {
        // Broadcast successful bid to all users in the auction room
        this.server.to(auctionId).emit('bidPlaced', {
          bid: bidResult.bid,
          auctionState: bidResult.auctionState,
          timestamp: new Date(),
        });

        this.logger.log(`Bid successful: ₹${amount} by ${userName} on auction ${auctionId}`);

        // Send confirmation to bidder
        client.emit('bidConfirmed', {
          bid: bidResult.bid,
          message: 'Your bid has been placed successfully!',
        });

        // Check if auction should end (anti-sniping)
        if (bidResult.shouldExtend) {
          this.server.to(auctionId).emit('auctionExtended', {
            newEndTime: bidResult.newEndTime,
            reason: 'Anti-sniping: Last minute bid extended auction',
          });
        }

        return { success: true, bid: bidResult.bid };
      } else {
        // Send bid rejection to the bidder only
        client.emit('bidRejected', {
          reason: bidResult.reason,
          message: bidResult.message,
        });

        this.logger.warn(`Bid rejected: ${bidResult.reason} for user ${userName} on auction ${auctionId}`);

        return { success: false, reason: bidResult.reason };
      }
    } catch (error) {
      this.logger.error(`Bid error: ${error.message}`, error.stack);

      client.emit('bidError', {
        message: 'An error occurred while placing your bid. Please try again.',
      });

      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getAuctionState')
  async handleGetAuctionState(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId } = data;

    try {
      const auctionState = await this.auctionsService.getAuctionState(auctionId);
      client.emit('auctionState', auctionState);

      return { success: true, auctionState };
    } catch (error) {
      this.logger.error(`Get auction state error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Admin methods for controlling auctions
  @SubscribeMessage('startAuction')
  async handleStartAuction(
    @MessageBody() data: { auctionId: string; adminId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId, adminId } = data;

    try {
      const result = await this.auctionsService.startAuction(auctionId, adminId);

      if (result.success) {
        this.server.to(auctionId).emit('auctionStarted', {
          auctionId,
          startTime: result.startTime,
          endTime: result.endTime,
        });

        this.logger.log(`Auction ${auctionId} started by admin ${adminId}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Start auction error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('endAuction')
  async handleEndAuction(
    @MessageBody() data: { auctionId: string; adminId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId, adminId } = data;

    try {
      const result = await this.auctionsService.endAuction(auctionId, adminId);

      if (result.success) {
        this.server.to(auctionId).emit('auctionEnded', {
          auctionId,
          winner: result.winner,
          finalPrice: result.finalPrice,
          endTime: result.endTime,
        });

        this.logger.log(`Auction ${auctionId} ended by admin ${adminId}. Winner: ${result.winner?.userName}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`End auction error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('pauseAuction')
  async handlePauseAuction(
    @MessageBody() data: { auctionId: string; adminId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId, adminId } = data;

    try {
      const result = await this.auctionsService.pauseAuction(auctionId, adminId);

      if (result.success) {
        this.server.to(auctionId).emit('auctionPaused', {
          auctionId,
          pauseTime: result.pauseTime,
          reason: result.reason,
        });

        this.logger.log(`Auction ${auctionId} paused by admin ${adminId}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Pause auction error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Method to broadcast auction updates (called by auction service)
  broadcastAuctionUpdate(auctionId: string, update: any) {
    this.server.to(auctionId).emit('auctionUpdate', update);
  }

  // Method to notify specific users
  notifyUser(userId: string, event: string, data: any) {
    // Find all sockets for this user and emit
    const sockets = this.server.sockets.sockets;
    for (const [socketId, socket] of sockets.entries()) {
      if (socket.data.userId === userId) {
        socket.emit(event, data);
      }
    }
  }

  // Get room statistics
  getRoomStats(auctionId: string) {
    const clients = this.auctionRooms.get(auctionId);
    return {
      auctionId,
      totalUsers: clients ? clients.size : 0,
      userList: clients ? Array.from(clients) : [],
    };
  }
}
