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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
const wallet_dto_1 = require("./dto/wallet.dto");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async getBalance(req) {
        const userId = req.user?.id || 'buyer1';
        const balance = await this.walletService.getBalance(userId);
        return { balance, currency: 'INR' };
    }
    async addFunds(addFundsDto, req) {
        const userId = req.user?.id || 'buyer1';
        return this.walletService.addFunds(userId, addFundsDto.amount);
    }
    async getTransactions(query, req) {
        const userId = req.user?.id || 'buyer1';
        const result = await this.walletService.getTransactionHistory(userId, query.limit || 20, ((query.page || 1) - 1) * (query.limit || 20), query.type, query.purpose);
        return result;
    }
    async placeBid(bidDto, req) {
        const userId = req.user?.id || 'buyer1';
        return this.walletService.deductFunds(userId, bidDto.amount, 'bid_placement');
    }
    async refundBid(refundDto, req) {
        const userId = req.user?.id || 'buyer1';
        return this.walletService.processRefund({
            userId,
            amount: refundDto.amount,
            reason: refundDto.reason || 'Bid refund'
        });
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('add-funds'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_dto_1.AddFundsDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "addFunds", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_dto_1.WalletTransactionQueryDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('place-bid'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_dto_1.PlaceBidDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "placeBid", null);
__decorate([
    (0, common_1.Post)('refund-bid'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wallet_dto_1.RefundBidDto, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "refundBid", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [typeof (_a = typeof wallet_service_1.WalletService !== "undefined" && wallet_service_1.WalletService) === "function" ? _a : Object])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map