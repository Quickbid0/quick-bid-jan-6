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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsController = void 0;
const common_1 = require("@nestjs/common");
const auctions_service_1 = require("./auctions.service");
let AuctionsController = class AuctionsController {
    constructor(auctionsService) {
        this.auctionsService = auctionsService;
    }
    async create(createAuctionDto, req) {
        const sellerId = req.user?.id || 'seller1';
        return this.auctionsService.createAuction(createAuctionDto);
    }
    async findAll() {
        return this.auctionsService.getAuctionsByType('active');
    }
    async findActive() {
        return this.auctionsService.getAuctionsByType('active');
    }
    async findDraft() {
        return this.auctionsService.getAuctionsByType('draft');
    }
    async findEnded() {
        return this.auctionsService.getAuctionsByType('ended');
    }
    async findOne(id) {
        return this.auctionsService.getAuctionState(id);
    }
    async startAuction(id, req) {
        const adminId = req.user?.id || 'admin';
        return this.auctionsService.startAuction(id, adminId);
    }
    async endAuction(id, req) {
        const adminId = req.user?.id || 'admin';
        return this.auctionsService.endAuction(id, adminId);
    }
    async pauseAuction(id, req) {
        const adminId = req.user?.id || 'admin';
        return this.auctionsService.pauseAuction(id, adminId);
    }
    async placeBid(id, bidDto, req) {
        const userId = req.user?.id || 'bidder1';
        const userName = req.user?.name || 'Demo Bidder';
        return this.auctionsService.placeBid({
            auctionId: id,
            userId,
            amount: bidDto.amount,
            userName
        });
    }
    async update(id, updateAuctionDto) {
        return this.auctionsService.updateAuctionSettings(id, updateAuctionDto);
    }
    async remove(id) {
        return { message: 'Auction removal not implemented' };
    }
    async getStats(id) {
        return this.auctionsService.getAuctionStats(id);
    }
};
exports.AuctionsController = AuctionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('draft'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "findDraft", null);
__decorate([
    (0, common_1.Get)('ended'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "findEnded", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "startAuction", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "endAuction", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "pauseAuction", null);
__decorate([
    (0, common_1.Post)(':id/bid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "placeBid", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionsController.prototype, "getStats", null);
exports.AuctionsController = AuctionsController = __decorate([
    (0, common_1.Controller)('auctions'),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService])
], AuctionsController);
//# sourceMappingURL=auctions.controller.js.map