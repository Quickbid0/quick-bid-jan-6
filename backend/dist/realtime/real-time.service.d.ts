import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
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
export declare class RealTimeService implements OnModuleInit, OnModuleDestroy {
    private eventEmitter;
    private prismaService;
    private readonly logger;
    private io;
    private sseClients;
    private eventSubjects;
    private userSubscriptions;
    private channelSubscriptions;
    constructor(eventEmitter: EventEmitter2, prismaService: PrismaService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    setWebSocketServer(io: Server): void;
    handleUserConnect(socket: Socket, userId?: string): void;
    handleUserDisconnect(socket: Socket, userId?: string): void;
    handleSubscribe(data: {
        channels: string[];
    }, socket: Socket): void;
    handleUnsubscribe(data: {
        channels: string[];
    }, socket: Socket): void;
    handleAuctionJoin(data: {
        auctionId: string;
    }, socket: Socket): void;
    handleAuctionLeave(data: {
        auctionId: string;
    }, socket: Socket): void;
    handleBidPlacement(data: {
        auctionId: string;
        amount: number;
    }, socket: Socket): Promise<void>;
    addSSEClient(clientId: string, userId: string | undefined, response: any): void;
    removeSSEClient(clientId: string): void;
    subscribeSSEClient(clientId: string, channels: string[]): void;
    sendSSEEvent(client: SSEClient, event: string, data: any): void;
    broadcastSSEEvent(event: string, data: any, targetUsers?: string[]): void;
    emitAuctionBid(auctionId: string, bidData: any): Promise<void>;
    emitAuctionEnd(auctionId: string, endData: any): Promise<void>;
    emitUserNotification(userId: string, notification: any): Promise<void>;
    emitSystemAlert(alert: any, targetUsers?: string[]): Promise<void>;
    private sendToUser;
    private getUserSockets;
    private sendAuctionState;
    private validateAndPlaceBid;
    private setupEventListeners;
    getConnectionStats(): {
        websocketClients: number;
        sseClients: number;
        activeChannels: number;
        timestamp: Date;
    };
    cleanupInactiveConnections(): void;
}
