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
exports.AdminAuctionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auction_service_1 = require("./admin-auction.service");
let AdminAuctionController = class AdminAuctionController {
    constructor(adminAuctionService) {
        this.adminAuctionService = adminAuctionService;
    }
    async getAuctionMonitoring(status) {
        try {
            const result = await this.adminAuctionService.getAuctionMonitoring(status);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch auction monitoring data',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSettlements(status, limit) {
        try {
            const result = await this.adminAuctionService.getSettlements(status, limit);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch settlement data',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAuctionDetails(auctionId) {
        try {
            const result = await this.adminAuctionService.getAuctionDetails(auctionId);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch auction details',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async performAdminAction(actionRequest) {
        try {
            const result = await this.adminAuctionService.performAdminAction(actionRequest);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to perform admin action',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processSettlement(auctionId, body) {
        try {
            const result = await this.adminAuctionService.processSettlement(auctionId, body.notes);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to process settlement',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAnalyticsOverview(period) {
        try {
            const result = await this.adminAuctionService.getAnalyticsOverview(period);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch analytics data',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFraudMonitoring() {
        try {
            const result = await this.adminAuctionService.getFraudMonitoring();
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch fraud monitoring data',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async performEmergencyAction(body) {
        try {
            const result = await this.adminAuctionService.performEmergencyAction(body);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to perform emergency action',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSystemHealth() {
        try {
            const result = await this.adminAuctionService.getSystemHealth();
            return result;
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to fetch system health data',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AdminAuctionController = AdminAuctionController;
__decorate([
    (0, common_1.Get)('monitoring'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time auction monitoring data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auction monitoring data retrieved' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "getAuctionMonitoring", null);
__decorate([
    (0, common_1.Get)('settlements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get settlement data for completed auctions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement data retrieved' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "getSettlements", null);
__decorate([
    (0, common_1.Get)(':auctionId/details'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed auction information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auction details retrieved' }),
    __param(0, (0, common_1.Param)('auctionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "getAuctionDetails", null);
__decorate([
    (0, common_1.Post)('action'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform admin action on auction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Action performed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "performAdminAction", null);
__decorate([
    (0, common_1.Post)('settlements/:auctionId/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process settlement for completed auction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement processed successfully' }),
    __param(0, (0, common_1.Param)('auctionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "processSettlement", null);
__decorate([
    (0, common_1.Get)('analytics/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get auction analytics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics data retrieved' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "getAnalyticsOverview", null);
__decorate([
    (0, common_1.Get)('fraud-monitoring'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fraud monitoring data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fraud monitoring data retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "getFraudMonitoring", null);
__decorate([
    (0, common_1.Post)('emergency-controls'),
    (0, swagger_1.ApiOperation)({ summary: 'Emergency controls for auction platform' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Emergency action performed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "performEmergencyAction", null);
__decorate([
    (0, common_1.Get)('system-health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health data retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAuctionController.prototype, "getSystemHealth", null);
exports.AdminAuctionController = AdminAuctionController = __decorate([
    (0, swagger_1.ApiTags)('admin-auctions'),
    (0, common_1.Controller)('admin/auctions'),
    __metadata("design:paramtypes", [admin_auction_service_1.AdminAuctionService])
], AdminAuctionController);
//# sourceMappingURL=admin-auction.controller.js.map