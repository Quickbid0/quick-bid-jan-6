"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealTimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
let RealTimeService = RealTimeService_1 = class RealTimeService {
    constructor(eventEmitter, prismaService) {
        this.eventEmitter = eventEmitter;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(RealTimeService_1.name);
        this.sseClients = new Map();
        this.eventSubjects = new Map();
        this.userSubscriptions = new Map();
        this.channelSubscriptions = new Map();
    }
    onModuleInit() {
        this.setupEventListeners();
    }
    onModuleDestroy() {
        for (const subject of this.eventSubjects.values()) {
            subject.complete();
        }
        this.eventSubjects.clear();
    }
    setWebSocketServer(io) {
        this.io = io;
    }
    handleUserConnect(socket, userId) {
        const clientId = socket.id;
        this.logger.log(`User connected: ${clientId} (User: ${userId || 'anonymous'})`);
        if (userId) {
            this.userSubscriptions.set(userId, new Set());
        }
        socket.emit('connected', {
            clientId,
            userId,
            timestamp: new Date(),
            message: 'Connected to QuickMela real-time service'
        });
    }
    handleUserDisconnect(socket, userId) {
        const clientId = socket.id;
        this.logger.log(`User disconnected: ${clientId} (User: ${userId || 'anonymous'})`);
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
    handleSubscribe(data, socket) {
        const { channels } = data;
        const userId = socket.userId;
        if (!userId) {
            socket.emit('error', { message: 'Authentication required for subscriptions' });
            return;
        }
        const userSubs = this.userSubscriptions.get(userId) || new Set();
        for (const channel of channels) {
            userSubs.add(channel);
            const channelSubs = this.channelSubscriptions.get(channel) || new Set();
            channelSubs.add(userId);
            this.channelSubscriptions.set(channel, channelSubs);
            socket.emit('subscribed', { channel, timestamp: new Date() });
        }
        this.userSubscriptions.set(userId, userSubs);
        this.logger.log(`User ${userId} subscribed to channels: ${channels.join(', ')}`);
    }
    handleUnsubscribe(data, socket) {
        const { channels } = data;
        const userId = socket.userId;
        if (!userId)
            return;
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
    handleAuctionJoin(data, socket) {
        const { auctionId } = data;
        const userId = socket.userId;
        if (!userId) {
            socket.emit('error', { message: 'Authentication required' });
            return;
        }
        socket.join(`auction_${auctionId}`);
        this.sendAuctionState(socket, auctionId);
        this.logger.log(`User ${userId} joined auction room: ${auctionId}`);
    }
    handleAuctionLeave(data, socket) {
        const { auctionId } = data;
        socket.leave(`auction_${auctionId}`);
        this.logger.log(`User left auction room: ${auctionId}`);
    }
    async handleBidPlacement(data, socket) {
        const { auctionId, amount } = data;
        const userId = socket.userId;
        if (!userId) {
            socket.emit('error', { message: 'Authentication required' });
            return;
        }
        try {
            const bidResult = await this.validateAndPlaceBid(auctionId, userId, amount);
            if (bidResult.success) {
                this.io.to(`auction_${auctionId}`).emit('auction:bid_placed', {
                    auctionId,
                    bid: bidResult.bid,
                    auctionState: bidResult.auctionState,
                    timestamp: new Date(),
                });
                socket.emit('bid:confirmed', {
                    bid: bidResult.bid,
                    message: 'Bid placed successfully'
                });
                this.eventEmitter.emit('auction.bidPlaced', {
                    auctionId,
                    bid: bidResult.bid,
                    auctionState: bidResult.auctionState,
                });
            }
            else {
                socket.emit('bid:rejected', {
                    reason: bidResult.reason,
                    message: bidResult.message
                });
            }
        }
        catch (error) {
            socket.emit('error', {
                message: 'Failed to place bid',
                details: error.message
            });
        }
    }
    addSSEClient(clientId, userId, response) {
        const client = {
            id: clientId,
            userId,
            response,
            lastActivity: new Date(),
            subscriptions: [],
        };
        this.sseClients.set(clientId, client);
        this.sendSSEEvent(client, 'connected', {
            clientId,
            userId,
            timestamp: new Date(),
        });
        this.logger.log(`SSE client connected: ${clientId} (User: ${userId || 'anonymous'})`);
    }
    removeSSEClient(clientId) {
        const client = this.sseClients.get(clientId);
        if (client) {
            this.sseClients.delete(clientId);
            this.logger.log(`SSE client disconnected: ${clientId}`);
        }
    }
    subscribeSSEClient(clientId, channels) {
        const client = this.sseClients.get(clientId);
        if (client) {
            client.subscriptions = [...new Set([...client.subscriptions, ...channels])];
            client.lastActivity = new Date();
        }
    }
    sendSSEEvent(client, event, data) {
        try {
            const eventData = {
                event,
                data,
                timestamp: new Date(),
            };
            client.response.write(`data: ${JSON.stringify(eventData)}\n\n`);
            client.lastActivity = new Date();
        }
        catch (error) {
            this.removeSSEClient(client.id);
        }
    }
    broadcastSSEEvent(event, data, targetUsers) {
        const clients = targetUsers
            ? Array.from(this.sseClients.values()).filter(client => targetUsers.includes(client.userId || ''))
            : Array.from(this.sseClients.values());
        for (const client of clients) {
            this.sendSSEEvent(client, event, data);
        }
    }
    async emitAuctionBid(auctionId, bidData) {
        const event = {
            type: 'auction_bid',
            auctionId,
            data: bidData,
            timestamp: new Date(),
            priority: 'high',
        };
        this.io.to(`auction_${auctionId}`).emit('auction:bid', event);
        this.broadcastSSEEvent('auction:bid', event);
        this.eventEmitter.emit('realtime.auction.bid', event);
    }
    async emitAuctionEnd(auctionId, endData) {
        const event = {
            type: 'auction_end',
            auctionId,
            data: endData,
            timestamp: new Date(),
            priority: 'urgent',
        };
        this.io.to(`auction_${auctionId}`).emit('auction:ended', event);
        this.broadcastSSEEvent('auction:ended', event);
        this.eventEmitter.emit('realtime.auction.ended', event);
    }
    async emitUserNotification(userId, notification) {
        const event = {
            type: 'user_notification',
            userId,
            data: notification,
            timestamp: new Date(),
            priority: 'normal',
        };
        this.sendToUser(userId, 'notification', event);
        this.broadcastSSEEvent('notification', event, [userId]);
        this.eventEmitter.emit('realtime.notification', event);
    }
    async emitSystemAlert(alert, targetUsers) {
        const event = {
            type: 'system_alert',
            data: alert,
            timestamp: new Date(),
            priority: 'high',
        };
        if (targetUsers) {
            for (const userId of targetUsers) {
                this.sendToUser(userId, 'system_alert', event);
            }
        }
        else {
            this.io.emit('system_alert', event);
        }
        this.broadcastSSEEvent('system_alert', event, targetUsers);
        this.eventEmitter.emit('realtime.system_alert', event);
    }
    sendToUser(userId, event, data) {
        const sockets = this.getUserSockets(userId);
        for (const socket of sockets) {
            socket.emit(event, data);
        }
    }
    getUserSockets(userId) {
        return [];
    }
    async sendAuctionState(socket, auctionId) {
        const auctionState = {
            auctionId,
            status: 'active',
            currentPrice: 10000,
            timeLeft: 1800,
            totalBids: 15,
            activeUsers: 8,
        };
        socket.emit('auction:state', auctionState);
    }
    async validateAndPlaceBid(auctionId, userId, amount) {
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
    setupEventListeners() {
        this.eventEmitter.on('auction.bidPlaced', async (data) => {
            await this.emitAuctionBid(data.auctionId, data);
        });
        this.eventEmitter.on('auction.ended', async (data) => {
            await this.emitAuctionEnd(data.auctionId, data);
        });
        this.eventEmitter.on('notification.send', async (data) => {
            await this.emitUserNotification(data.userId, data.notification);
        });
        this.eventEmitter.on('system.alert', async (data) => {
            await this.emitSystemAlert(data.alert, data.targetUsers);
        });
    }
    getConnectionStats() {
        return {
            websocketClients: this.io ? this.io.sockets.sockets.size : 0,
            sseClients: this.sseClients.size,
            activeChannels: this.channelSubscriptions.size,
            timestamp: new Date(),
        };
    }
    cleanupInactiveConnections() {
        const now = Date.now();
        const timeoutMs = 5 * 60 * 1000;
        for (const [clientId, client] of this.sseClients.entries()) {
            if (now - client.lastActivity.getTime() > timeoutMs) {
                this.removeSSEClient(clientId);
            }
        }
        this.logger.log('Cleaned up inactive SSE connections');
    }
};
exports.RealTimeService = RealTimeService;
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealTimeService.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealTimeService.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('auction:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealTimeService.prototype, "handleAuctionJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('auction:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealTimeService.prototype, "handleAuctionLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('auction:place_bid'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealTimeService.prototype, "handleBidPlacement", null);
exports.RealTimeService = RealTimeService = RealTimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        prisma_service_1.PrismaService])
], RealTimeService);
//# sourceMappingURL=real-time.service.js.map