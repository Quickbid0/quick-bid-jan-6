import { WebSocketGateway, SubscribeMessage, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ cors: true })
export class LiveGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  private redisClient: any;

  constructor(private prisma: PrismaService) {
    this.redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  }

  async afterInit(server: Server) {
    console.log('Live Auction Gateway initialized');

    // Enable Redis adapter for horizontal scaling
    if (process.env.REDIS_URL) {
      try {
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);
        server.adapter(new RedisAdapter(pubClient, subClient));
        console.log('Redis adapter enabled for horizontal scaling');
      } catch (error) {
        console.error('Failed to connect Redis adapter:', error);
      }
    }

    await this.redisClient.connect();
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinLiveAuction')
  async handleJoin(client: Socket, payload: { sessionId: string, userId: string }) {
    client.join(payload.sessionId);

    const session = await this.prisma.liveAuctionSession.findUnique({ where: { id: payload.sessionId } });
    if (session) {
      const highestBid = await this.redisClient.get(`auction:${payload.sessionId}:highestBid`);
      const bidders = await this.redisClient.smembers(`auction:${payload.sessionId}:bidders`);
      client.emit('auctionState', { session, highestBid: parseFloat(highestBid || '0'), bidders: bidders.length });
    }
  }

  @SubscribeMessage('placeBid')
  async handleBid(client: Socket, payload: { sessionId: string, userId: string, amount: number }) {
    // Validate wallet balance, fraud score, etc.
    // Assume validated for now

    const session = await this.prisma.liveAuctionSession.findUnique({ where: { id: payload.sessionId } });
    if (!session || session.status !== 'LIVE') {
      client.emit('error', 'Auction not live');
      return;
    }

    await this.prisma.liveBid.create({
      data: {
        sessionId: payload.sessionId,
        userId: payload.userId,
        amount: payload.amount,
      },
    });

    await this.redisClient.set(`auction:${payload.sessionId}:highestBid`, payload.amount.toString());
    await this.redisClient.sadd(`auction:${payload.sessionId}:bidders`, payload.userId);

    this.server.to(payload.sessionId).emit('bidPlaced', { userId: payload.userId, amount: payload.amount });
    this.server.to(payload.sessionId).emit('liveStatsUpdate', { highestBid: payload.amount, biddersCount: await this.redisClient.scard(`auction:${payload.sessionId}:bidders`) });

    // Trigger auto-bids
    await this.triggerAutoBids(payload.sessionId, payload.userId, payload.amount);
  }

  private async triggerAutoBids(sessionId: string, bidderId: string, currentBid: number) {
    const autoBidders = await this.prisma.autoBidConfig.findMany({
      where: {
        OR: [
          { auctionId: sessionId },
          { auctionId: null }, // Global auto-bid settings
        ],
        maxAmount: { gt: currentBid },
        isActive: true,
      },
    });

    for (const config of autoBidders) {
      if (config.userId !== bidderId) { // Don't bid against self
        const nextBid = Math.min(config.maxAmount, currentBid + config.increment);

        if (nextBid > currentBid) {
          // Check win probability threshold
          // Mock AI service call
          const winProbability = 0.65; // Replace with actual AI service call

          if (winProbability >= config.winProbabilityThreshold) {
            // Check fraud risk
            const fraudScore = 0.3; // Replace with actual fraud check

            if (fraudScore <= config.fraudRiskThreshold) {
              // Place auto-bid
              await this.handleBid({} as any, {
                sessionId,
                userId: config.userId,
                amount: nextBid
              });

              // Log auto-bid
              console.log(`Auto-bid placed: User ${config.userId}, Amount ${nextBid}`);
            }
          }
        }
      }
    }
  }

  @SubscribeMessage('voiceBid')
  async handleVoiceBid(client: Socket, payload: { sessionId: string, userId: string, spokenText: string, amount: number, confidence: number }) {
    // Log voice bid
    await this.prisma.voiceBidLog.create({
      data: {
        sessionId: payload.sessionId,
        userId: payload.userId,
        spokenText: payload.spokenText,
        parsedAmount: payload.amount,
        confidence: payload.confidence,
      },
    });

    // Place the bid
    await this.handleBid(client, { sessionId: payload.sessionId, userId: payload.userId, amount: payload.amount });
  }

  @SubscribeMessage('getWinProbability')
  async handleWinProbability(client: Socket, payload: { sessionId: string, userId: string }) {
    // Call AI service for win probability
    // Mock for now
    const probability = 0.65;
    client.emit('winProbabilityUpdate', { probability });
  }
}
