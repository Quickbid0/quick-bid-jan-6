import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionService } from '../auctions/auctions.service';
import { PrismaService } from '../prisma/prisma.service';

interface BidMessage {
  auctionId: string;
  amount: number;
  userId: string;
  userName: string;
}

interface JoinAuctionMessage {
  auctionId: string;
  userId: string;
}

interface LeaveAuctionMessage {
  auctionId: string;
  userId: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/auction',
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuctionGateway.name);

  // Track connected users per auction
  private auctionRooms = new Map<string, Set<string>>();
  // Track user sockets
  private userSockets = new Map<string, Socket>();

  constructor(
    private auctionService: AuctionService,
    private prisma: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client);
      this.logger.log(`User ${userId} connected to auction gateway`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.delete(userId);

      // Remove user from all auction rooms
      for (const [auctionId, users] of this.auctionRooms.entries()) {
        if (users.has(userId)) {
          users.delete(userId);
          this.logger.log(`User ${userId} left auction room ${auctionId}`);

          // Notify other users in the room
          client.to(auctionId).emit('userLeft', {
            userId,
            timestamp: new Date()
          });
        }
      }
    }
  }

  @SubscribeMessage('joinAuction')
  async handleJoinAuction(
    @MessageBody() data: JoinAuctionMessage,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { auctionId, userId } = data;

      // Verify auction exists
      const auction = await this.prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true
            }
          }
        }
      });

      if (!auction) {
        client.emit('error', { message: 'Auction not found' });
        return;
      }

      // Check if auction is active
      const now = new Date();
      if (auction.status !== 'ACTIVE' || now < auction.startTime || now > auction.endTime) {
        client.emit('error', { message: 'Auction is not currently active' });
        return;
      }

      // Join the auction room
      client.join(auctionId);

      // Track user in room
      if (!this.auctionRooms.has(auctionId)) {
        this.auctionRooms.set(auctionId, new Set());
      }
      this.auctionRooms.get(auctionId)?.add(userId);

      // Send current auction state to the user
      const auctionState = await this.auctionService.getAuctionDetails(auctionId);

      client.emit('auctionJoined', {
        auction: auctionState,
        activeUsers: this.auctionRooms.get(auctionId)?.size || 0,
        timestamp: new Date()
      });

      // Notify other users in the room
      client.to(auctionId).emit('userJoined', {
        userId,
        activeUsers: this.auctionRooms.get(auctionId)?.size || 0,
        timestamp: new Date()
      });

      this.logger.log(`User ${userId} joined auction ${auctionId}`);
    } catch (error) {
      this.logger.error(`Join auction error: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to join auction' });
    }
  }

  @SubscribeMessage('leaveAuction')
  async handleLeaveAuction(
    @MessageBody() data: LeaveAuctionMessage,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { auctionId, userId } = data;

      // Leave the auction room
      client.leave(auctionId);

      // Remove user from room tracking
      const roomUsers = this.auctionRooms.get(auctionId);
      if (roomUsers) {
        roomUsers.delete(userId);

        // If room is empty, clean it up
        if (roomUsers.size === 0) {
          this.auctionRooms.delete(auctionId);
        }
      }

      // Notify other users in the room
      client.to(auctionId).emit('userLeft', {
        userId,
        activeUsers: roomUsers?.size || 0,
        timestamp: new Date()
      });

      client.emit('auctionLeft', {
        auctionId,
        timestamp: new Date()
      });

      this.logger.log(`User ${userId} left auction ${auctionId}`);
    } catch (error) {
      this.logger.error(`Leave auction error: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to leave auction' });
    }
  }

  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @MessageBody() data: BidMessage,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { auctionId, amount, userId, userName } = data;

      // Verify user is in the auction room
      const roomUsers = this.auctionRooms.get(auctionId);
      if (!roomUsers || !roomUsers.has(userId)) {
        client.emit('error', { message: 'You must join the auction first' });
        return;
      }

      // Place the bid using auction service
      const bidResult = await this.auctionService.placeBid(auctionId, userId, amount);

      if (!bidResult.success) {
        client.emit('bidRejected', {
          reason: bidResult.reason,
          message: bidResult.message,
          timestamp: new Date()
        });
        return;
      }

      // Broadcast the successful bid to all users in the auction
      const bidData = {
        bidId: bidResult.bidId,
        auctionId,
        bidderId: userId,
        bidderName: userName,
        amount,
        timestamp: new Date(),
        isWinning: true // Current bid is always winning until outbid
      };

      this.server.to(auctionId).emit('newBid', bidData);

      // Confirm to the bidder
      client.emit('bidAccepted', {
        bidId: bidResult.bidId,
        amount,
        message: 'Bid placed successfully!',
        timestamp: new Date()
      });

      // Check for auto-bid triggers (if implemented)
      // This would check if there are auto-bids that need to be triggered

      // Send bid notification to seller
      const auction = await this.prisma.auction.findUnique({
        where: { id: auctionId },
        include: { seller: true }
      });

      if (auction) {
        const sellerSocket = this.userSockets.get(auction.sellerId);
        if (sellerSocket) {
          sellerSocket.emit('bidNotification', {
            auctionId,
            productTitle: auction.product?.title,
            bidAmount: amount,
            bidderName: userName,
            timestamp: new Date()
          });
        }
      }

      this.logger.log(`Real-time bid placed: ₹${amount} by ${userName} on auction ${auctionId}`);
    } catch (error) {
      this.logger.error(`Place bid error: ${error.message}`, error.stack);
      client.emit('bidError', {
        message: 'Failed to place bid. Please try again.',
        timestamp: new Date()
      });
    }
  }

  @SubscribeMessage('getAuctionUpdates')
  async handleGetAuctionUpdates(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { auctionId } = data;

      // Send current auction state
      const auctionState = await this.auctionService.getAuctionDetails(auctionId);

      client.emit('auctionUpdate', {
        auction: auctionState,
        activeUsers: this.auctionRooms.get(auctionId)?.size || 0,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error(`Get auction updates error: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to get auction updates' });
    }
  }

  @SubscribeMessage('sendChatMessage')
  async handleChatMessage(
    @MessageBody() data: {
      auctionId: string;
      userId: string;
      userName: string;
      message: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { auctionId, userId, userName, message } = data;

      // Verify user is in the auction room
      const roomUsers = this.auctionRooms.get(auctionId);
      if (!roomUsers || !roomUsers.has(userId)) {
        client.emit('error', { message: 'You must join the auction to chat' });
        return;
      }

      // Basic message validation
      if (!message.trim() || message.length > 500) {
        client.emit('error', { message: 'Invalid message' });
        return;
      }

      // Check if auction allows chat (live auctions only)
      const auction = await this.prisma.auction.findUnique({
        where: { id: auctionId }
      });

      if (!auction || auction.auctionType !== 'LIVE') {
        client.emit('error', { message: 'Chat is only available for live auctions' });
        return;
      }

      const chatMessage = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        auctionId,
        userId,
        userName,
        message: message.trim(),
        timestamp: new Date()
      };

      // Broadcast chat message to all users in the auction
      this.server.to(auctionId).emit('chatMessage', chatMessage);

      // Log chat message for moderation
      this.logger.log(`Chat message in auction ${auctionId}: ${userName}: ${message}`);

      // Store chat message for audit (optional)
      // await this.prisma.chatMessage.create({ data: chatMessage });

    } catch (error) {
      this.logger.error(`Chat message error: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // Admin methods for broadcasting
  async broadcastAuctionStart(auctionId: string) {
    try {
      const auctionState = await this.auctionService.getAuctionDetails(auctionId);

      this.server.to(auctionId).emit('auctionStarted', {
        auction: auctionState,
        message: 'Auction has started!',
        timestamp: new Date()
      });

      this.logger.log(`Auction start broadcasted for ${auctionId}`);
    } catch (error) {
      this.logger.error(`Broadcast auction start error: ${error.message}`, error.stack);
    }
  }

  async broadcastAuctionEnd(auctionId: string, winnerData?: any) {
    try {
      const auctionState = await this.auctionService.getAuctionDetails(auctionId);

      this.server.to(auctionId).emit('auctionEnded', {
        auction: auctionState,
        winner: winnerData,
        message: winnerData ? `Auction ended! Winner: ${winnerData.name}` : 'Auction ended with no winner',
        timestamp: new Date()
      });

      this.logger.log(`Auction end broadcasted for ${auctionId}`);
    } catch (error) {
      this.logger.error(`Broadcast auction end error: ${error.message}`, error.stack);
    }
  }

  async broadcastPriceUpdate(auctionId: string, newPrice: number, bidderName: string) {
    try {
      this.server.to(auctionId).emit('priceUpdate', {
        auctionId,
        newPrice,
        bidderName,
        message: `New bid: ₹${newPrice} by ${bidderName}`,
        timestamp: new Date()
      });

      this.logger.log(`Price update broadcasted for auction ${auctionId}: ₹${newPrice}`);
    } catch (error) {
      this.logger.error(`Broadcast price update error: ${error.message}`, error.stack);
    }
  }

  // Utility methods
  getActiveUsersInAuction(auctionId: string): number {
    return this.auctionRooms.get(auctionId)?.size || 0;
  }

  getAllActiveAuctions(): string[] {
    return Array.from(this.auctionRooms.keys());
  }

  isUserInAuction(auctionId: string, userId: string): boolean {
    const roomUsers = this.auctionRooms.get(auctionId);
    return roomUsers ? roomUsers.has(userId) : false;
  }

  // Cleanup method for maintenance
  cleanupInactiveRooms() {
    // Remove empty rooms
    for (const [auctionId, users] of this.auctionRooms.entries()) {
      if (users.size === 0) {
        this.auctionRooms.delete(auctionId);
      }
    }
  }
}
