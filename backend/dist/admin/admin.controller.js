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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const approval_service_1 = require("./approval.service");
const enhanced_user_management_service_1 = require("./enhanced-user-management.service");
const enhanced_product_management_service_1 = require("./enhanced-product-management.service");
const ai_service_1 = require("../ai/ai.service");
let AdminController = class AdminController {
    constructor(dashboardService, approvalService, userManagementService, productManagementService, aiService) {
        this.dashboardService = dashboardService;
        this.approvalService = approvalService;
        this.userManagementService = userManagementService;
        this.productManagementService = productManagementService;
        this.aiService = aiService;
    }
    async getDashboardStats() {
        return await this.dashboardService.getDashboardStats();
    }
    async getAnalyticsData(days = 30) {
        return await this.dashboardService.getAnalyticsData(days);
    }
    async getSystemHealth() {
        return await this.dashboardService.getSystemHealth();
    }
    async getPendingApprovals() {
        return await this.dashboardService.getPendingApprovals();
    }
    async createApprovalRequest(data) {
        return await this.approvalService.createApprovalRequest(data);
    }
    async getPendingApprovalsList(filters) {
        return await this.approvalService.getPendingApprovals(filters);
    }
    async reviewApprovalRequest(approvalId, data) {
        return await this.approvalService.reviewApprovalRequest(approvalId, data.reviewerId, data.action, data.notes);
    }
    async getApprovalWorkflows() {
        return await this.approvalService.getApprovalWorkflows();
    }
    async getUserAnalytics() {
        return await this.userManagementService.getUserAnalytics();
    }
    async getUsersWithFilters(filters) {
        return await this.userManagementService.getUsersWithFilters(filters);
    }
    async performBulkUserOperation(operation) {
        return await this.userManagementService.performBulkUserOperation(operation);
    }
    async getUserDetails(userId) {
        return await this.userManagementService.getUserDetails(userId);
    }
    async suspendUser(userId, data) {
        return await this.userManagementService.suspendUser(userId, data.adminId, data.reason);
    }
    async activateUser(userId, data) {
        return await this.userManagementService.activateUser(userId, data.adminId);
    }
    async changeUserRole(userId, data) {
        return await this.userManagementService.changeUserRole(userId, data.newRole, data.adminId);
    }
    async sendUserNotification(userId, data) {
        return await this.userManagementService.sendUserNotification(userId, data.message, data.adminId);
    }
    async getProductAnalytics() {
        return await this.productManagementService.getProductAnalytics();
    }
    async getProductsWithFilters(filters) {
        return await this.productManagementService.getProductsWithFilters(filters);
    }
    async performBulkProductOperation(operation) {
        return await this.productManagementService.performBulkProductOperation(operation);
    }
    async getProductDetails(productId) {
        return await this.productManagementService.getProductDetails(productId);
    }
    async approveProduct(productId, data) {
        return await this.productManagementService.approveProduct(productId, data.adminId);
    }
    async rejectProduct(productId, data) {
        return await this.productManagementService.rejectProduct(productId, data.adminId, data.reason);
    }
    async suspendProduct(productId, data) {
        return await this.productManagementService.suspendProduct(productId, data.adminId, data.reason);
    }
    async changeProductCategory(productId, data) {
        return await this.productManagementService.changeProductCategory(productId, data.newCategory, data.adminId);
    }
    async updateProductPrice(productId, data) {
        return await this.productManagementService.updateProductPrice(productId, data.newPrice, data.adminId);
    }
    async detectDuplicateProducts() {
        return await this.productManagementService.detectDuplicateProducts();
    }
    async detectFraud(bidData) {
        return await this.aiService.detectFraud(bidData);
    }
    async predictPrice(productData) {
        return await this.aiService.predictPrice(productData);
    }
    async getRecommendations(userId, context) {
        return await this.aiService.getRecommendations(userId, context);
    }
    async moderateContent(contentData) {
        return await this.aiService.moderateContent(contentData);
    }
    async categorizeProduct(productData) {
        return await this.aiService.categorizeProduct(productData);
    }
    async approveUserRegistration(userId, data) {
        return await this.dashboardService.approveUserRegistration(userId, data.adminId);
    }
    async rejectUserRegistration(userId, data) {
        return await this.dashboardService.rejectUserRegistration(userId, data.adminId, data.reason);
    }
    async approveAuction(auctionId, data) {
        return await this.dashboardService.approveAuction(auctionId, data.adminId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin analytics data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics data retrieved successfully' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAnalyticsData", null);
__decorate([
    (0, common_1.Get)('dashboard/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('dashboard/pending-approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending approval counts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending approvals retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Post)('approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'Create approval request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Approval request created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createApprovalRequest", null);
__decorate([
    (0, common_1.Get)('approvals/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending approval requests' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending approvals retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingApprovalsList", null);
__decorate([
    (0, common_1.Post)('approvals/:approvalId/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Review approval request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval request reviewed successfully' }),
    __param(0, (0, common_1.Param)('approvalId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewApprovalRequest", null);
__decorate([
    (0, common_1.Get)('approvals/workflows'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approval workflows' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval workflows retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApprovalWorkflows", null);
__decorate([
    (0, common_1.Get)('users/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsersWithFilters", null);
__decorate([
    (0, common_1.Post)('users/bulk-operation'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk user operation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk operation completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "performBulkUserOperation", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User details retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetails", null);
__decorate([
    (0, common_1.Post)('users/:userId/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User suspended successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Post)('users/:userId/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activated successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "activateUser", null);
__decorate([
    (0, common_1.Put)('users/:userId/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Change user role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role changed successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeUserRole", null);
__decorate([
    (0, common_1.Post)('users/:userId/notify'),
    (0, swagger_1.ApiOperation)({ summary: 'Send notification to user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification sent successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendUserNotification", null);
__decorate([
    (0, common_1.Get)('products/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductAnalytics", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get products with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductsWithFilters", null);
__decorate([
    (0, common_1.Post)('products/bulk-operation'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk product operation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk operation completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "performBulkProductOperation", null);
__decorate([
    (0, common_1.Get)('products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product details retrieved successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductDetails", null);
__decorate([
    (0, common_1.Post)('products/:productId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve product listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product approved successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveProduct", null);
__decorate([
    (0, common_1.Post)('products/:productId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject product listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product rejected successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectProduct", null);
__decorate([
    (0, common_1.Post)('products/:productId/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend product listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product suspended successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendProduct", null);
__decorate([
    (0, common_1.Put)('products/:productId/category'),
    (0, swagger_1.ApiOperation)({ summary: 'Change product category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product category changed successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeProductCategory", null);
__decorate([
    (0, common_1.Put)('products/:productId/price'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product price' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product price updated successfully' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProductPrice", null);
__decorate([
    (0, common_1.Get)('products/duplicates'),
    (0, swagger_1.ApiOperation)({ summary: 'Detect duplicate products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Duplicate products detected successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "detectDuplicateProducts", null);
__decorate([
    (0, common_1.Post)('ai/fraud-detection'),
    (0, swagger_1.ApiOperation)({ summary: 'Detect fraud in bid data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fraud detection completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "detectFraud", null);
__decorate([
    (0, common_1.Post)('ai/price-prediction'),
    (0, swagger_1.ApiOperation)({ summary: 'Predict product price' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price prediction completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "predictPrice", null);
__decorate([
    (0, common_1.Get)('ai/recommendations/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI recommendations for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommendations retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Post)('ai/moderate-content'),
    (0, swagger_1.ApiOperation)({ summary: 'Moderate content using AI' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Content moderation completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "moderateContent", null);
__decorate([
    (0, common_1.Post)('ai/categorize-product'),
    (0, swagger_1.ApiOperation)({ summary: 'Categorize product using AI' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product categorization completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "categorizeProduct", null);
__decorate([
    (0, common_1.Post)('dashboard/approve-user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve user registration from dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User approved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveUserRegistration", null);
__decorate([
    (0, common_1.Post)('dashboard/reject-user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject user registration from dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User rejected successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectUserRegistration", null);
__decorate([
    (0, common_1.Post)('dashboard/approve-auction/:auctionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve auction from dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auction approved successfully' }),
    __param(0, (0, common_1.Param)('auctionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveAuction", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_dashboard_service_1.AdminDashboardService,
        approval_service_1.ApprovalService,
        enhanced_user_management_service_1.EnhancedUserManagementService,
        enhanced_product_management_service_1.EnhancedProductManagementService,
        ai_service_1.AIService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map