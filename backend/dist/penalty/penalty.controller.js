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
exports.PenaltyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const penalty_service_1 = require("./penalty.service");
let PenaltyController = class PenaltyController {
    constructor(penaltyService) {
        this.penaltyService = penaltyService;
    }
    async getSellerPenalties(sellerId) {
        try {
            const penalties = await this.penaltyService.getActivePenalties(sellerId);
            const cooldowns = await this.penaltyService.getActiveCooldowns(sellerId);
            const riskScore = await this.penaltyService.calculateRiskScore(sellerId);
            const permissions = await this.penaltyService.checkSellerPermissions(sellerId);
            return {
                success: true,
                data: {
                    penalties,
                    cooldowns,
                    sellerScore: riskScore.overallScore,
                    canListProduct: permissions.canListProducts.allowed,
                    canParticipateInAuction: permissions.canParticipateInAuctions.allowed
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve penalties'
            };
        }
    }
    async addPenalty(body) {
        try {
            const penalty = await this.penaltyService.applyPenalty(body.sellerId, body.type, {
                description: body.description,
                relatedAuctionId: undefined,
                relatedBidId: undefined,
                evidence: undefined,
                reportedBy: 'admin'
            });
            return {
                success: true,
                data: penalty,
                message: 'Penalty added successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to add penalty'
            };
        }
    }
    async liftCooldown(sellerId) {
        try {
            return {
                success: true,
                message: 'Cooldown lifted successfully (mock implementation)'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to lift cooldown'
            };
        }
    }
    async getSellerScore(sellerId) {
        try {
            const riskScore = await this.penaltyService.calculateRiskScore(sellerId);
            const score = riskScore.overallScore;
            return {
                success: true,
                data: {
                    score,
                    grade: this.getScoreGrade(score),
                    status: this.getScoreStatus(score),
                    riskLevel: riskScore.riskLevel,
                    componentScores: riskScore.componentScores
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve seller score'
            };
        }
    }
    getScoreGrade(score) {
        if (score >= 90)
            return 'A+';
        if (score >= 80)
            return 'A';
        if (score >= 70)
            return 'B+';
        if (score >= 60)
            return 'B';
        if (score >= 50)
            return 'C+';
        if (score >= 40)
            return 'C';
        if (score >= 30)
            return 'D';
        return 'F';
    }
    getScoreStatus(score) {
        if (score >= 70)
            return 'Excellent';
        if (score >= 50)
            return 'Good';
        if (score >= 30)
            return 'Fair';
        return 'Poor';
    }
};
exports.PenaltyController = PenaltyController;
__decorate([
    (0, common_1.Get)('seller/:sellerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seller penalties and cooldowns' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Penalties retrieved successfully' }),
    __param(0, (0, common_1.Param)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PenaltyController.prototype, "getSellerPenalties", null);
__decorate([
    (0, common_1.Post)('add'),
    (0, swagger_1.ApiOperation)({ summary: 'Add penalty to seller' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Penalty added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PenaltyController.prototype, "addPenalty", null);
__decorate([
    (0, common_1.Post)('lift-cooldown/:sellerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lift seller cooldown' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cooldown lifted successfully' }),
    __param(0, (0, common_1.Param)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PenaltyController.prototype, "liftCooldown", null);
__decorate([
    (0, common_1.Get)('score/:sellerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seller trust score' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Score retrieved successfully' }),
    __param(0, (0, common_1.Param)('sellerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PenaltyController.prototype, "getSellerScore", null);
exports.PenaltyController = PenaltyController = __decorate([
    (0, swagger_1.ApiTags)('penalties'),
    (0, common_1.Controller)('penalties'),
    __metadata("design:paramtypes", [penalty_service_1.PenaltyService])
], PenaltyController);
//# sourceMappingURL=penalty.controller.js.map