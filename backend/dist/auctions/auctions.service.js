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
var AuctionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
var AuctionType;
(function (AuctionType) {
    AuctionType["LIVE"] = "live";
    AuctionType["TIMED"] = "timed";
    AuctionType["FLASH"] = "flash";
    AuctionType["TENDER"] = "tender";
})(AuctionType || (AuctionType = {}));
var AuctionStatus;
(function (AuctionStatus) {
    AuctionStatus["DRAFT"] = "draft";
    AuctionStatus["ACTIVE"] = "active";
    AuctionStatus["PAUSED"] = "paused";
    AuctionStatus["ENDED"] = "ended";
})(AuctionStatus || (AuctionStatus = {}));
let AuctionsService = AuctionsService_1 = class AuctionsService {
    constructor(eventEmitter, prisma) {
        this.eventEmitter = eventEmitter;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuctionsService_1.name);
        this.auctionStates = new Map();
        this.activeTimers = new Map();
        this.auctionConfigs = {
            live: {
                requiresTokenDeposit: true,
                tokenDepositAmount: 5000,
                hasLiveStream: true,
                allowsChat: true,
                realTimeBidding: true,
            },
            timed: {
                autoExtend: true,
                extensionTime: 2 * 60 * 1000,
                triggerTime: 5 * 60 * 1000,
                hasAntiSniping: true,
            },
            flash: {
                durationMinutes: 5,
                noExtensions: true,
                highFrequencyBidding: true,
            },
            tender: {
                minimumBidders: 3,
                qualificationRequired: true,
                businessOnly: true,
                longerDuration: true,
            },
        };
    }
    async getAuctionState(auctionId) {
        if (this.auctionStates.has(auctionId)) {
            const state = this.auctionStates.get(auctionId);
            state.timeLeft = Math.max(0, Math.floor((state.endTime.getTime() - Date.now()) / 1000));
            return state;
        }
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
        });
        if (!auction) {
            throw new common_1.NotFoundException(`Auction ${auctionId} not found`);
        }
        const auctionState = {
            auctionId: auction.id,
            status: this.mapAuctionStatus(auction.status),
            currentPrice: auction.currentBid,
            startPrice: auction.startPrice,
            endTime: auction.endTime,
            timeLeft: Math.max(0, Math.floor((auction.endTime.getTime() - Date.now()) / 1000)),
            totalBids: 0,
            activeUsers: 0,
            isExtended: false,
            auctionType: 'timed',
            requiresTokenDeposit: false,
            minimumBidders: 0,
        };
        this.auctionStates.set(auctionId, auctionState);
        return auctionState;
    }
    mapAuctionStatus(dbStatus) {
        switch (dbStatus) {
            case 'active': return 'active';
            case 'ended': return 'ended';
            case 'paused': return 'paused';
            default: return 'waiting';
        }
    }
    async placeBid(bidRequest) {
        const { auctionId, userId, amount, userName } = bidRequest;
        try {
            const auctionState = await this.getAuctionState(auctionId);
            const validationResult = await this.validateBidForAuctionType(auctionState, bidRequest);
            if (!validationResult.valid) {
                return {
                    success: false,
                    reason: validationResult.reason,
                    message: validationResult.message,
                };
            }
            if (auctionState.status !== 'active') {
                return {
                    success: false,
                    reason: 'auction_not_active',
                    message: 'Auction is not currently active',
                };
            }
            if (auctionState.timeLeft <= 0) {
                return {
                    success: false,
                    reason: 'auction_ended',
                    message: 'Auction has already ended',
                };
            }
            const bidValidation = this.validateBidAmount(auctionState, amount);
            if (!bidValidation.valid) {
                return {
                    success: false,
                    reason: bidValidation.reason,
                    message: bidValidation.message,
                };
            }
            if (auctionState.buyNowPrice && amount >= auctionState.buyNowPrice) {
                await this.endAuction(auctionId, 'system', userId);
                return {
                    success: true,
                    bid: {
                        id: this.generateBidId(),
                        auctionId,
                        userId,
                        userName,
                        amount,
                        timestamp: new Date(),
                        isBuyNow: true,
                    },
                    auctionState: await this.getAuctionState(auctionId),
                    message: 'Buy Now triggered! Auction ended.',
                };
            }
            const bid = {
                id: this.generateBidId(),
                auctionId,
                userId,
                userName,
                amount,
                timestamp: new Date(),
                isBuyNow: false,
            };
            auctionState.currentPrice = amount;
            auctionState.totalBids += 1;
            auctionState.lastBid = {
                userId,
                userName,
                amount,
                timestamp: bid.timestamp,
            };
            const extensionResult = await this.handlePostBidLogic(auctionState, bid);
            this.auctionStates.set(auctionId, auctionState);
            this.eventEmitter.emit('auction.bidPlaced', {
                auctionId,
                bid,
                auctionState,
                auctionType: auctionState.auctionType,
            });
            this.logger.log(`Bid placed: ₹${amount} by ${userName} on ${auctionState.auctionType} auction ${auctionId}`);
            return {
                success: true,
                bid,
                auctionState,
                shouldExtend: extensionResult.shouldExtend,
                newEndTime: extensionResult.newEndTime,
            };
        }
        catch (error) {
            this.logger.error(`Bid placement error: ${error.message}`, error.stack);
            return {
                success: false,
                reason: 'internal_error',
                message: 'An error occurred while placing your bid. Please try again.',
            };
        }
    }
    async validateBidForAuctionType(auctionState, bidRequest) {
        const { userId } = bidRequest;
        switch (auctionState.auctionType) {
            case 'live':
                if (auctionState.requiresTokenDeposit) {
                    this.logger.log(`Live auction bid - token deposit would be required for user ${userId}`);
                }
                return { valid: true };
            case 'tender':
                if (auctionState.minimumBidders && auctionState.activeUsers < auctionState.minimumBidders) {
                    return {
                        valid: false,
                        reason: 'minimum_bidders_not_met',
                        message: `Tender auction requires minimum ${auctionState.minimumBidders} bidders`,
                    };
                }
                return { valid: true };
            case 'flash':
                return { valid: true };
            case 'timed':
            default:
                return { valid: true };
        }
    }
    validateBidAmount(auctionState, amount) {
        if (amount <= auctionState.currentPrice) {
            return {
                valid: false,
                reason: 'bid_too_low',
                message: `Bid must be higher than current price of ₹${auctionState.currentPrice}`,
            };
        }
        const minIncrement = this.getMinimumIncrement(auctionState.auctionType, auctionState.currentPrice);
        if (amount < auctionState.currentPrice + minIncrement) {
            return {
                valid: false,
                reason: 'bid_increment_too_small',
                message: `Minimum bid increment is ₹${minIncrement}`,
            };
        }
        return { valid: true };
    }
    getMinimumIncrement(auctionType, currentPrice) {
        switch (auctionType) {
            case 'flash':
                return Math.max(50, Math.floor(currentPrice * 0.01));
            case 'live':
                return Math.max(100, Math.floor(currentPrice * 0.02));
            case 'tender':
                return 500;
            case 'timed':
            default:
                return Math.max(100, Math.floor(currentPrice * 0.05));
        }
    }
    async handlePostBidLogic(auctionState, bid) {
        switch (auctionState.auctionType) {
            case 'timed':
                if (auctionState.timeLeft <= (this.auctionConfigs.timed.triggerTime / 1000)) {
                    const newEndTime = new Date(auctionState.endTime.getTime() + this.auctionConfigs.timed.extensionTime);
                    auctionState.endTime = newEndTime;
                    auctionState.isExtended = true;
                    this.logger.log(`Anti-sniping triggered for timed auction ${auctionState.auctionId}. Extended by ${this.auctionConfigs.timed.extensionTime / 1000} seconds`);
                    return {
                        shouldExtend: true,
                        newEndTime,
                    };
                }
                break;
            case 'flash':
                break;
            case 'live':
                break;
            case 'tender':
                break;
        }
        return {
            shouldExtend: false,
        };
    }
    async startAuction(auctionId, adminId) {
        try {
            const auctionState = await this.getAuctionState(auctionId);
            if (auctionState.status === 'active') {
                return {
                    success: false,
                    error: 'Auction is already active',
                };
            }
            auctionState.status = 'active';
            auctionState.endTime = new Date(Date.now() + 30 * 60 * 1000);
            this.auctionStates.set(auctionId, auctionState);
            this.scheduleAuctionEnd(auctionId);
            this.logger.log(`Auction ${auctionId} started by admin ${adminId}`);
            return {
                success: true,
                startTime: new Date(),
                endTime: auctionState.endTime,
                message: 'Auction started successfully',
            };
        }
        catch (error) {
            this.logger.error(`Start auction error: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async endAuction(auctionId, adminId, winnerUserId) {
        try {
            const auctionState = await this.getAuctionState(auctionId);
            if (auctionState.status === 'ended') {
                return {
                    success: false,
                    error: 'Auction has already ended',
                };
            }
            auctionState.status = 'ended';
            auctionState.timeLeft = 0;
            this.auctionStates.set(auctionId, auctionState);
            if (this.activeTimers.has(auctionId)) {
                clearTimeout(this.activeTimers.get(auctionId));
                this.activeTimers.delete(auctionId);
            }
            let winner = null;
            if (auctionState.lastBid) {
                winner = {
                    userId: winnerUserId || auctionState.lastBid.userId,
                    userName: auctionState.lastBid.userName,
                    winningBid: auctionState.lastBid.amount,
                };
            }
            this.eventEmitter.emit('auction.ended', {
                auctionId,
                winner,
                finalPrice: winner ? winner.winningBid : auctionState.currentPrice,
                endTime: new Date(),
            });
            this.logger.log(`Auction ${auctionId} ended. Winner: ${winner ? winner.userName : 'No winner'}`);
            return {
                success: true,
                winner,
                finalPrice: winner ? winner.winningBid : auctionState.currentPrice,
                endTime: new Date(),
                message: 'Auction ended successfully',
            };
        }
        catch (error) {
            this.logger.error(`End auction error: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async pauseAuction(auctionId, adminId) {
        try {
            const auctionState = await this.getAuctionState(auctionId);
            if (auctionState.status !== 'active') {
                return {
                    success: false,
                    error: 'Auction is not currently active',
                };
            }
            auctionState.status = 'paused';
            this.auctionStates.set(auctionId, auctionState);
            if (this.activeTimers.has(auctionId)) {
                clearTimeout(this.activeTimers.get(auctionId));
                this.activeTimers.delete(auctionId);
            }
            this.logger.log(`Auction ${auctionId} paused by admin ${adminId}`);
            return {
                success: true,
                pauseTime: new Date(),
                reason: 'Administrative pause',
                message: 'Auction paused successfully',
            };
        }
        catch (error) {
            this.logger.error(`Pause auction error: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    scheduleAuctionEnd(auctionId) {
        const auctionState = this.auctionStates.get(auctionId);
        if (!auctionState)
            return;
        const timeLeft = auctionState.endTime.getTime() - Date.now();
        if (timeLeft > 0) {
            const timer = setTimeout(async () => {
                await this.endAuction(auctionId, 'system');
            }, timeLeft);
            this.activeTimers.set(auctionId, timer);
        }
    }
    generateBidId() {
        return `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async getActiveAuctions() {
        const activeAuctions = [];
        for (const [auctionId, state] of this.auctionStates.entries()) {
            if (state.status === 'active') {
                state.timeLeft = Math.max(0, Math.floor((state.endTime.getTime() - Date.now()) / 1000));
                activeAuctions.push(state);
            }
        }
        return activeAuctions;
    }
    async getAuctionStats(auctionId) {
        const state = await this.getAuctionState(auctionId);
        return {
            auctionId,
            status: state.status,
            currentPrice: state.currentPrice,
            totalBids: state.totalBids,
            timeLeft: state.timeLeft,
            isExtended: state.isExtended,
            lastBid: state.lastBid,
        };
    }
    async createAuction(auctionData) {
        const data = {
            title: auctionData.title || '',
            productId: auctionData.productId || '',
            sellerId: auctionData.sellerId || '',
            startPrice: auctionData.startPrice || 0,
            currentBid: auctionData.currentBid || auctionData.startPrice || 0,
            endTime: auctionData.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: auctionData.status || 'draft',
        };
        return await this.prisma.auction.create({
            data,
        });
    }
    async getAuctionsByType(status) {
        return await this.prisma.auction.findMany({
            where: { status },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateAuctionSettings(auctionId, settings) {
        throw new common_1.BadRequestException('Auction settings not supported in current schema');
    }
};
exports.AuctionsService = AuctionsService;
exports.AuctionsService = AuctionsService = AuctionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        prisma_service_1.PrismaService])
], AuctionsService);
//# sourceMappingURL=auctions.service.js.map