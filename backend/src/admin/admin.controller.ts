import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { ApprovalService } from './approval.service';
import { EnhancedUserManagementService } from './enhanced-user-management.service';
import { EnhancedProductManagementService } from './enhanced-product-management.service';
import { AIService } from '../ai/ai.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly dashboardService: AdminDashboardService,
    private readonly approvalService: ApprovalService,
    private readonly userManagementService: EnhancedUserManagementService,
    private readonly productManagementService: EnhancedProductManagementService,
    private readonly aiService: AIService,
  ) {}

  // Dashboard Analytics
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats() {
    return await this.dashboardService.getDashboardStats();
  }

  @Get('dashboard/analytics')
  @ApiOperation({ summary: 'Get admin analytics data' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  async getAnalyticsData(@Query('days') days: number = 30) {
    return await this.dashboardService.getAnalyticsData(days);
  }

  @Get('dashboard/health')
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({ status: 200, description: 'System health data retrieved successfully' })
  async getSystemHealth() {
    return await this.dashboardService.getSystemHealth();
  }

  @Get('dashboard/pending-approvals')
  @ApiOperation({ summary: 'Get pending approval counts' })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved successfully' })
  async getPendingApprovals() {
    return await this.dashboardService.getPendingApprovals();
  }

  // Approval Workflows
  @Post('approvals')
  @ApiOperation({ summary: 'Create approval request' })
  @ApiResponse({ status: 201, description: 'Approval request created successfully' })
  async createApprovalRequest(@Body() data: any) {
    return await this.approvalService.createApprovalRequest(data);
  }

  @Get('approvals/pending')
  @ApiOperation({ summary: 'Get pending approval requests' })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved successfully' })
  async getPendingApprovalsList(@Query() filters: any) {
    return await this.approvalService.getPendingApprovals(filters);
  }

  @Post('approvals/:approvalId/review')
  @ApiOperation({ summary: 'Review approval request' })
  @ApiResponse({ status: 200, description: 'Approval request reviewed successfully' })
  async reviewApprovalRequest(
    @Param('approvalId') approvalId: string,
    @Body() data: { action: 'approve' | 'reject' | 'escalate'; reviewerId: string; notes?: string }
  ) {
    return await this.approvalService.reviewApprovalRequest(
      approvalId,
      data.reviewerId,
      data.action,
      data.notes
    );
  }

  @Get('approvals/workflows')
  @ApiOperation({ summary: 'Get approval workflows' })
  @ApiResponse({ status: 200, description: 'Approval workflows retrieved successfully' })
  async getApprovalWorkflows() {
    return await this.approvalService.getApprovalWorkflows();
  }

  // User Management
  @Get('users/analytics')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  async getUserAnalytics() {
    return await this.userManagementService.getUserAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users with filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersWithFilters(@Query() filters: any) {
    return await this.userManagementService.getUsersWithFilters(filters);
  }

  @Post('users/bulk-operation')
  @ApiOperation({ summary: 'Perform bulk user operation' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed successfully' })
  async performBulkUserOperation(@Body() operation: any) {
    return await this.userManagementService.performBulkUserOperation(operation);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  async getUserDetails(@Param('userId') userId: string) {
    return await this.userManagementService.getUserDetails(userId);
  }

  @Post('users/:userId/suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(@Param('userId') userId: string, @Body() data: { adminId: string; reason?: string }) {
    return await this.userManagementService.suspendUser(userId, data.adminId, data.reason);
  }

  @Post('users/:userId/activate')
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(@Param('userId') userId: string, @Body() data: { adminId: string }) {
    return await this.userManagementService.activateUser(userId, data.adminId);
  }

  @Put('users/:userId/role')
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({ status: 200, description: 'User role changed successfully' })
  async changeUserRole(@Param('userId') userId: string, @Body() data: { newRole: string; adminId: string }) {
    return await this.userManagementService.changeUserRole(userId, data.newRole, data.adminId);
  }

  @Post('users/:userId/notify')
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendUserNotification(@Param('userId') userId: string, @Body() data: { message: string; adminId: string }) {
    return await this.userManagementService.sendUserNotification(userId, data.message, data.adminId);
  }

  // Product Management
  @Get('products/analytics')
  @ApiOperation({ summary: 'Get product analytics' })
  @ApiResponse({ status: 200, description: 'Product analytics retrieved successfully' })
  async getProductAnalytics() {
    return await this.productManagementService.getProductAnalytics();
  }

  @Get('products')
  @ApiOperation({ summary: 'Get products with filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProductsWithFilters(@Query() filters: any) {
    return await this.productManagementService.getProductsWithFilters(filters);
  }

  @Post('products/bulk-operation')
  @ApiOperation({ summary: 'Perform bulk product operation' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed successfully' })
  async performBulkProductOperation(@Body() operation: any) {
    return await this.productManagementService.performBulkProductOperation(operation);
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({ status: 200, description: 'Product details retrieved successfully' })
  async getProductDetails(@Param('productId') productId: string) {
    return await this.productManagementService.getProductDetails(productId);
  }

  @Post('products/:productId/approve')
  @ApiOperation({ summary: 'Approve product listing' })
  @ApiResponse({ status: 200, description: 'Product approved successfully' })
  async approveProduct(@Param('productId') productId: string, @Body() data: { adminId: string }) {
    return await this.productManagementService.approveProduct(productId, data.adminId);
  }

  @Post('products/:productId/reject')
  @ApiOperation({ summary: 'Reject product listing' })
  @ApiResponse({ status: 200, description: 'Product rejected successfully' })
  async rejectProduct(@Param('productId') productId: string, @Body() data: { adminId: string; reason?: string }) {
    return await this.productManagementService.rejectProduct(productId, data.adminId, data.reason);
  }

  @Post('products/:productId/suspend')
  @ApiOperation({ summary: 'Suspend product listing' })
  @ApiResponse({ status: 200, description: 'Product suspended successfully' })
  async suspendProduct(@Param('productId') productId: string, @Body() data: { adminId: string; reason?: string }) {
    return await this.productManagementService.suspendProduct(productId, data.adminId, data.reason);
  }

  @Put('products/:productId/category')
  @ApiOperation({ summary: 'Change product category' })
  @ApiResponse({ status: 200, description: 'Product category changed successfully' })
  async changeProductCategory(@Param('productId') productId: string, @Body() data: { newCategory: string; adminId: string }) {
    return await this.productManagementService.changeProductCategory(productId, data.newCategory, data.adminId);
  }

  @Put('products/:productId/price')
  @ApiOperation({ summary: 'Update product price' })
  @ApiResponse({ status: 200, description: 'Product price updated successfully' })
  async updateProductPrice(@Param('productId') productId: string, @Body() data: { newPrice: number; adminId: string }) {
    return await this.productManagementService.updateProductPrice(productId, data.newPrice, data.adminId);
  }

  @Get('products/duplicates')
  @ApiOperation({ summary: 'Detect duplicate products' })
  @ApiResponse({ status: 200, description: 'Duplicate products detected successfully' })
  async detectDuplicateProducts() {
    return await this.productManagementService.detectDuplicateProducts();
  }

  // AI Services
  @Post('ai/fraud-detection')
  @ApiOperation({ summary: 'Detect fraud in bid data' })
  @ApiResponse({ status: 200, description: 'Fraud detection completed successfully' })
  async detectFraud(@Body() bidData: any) {
    return await this.aiService.detectFraud(bidData);
  }

  @Post('ai/price-prediction')
  @ApiOperation({ summary: 'Predict product price' })
  @ApiResponse({ status: 200, description: 'Price prediction completed successfully' })
  async predictPrice(@Body() productData: any) {
    return await this.aiService.predictPrice(productData);
  }

  @Get('ai/recommendations/:userId')
  @ApiOperation({ summary: 'Get AI recommendations for user' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getRecommendations(@Param('userId') userId: string, @Query() context: any) {
    return await this.aiService.getRecommendations(userId, context);
  }

  @Post('ai/moderate-content')
  @ApiOperation({ summary: 'Moderate content using AI' })
  @ApiResponse({ status: 200, description: 'Content moderation completed successfully' })
  async moderateContent(@Body() contentData: any) {
    return await this.aiService.moderateContent(contentData);
  }

  @Post('ai/categorize-product')
  @ApiOperation({ summary: 'Categorize product using AI' })
  @ApiResponse({ status: 200, description: 'Product categorization completed successfully' })
  async categorizeProduct(@Body() productData: any) {
    return await this.aiService.categorizeProduct(productData);
  }

  // Dashboard Actions
  @Post('dashboard/approve-user/:userId')
  @ApiOperation({ summary: 'Approve user registration from dashboard' })
  @ApiResponse({ status: 200, description: 'User approved successfully' })
  async approveUserRegistration(@Param('userId') userId: string, @Body() data: { adminId: string }) {
    return await this.dashboardService.approveUserRegistration(userId, data.adminId);
  }

  @Post('dashboard/reject-user/:userId')
  @ApiOperation({ summary: 'Reject user registration from dashboard' })
  @ApiResponse({ status: 200, description: 'User rejected successfully' })
  async rejectUserRegistration(@Param('userId') userId: string, @Body() data: { adminId: string; reason: string }) {
    return await this.dashboardService.rejectUserRegistration(userId, data.adminId, data.reason);
  }

  @Post('dashboard/approve-auction/:auctionId')
  @ApiOperation({ summary: 'Approve auction from dashboard' })
  @ApiResponse({ status: 200, description: 'Auction approved successfully' })
  async approveAuction(@Param('auctionId') auctionId: string, @Body() data: { adminId: string }) {
    return await this.dashboardService.approveAuction(auctionId, data.adminId);
  }
}
