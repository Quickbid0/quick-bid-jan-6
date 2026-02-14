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
exports.ObservabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const observability_service_1 = require("./observability.service");
let ObservabilityController = class ObservabilityController {
    constructor(observabilityService) {
        this.observabilityService = observabilityService;
    }
    async getMetrics(timeRange) {
        return await this.observabilityService.getMetricsSummary(timeRange);
    }
    exportMetrics() {
        return {
            data: this.observabilityService.exportMetrics(),
            contentType: 'application/json',
            filename: `quickbid-auth-metrics-${new Date().toISOString().split('T')[0]}.json`
        };
    }
    async getAuditLogs(page, limit, action, userId, startDate, endDate, severity) {
        const options = {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
        };
        if (action)
            options.action = action;
        if (userId)
            options.userId = userId;
        if (severity)
            options.severity = severity;
        if (startDate)
            options.startDate = new Date(startDate);
        if (endDate)
            options.endDate = new Date(endDate);
        return await this.observabilityService.getAuditLogs(options);
    }
};
exports.ObservabilityController = ObservabilityController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get authentication metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/export'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Export metrics for external monitoring' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics exported successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ObservabilityController.prototype, "exportMetrics", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit logs retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('severity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "getAuditLogs", null);
exports.ObservabilityController = ObservabilityController = __decorate([
    (0, swagger_1.ApiTags)('Observability'),
    (0, common_1.Controller)('admin/observability'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [observability_service_1.ObservabilityService])
], ObservabilityController);
//# sourceMappingURL=observability.controller.js.map