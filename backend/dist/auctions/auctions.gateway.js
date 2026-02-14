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
var AuctionsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const auctions_service_1 = require("./auctions.service");
let AuctionsGateway = AuctionsGateway_1 = class AuctionsGateway {
    constructor(auctionsService) {
        this.auctionsService = auctionsService;
        this.logger = new common_1.Logger(AuctionsGateway_1.name);
        this.auctionRooms = new Map();
    }
    async handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [auctionId, clients] of this.auctionRooms.entries()) {
            if (clients.has(client.id)) {
                clients.delete(client.id);
                this.logger.log(`Removed ${client.id} from auction room ${auctionId}`);
                this.server.to(auctionId).emit('userLeft', {
                    userId: client.data.userId,
                    userName: client.data.userName,
                    timestamp: new Date(),
                });
                if (clients.size === 0) {
                    this.auctionRooms.delete(auctionId);
                    this.logger.log(`Auction room ${auctionId} is now empty and cleaned up`);
                }
            }
        }
    }
    async handleJoinAuction(data, client) {
        const { auctionId, userId, userName } = data;
        client.data.userId = userId;
        client.data.userName = userName;
        client.join(auctionId);
        if (!this.auctionRooms.has(auctionId)) {
            this.auctionRooms.set(auctionId, new Set());
        }
        this.auctionRooms.get(auctionId).add(client.id);
        this.logger.log(`User ${userName} (${userId}) joined auction ${auctionId}`);
        client.to(auctionId).emit('userJoined', {
            userId,
            userName,
            timestamp: new Date(),
            totalUsers: this.auctionRooms.get(auctionId).size,
        });
        const auctionState = await this.auctionsService.getAuctionState(auctionId);
        client.emit('auctionState', auctionState);
        return { success: true, message: 'Joined auction successfully' };
    }
    async handleLeaveAuction(data, client) {
        const { auctionId } = data;
        client.leave(auctionId);
        if (this.auctionRooms.has(auctionId)) {
            this.auctionRooms.get(auctionId).delete(client.id);
            this.server.to(auctionId).emit('userLeft', {
                userId: client.data.userId,
                userName: client.data.userName,
                timestamp: new Date(),
                totalUsers: this.auctionRooms.get(auctionId).size,
            });
            if (this.auctionRooms.get(auctionId).size === 0) {
                this.auctionRooms.delete(auctionId);
            }
        }
        return { success: true, message: 'Left auction successfully' };
    }
    async handlePlaceBid(data, client) {
        try {
            const { auctionId, userId, amount, userName } = data;
            this.logger.log(`Bid attempt: User ${userName} bidding ₹${amount} on auction ${auctionId}`);
            const bidResult = await this.auctionsService.placeBid({
                auctionId,
                userId,
                amount,
                userName,
            });
            if (bidResult.success) {
                this.server.to(auctionId).emit('bidPlaced', {
                    bid: bidResult.bid,
                    auctionState: bidResult.auctionState,
                    timestamp: new Date(),
                });
                this.logger.log(`Bid successful: ₹${amount} by ${userName} on auction ${auctionId}`);
                client.emit('bidConfirmed', {
                    bid: bidResult.bid,
                    message: 'Your bid has been placed successfully!',
                });
                if (bidResult.shouldExtend) {
                    this.server.to(auctionId).emit('auctionExtended', {
                        newEndTime: bidResult.newEndTime,
                        reason: 'Anti-sniping: Last minute bid extended auction',
                    });
                }
                return { success: true, bid: bidResult.bid };
            }
            else {
                client.emit('bidRejected', {
                    reason: bidResult.reason,
                    message: bidResult.message,
                });
                this.logger.warn(`Bid rejected: ${bidResult.reason} for user ${userName} on auction ${auctionId}`);
                return { success: false, reason: bidResult.reason };
            }
        }
        catch (error) {
            this.logger.error(`Bid error: ${error.message}`, error.stack);
            client.emit('bidError', {
                message: 'An error occurred while placing your bid. Please try again.',
            });
            return { success: false, error: error.message };
        }
    }
    async handleGetAuctionState(data, client) {
        const { auctionId } = data;
        try {
            const auctionState = await this.auctionsService.getAuctionState(auctionId);
            client.emit('auctionState', auctionState);
            return { success: true, auctionState };
        }
        catch (error) {
            this.logger.error(`Get auction state error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async handleStartAuction(data, client) {
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
        }
        catch (error) {
            this.logger.error(`Start auction error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async handleEndAuction(data, client) {
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
        }
        catch (error) {
            this.logger.error(`End auction error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async handlePauseAuction(data, client) {
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
        }
        catch (error) {
            this.logger.error(`Pause auction error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    broadcastAuctionUpdate(auctionId, update) {
        this.server.to(auctionId).emit('auctionUpdate', update);
    }
    notifyUser(userId, event, data) {
        const sockets = this.server.sockets.sockets;
        for (const [socketId, socket] of sockets.entries()) {
            if (socket.data.userId === userId) {
                socket.emit(event, data);
            }
        }
    }
    getRoomStats(auctionId) {
        const clients = this.auctionRooms.get(auctionId);
        return {
            auctionId,
            totalUsers: clients ? clients.size : 0,
            userList: clients ? Array.from(clients) : [],
        };
    }
};
exports.AuctionsGateway = AuctionsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AuctionsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinAuction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handleJoinAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveAuction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handleLeaveAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('placeBid'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handlePlaceBid", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getAuctionState'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handleGetAuctionState", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('startAuction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handleStartAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('endAuction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handleEndAuction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('pauseAuction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AuctionsGateway.prototype, "handlePauseAuction", null);
exports.AuctionsGateway = AuctionsGateway = AuctionsGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
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
    }),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService])
], AuctionsGateway);
//# sourceMappingURL=auctions.gateway.js.map