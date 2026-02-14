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
var PenaltyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
let PenaltyService = PenaltyService_1 = class PenaltyService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PenaltyService_1.name);
        this.penaltyRules = {
            late_delivery: {
                type: 'late_delivery',
                severity: 'low',
                baseAmount: 500,
                durationDays: 30,
                triggersCooldown: false,
                description: 'Late delivery of auction item',
            },
            non_delivery: {
                type: 'non_delivery',
                severity: 'high',
                baseAmount: 2000,
                durationDays: 90,
                triggersCooldown: true,
                cooldownType: 'listing_ban',
                cooldownDays: 7,
                description: 'Failure to deliver auction item',
            },
            fake_product: {
                type: 'fake_product',
                severity: 'critical',
                baseAmount: 5000,
                durationDays: 180,
                triggersCooldown: true,
                cooldownType: 'listing_ban',
                cooldownDays: 30,
                description: 'Selling counterfeit or fake products',
            },
            misdescription: {
                type: 'misdescription',
                severity: 'medium',
                baseAmount: 1000,
                durationDays: 60,
                triggersCooldown: false,
                description: 'Product description does not match actual item',
            },
            poor_quality: {
                type: 'poor_quality',
                severity: 'medium',
                baseAmount: 1500,
                durationDays: 45,
                triggersCooldown: false,
                description: 'Product quality significantly below expectations',
            },
            fraud: {
                type: 'fraud',
                severity: 'critical',
                baseAmount: 10000,
                durationDays: 365,
                triggersCooldown: true,
                cooldownType: 'account_suspension',
                cooldownDays: 90,
                description: 'Fraudulent activity or scam',
            },
            multiple_violations: {
                type: 'multiple_violations',
                severity: 'high',
                baseAmount: 3000,
                durationDays: 120,
                triggersCooldown: true,
                cooldownType: 'auction_ban',
                cooldownDays: 14,
                description: 'Multiple policy violations within short period',
            },
            spam_listing: {
                type: 'spam_listing',
                severity: 'medium',
                baseAmount: 800,
                durationDays: 30,
                triggersCooldown: true,
                cooldownType: 'feature_restriction',
                cooldownDays: 3,
                description: 'Creating spam or duplicate listings',
            },
            inappropriate_content: {
                type: 'inappropriate_content',
                severity: 'high',
                baseAmount: 2500,
                durationDays: 60,
                triggersCooldown: true,
                cooldownType: 'listing_ban',
                cooldownDays: 7,
                description: 'Inappropriate or prohibited content in listings',
            },
            payment_dispute: {
                type: 'payment_dispute',
                severity: 'medium',
                baseAmount: 1200,
                durationDays: 45,
                triggersCooldown: false,
                description: 'Disputed payment or transaction issues',
            },
            buyer_complaint: {
                type: 'buyer_complaint',
                severity: 'low',
                baseAmount: 300,
                durationDays: 15,
                triggersCooldown: false,
                description: 'Buyer complaint or dissatisfaction',
            },
            system_abuse: {
                type: 'system_abuse',
                severity: 'high',
                baseAmount: 4000,
                durationDays: 90,
                triggersCooldown: true,
                cooldownType: 'feature_restriction',
                cooldownDays: 14,
                description: 'Abusing platform systems or features',
            },
        };
    }
    async calculateRiskScore(sellerId) {
        try {
            const activePenalties = await this.getActivePenalties(sellerId);
            const penaltyHistory = await this.getPenaltyHistory(sellerId, 90);
            const performanceMetrics = await this.getSellerPerformanceMetrics(sellerId);
            const deliveryScore = this.calculateDeliveryScore(penaltyHistory, performanceMetrics);
            const qualityScore = this.calculateQualityScore(penaltyHistory, performanceMetrics);
            const behaviorScore = this.calculateBehaviorScore(penaltyHistory, performanceMetrics);
            const complianceScore = this.calculateComplianceScore(activePenalties, penaltyHistory);
            const componentScores = {
                delivery: deliveryScore,
                quality: qualityScore,
                behavior: behaviorScore,
                compliance: complianceScore,
            };
            const overallScore = Math.round((deliveryScore * 0.3) +
                (qualityScore * 0.3) +
                (behaviorScore * 0.25) +
                (complianceScore * 0.15));
            const riskLevel = this.getRiskLevel(overallScore);
            const factors = this.identifyRiskFactors(sellerId, penaltyHistory, performanceMetrics);
            const previousScore = await this.getPreviousRiskScore(sellerId);
            const trend = this.calculateTrend(overallScore, previousScore);
            const riskScore = {
                sellerId,
                overallScore,
                componentScores,
                riskLevel,
                factors,
                lastCalculated: new Date(),
                trend,
            };
            await this.storeRiskScore(riskScore);
            return riskScore;
        }
        catch (error) {
            this.logger.error(`Failed to calculate risk score for seller ${sellerId}:`, error);
            throw error;
        }
    }
    async applyPenalty(sellerId, type, details) {
        try {
            const rule = this.penaltyRules[type];
            if (!rule) {
                throw new common_1.BadRequestException(`Unknown penalty type: ${type}`);
            }
            const severity = details.severity || rule.severity;
            const penaltyAmount = await this.calculatePenaltyAmount(sellerId, rule.baseAmount, severity);
            const penalty = {
                id: this.generatePenaltyId(),
                sellerId,
                type,
                severity,
                description: details.description,
                amount: penaltyAmount,
                status: 'active',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + (rule.durationDays * 24 * 60 * 60 * 1000)),
                relatedAuctionId: details.relatedAuctionId,
                relatedBidId: details.relatedBidId,
                evidence: details.evidence,
                automated: !details.reportedBy,
            };
            await this.storePenalty(penalty);
            if (rule.triggersCooldown) {
                await this.applyCooldownFromPenalty(penalty, rule);
            }
            await this.calculateRiskScore(sellerId);
            this.eventEmitter.emit('penalty.applied', {
                penalty,
                sellerId,
                type,
                amount: penaltyAmount,
            });
            this.logger.log(`Penalty applied to seller ${sellerId}: ${type} - ₹${penaltyAmount}`);
            return penalty;
        }
        catch (error) {
            this.logger.error(`Failed to apply penalty to seller ${sellerId}:`, error);
            throw error;
        }
    }
    async applyCooldown(sellerId, type, durationDays, reason, triggeredBy = 'system', appealable = true) {
        try {
            const existingCooldown = await this.getActiveCooldownByType(sellerId, type);
            if (existingCooldown) {
                existingCooldown.endDate = new Date(Math.max(existingCooldown.endDate.getTime(), Date.now() + (durationDays * 24 * 60 * 60 * 1000)));
                existingCooldown.description = `${existingCooldown.description} (Extended: ${reason})`;
                await this.updateCooldown(existingCooldown);
                return existingCooldown;
            }
            const cooldown = {
                id: this.generateCooldownId(),
                sellerId,
                type,
                severity: this.getCooldownSeverity(type),
                description: reason,
                startDate: new Date(),
                endDate: new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000)),
                isActive: true,
                reason,
                triggeredBy,
                appealable,
            };
            await this.storeCooldown(cooldown);
            this.eventEmitter.emit('cooldown.applied', {
                cooldown,
                sellerId,
                type,
                durationDays,
            });
            this.logger.log(`Cooldown applied to seller ${sellerId}: ${type} for ${durationDays} days`);
            return cooldown;
        }
        catch (error) {
            this.logger.error(`Failed to apply cooldown to seller ${sellerId}:`, error);
            throw error;
        }
    }
    async checkSellerPermissions(sellerId) {
        try {
            const activeCooldowns = await this.getActiveCooldowns(sellerId);
            const activePenalties = await this.getActivePenalties(sellerId);
            const riskScore = await this.calculateRiskScore(sellerId);
            const restrictions = [];
            const listingBan = activeCooldowns.find(c => c.type === 'listing_ban');
            const accountSuspension = activeCooldowns.find(c => c.type === 'account_suspension');
            const canListProducts = {
                allowed: !listingBan && !accountSuspension,
                reason: listingBan ? listingBan.description : accountSuspension ? accountSuspension.description : undefined,
                cooldownEnd: listingBan?.endDate || accountSuspension?.endDate,
            };
            const auctionBan = activeCooldowns.find(c => c.type === 'auction_ban');
            const canParticipateInAuctions = {
                allowed: !auctionBan && !accountSuspension && riskScore.riskLevel !== 'critical',
                reason: auctionBan ? auctionBan.description :
                    accountSuspension ? accountSuspension.description :
                        riskScore.riskLevel === 'critical' ? 'High risk account - auction participation restricted' : undefined,
                cooldownEnd: auctionBan?.endDate || accountSuspension?.endDate,
            };
            const canReceivePayments = {
                allowed: !accountSuspension && activePenalties.filter(p => p.severity === 'critical').length === 0,
                reason: accountSuspension ? 'Account suspended' :
                    activePenalties.some(p => p.severity === 'critical') ? 'Critical violations prevent payment processing' : undefined,
            };
            if (!canListProducts.allowed) {
                restrictions.push(`Product listing restricted until ${canListProducts.cooldownEnd?.toLocaleDateString()}`);
            }
            if (!canParticipateInAuctions.allowed) {
                restrictions.push(`Auction participation restricted until ${canParticipateInAuctions.cooldownEnd?.toLocaleDateString()}`);
            }
            if (!canReceivePayments.allowed) {
                restrictions.push('Payment processing restricted');
            }
            return {
                canListProducts,
                canParticipateInAuctions,
                canReceivePayments,
                restrictions,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check permissions for seller ${sellerId}:`, error);
            throw error;
        }
    }
    async getActivePenalties(sellerId) {
        return [
            {
                id: 'pen_001',
                sellerId,
                type: 'late_delivery',
                severity: 'low',
                description: 'Late delivery of auction item',
                amount: 500,
                status: 'active',
                createdAt: new Date(Date.now() - 86400000),
                expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
                automated: true,
            },
        ];
    }
    async getActiveCooldowns(sellerId) {
        return [];
    }
    async getPenaltyHistory(sellerId, days = 90) {
        return await this.getActivePenalties(sellerId);
    }
    async appealPenalty(penaltyId, appealReason, evidence) {
        try {
            this.logger.log(`Penalty appeal submitted for penalty ${penaltyId}: ${appealReason}`);
            return {
                success: true,
                message: 'Appeal submitted successfully. You will be notified of the decision within 5-7 business days.',
            };
        }
        catch (error) {
            this.logger.error(`Failed to submit appeal for penalty ${penaltyId}:`, error);
            throw error;
        }
    }
    calculateDeliveryScore(penaltyHistory, metrics) {
        const deliveryPenalties = penaltyHistory.filter(p => ['late_delivery', 'non_delivery'].includes(p.type));
        let score = 100;
        deliveryPenalties.forEach(penalty => {
            score -= this.getPenaltyImpact(penalty);
        });
        const onTimeDeliveryRate = metrics.onTimeDeliveryRate || 0.95;
        score = score * onTimeDeliveryRate;
        return Math.max(0, Math.min(100, score));
    }
    calculateQualityScore(penaltyHistory, metrics) {
        const qualityPenalties = penaltyHistory.filter(p => ['fake_product', 'misdescription', 'poor_quality'].includes(p.type));
        let score = 100;
        qualityPenalties.forEach(penalty => {
            score -= this.getPenaltyImpact(penalty);
        });
        return Math.max(0, Math.min(100, score));
    }
    calculateBehaviorScore(penaltyHistory, metrics) {
        const behaviorPenalties = penaltyHistory.filter(p => ['fraud', 'system_abuse', 'inappropriate_content'].includes(p.type));
        let score = 100;
        behaviorPenalties.forEach(penalty => {
            score -= this.getPenaltyImpact(penalty);
        });
        return Math.max(0, Math.min(100, score));
    }
    calculateComplianceScore(activePenalties, penaltyHistory) {
        const compliancePenalties = penaltyHistory.filter(p => ['multiple_violations', 'spam_listing'].includes(p.type));
        let score = 100;
        activePenalties.forEach(penalty => {
            score -= this.getPenaltyImpact(penalty);
        });
        if (penaltyHistory.length > 5) {
            score -= 10;
        }
        if (penaltyHistory.length > 10) {
            score -= 15;
        }
        return Math.max(0, Math.min(100, score));
    }
    getPenaltyImpact(penalty) {
        const severityMultipliers = {
            low: 2,
            medium: 5,
            high: 10,
            critical: 25,
        };
        return severityMultipliers[penalty.severity];
    }
    getRiskLevel(score) {
        if (score >= 80)
            return 'low';
        if (score >= 60)
            return 'medium';
        if (score >= 40)
            return 'high';
        return 'critical';
    }
    identifyRiskFactors(sellerId, penaltyHistory, metrics) {
        const factors = [];
        penaltyHistory.forEach(penalty => {
            factors.push({
                type: penalty.type,
                description: penalty.description,
                impact: this.getPenaltyImpact(penalty),
                severity: penalty.severity,
                occurredAt: penalty.createdAt,
            });
        });
        return factors;
    }
    calculateTrend(currentScore, previousScore) {
        if (!previousScore)
            return 'stable';
        const difference = currentScore - previousScore;
        if (difference > 5)
            return 'improving';
        if (difference < -5)
            return 'declining';
        return 'stable';
    }
    async calculatePenaltyAmount(sellerId, baseAmount, severity) {
        const penaltyHistory = await this.getPenaltyHistory(sellerId, 365);
        const historyMultiplier = Math.min(2, 1 + (penaltyHistory.length * 0.1));
        const severityMultipliers = {
            low: 0.5,
            medium: 1,
            high: 1.5,
            critical: 2,
        };
        return Math.round(baseAmount * historyMultiplier * severityMultipliers[severity]);
    }
    async applyCooldownFromPenalty(penalty, rule) {
        if (rule.cooldownType && rule.cooldownDays) {
            await this.applyCooldown(penalty.sellerId, rule.cooldownType, rule.cooldownDays, `Automatic cooldown due to ${penalty.type} penalty`, penalty.id, true);
        }
    }
    getCooldownSeverity(type) {
        const severityMap = {
            listing_ban: 'high',
            auction_ban: 'high',
            account_suspension: 'critical',
            feature_restriction: 'medium',
            review_required: 'low',
        };
        return severityMap[type];
    }
    async getActiveCooldownByType(sellerId, type) {
        const activeCooldowns = await this.getActiveCooldowns(sellerId);
        return activeCooldowns.find(c => c.type === type) || null;
    }
    async getSellerPerformanceMetrics(sellerId) {
        return {
            onTimeDeliveryRate: 0.95,
            averageRating: 4.2,
            totalSales: 150,
            disputeRate: 0.02,
        };
    }
    async getPreviousRiskScore(sellerId) {
        return null;
    }
    generatePenaltyId() {
        return `pen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCooldownId() {
        return `cool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async storePenalty(penalty) {
        this.logger.log(`Storing penalty: ${penalty.id}`);
    }
    async storeCooldown(cooldown) {
        this.logger.log(`Storing cooldown: ${cooldown.id}`);
    }
    async updateCooldown(cooldown) {
        this.logger.log(`Updating cooldown: ${cooldown.id}`);
    }
    async storeRiskScore(riskScore) {
        this.logger.log(`Storing risk score for seller: ${riskScore.sellerId}`);
    }
};
exports.PenaltyService = PenaltyService;
exports.PenaltyService = PenaltyService = PenaltyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], PenaltyService);
//# sourceMappingURL=penalty.service.js.map