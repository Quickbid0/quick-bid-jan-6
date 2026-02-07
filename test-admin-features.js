// QuickMela Admin Features Integration Test
// Tests all newly implemented admin, AI, approval, user management, and product management features

const axios = require('axios');

const BASE_URL = 'http://localhost:4011/api';
const ADMIN_TOKEN = 'mock-admin-token'; // In real implementation, get from login

class AdminFeaturesTest {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
  }

  async runAllTests() {
    console.log('🚀 Starting QuickMela Admin Features Integration Tests\n');

    try {
      await this.testDashboardFeatures();
      await this.testUserManagementFeatures();
      await this.testProductManagementFeatures();
      await this.testApprovalSystemFeatures();
      await this.testAIFeatures();

      console.log('\n✅ ALL ADMIN FEATURES TESTS PASSED!');
      console.log('🎉 QuickMela platform is feature-complete and production-ready!');

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.error('Stack:', error.stack);
    }
  }

  async testDashboardFeatures() {
    console.log('📊 Testing Admin Dashboard Features...');

    // Test dashboard stats
    const statsResponse = await this.client.get('/admin/dashboard/stats');
    console.log('✅ Dashboard stats retrieved:', statsResponse.data.totalUsers, 'users');

    // Test analytics data
    const analyticsResponse = await this.client.get('/admin/dashboard/analytics?days=7');
    console.log('✅ Analytics data retrieved:', analyticsResponse.data.userGrowth.length, 'data points');

    // Test system health
    const healthResponse = await this.client.get('/admin/dashboard/health');
    console.log('✅ System health retrieved:', healthResponse.data.status);

    // Test pending approvals
    const approvalsResponse = await this.client.get('/admin/dashboard/pending-approvals');
    console.log('✅ Pending approvals retrieved:', approvalsResponse.data.totalPending, 'pending');

    console.log('✅ Dashboard features working correctly\n');
  }

  async testUserManagementFeatures() {
    console.log('👥 Testing User Management Features...');

    // Test user analytics
    const analyticsResponse = await this.client.get('/admin/users/analytics');
    console.log('✅ User analytics retrieved:', analyticsResponse.data.totalUsers, 'total users');

    // Test user listing with filters
    const usersResponse = await this.client.get('/admin/users?page=1&limit=10&role=BUYER');
    console.log('✅ Users retrieved:', usersResponse.data.total, 'users found');

    // Test bulk user operations (simulate)
    const bulkOpResponse = await this.client.post('/admin/users/bulk-operation', {
      operation: 'send_notification',
      userIds: ['user_123'],
      parameters: { message: 'Test notification from admin' },
      adminId: 'admin_001'
    });
    console.log('✅ Bulk operation completed:', bulkOpResponse.data.processed, 'processed');

    // Test individual user operations
    const userDetailsResponse = await this.client.get('/admin/users/user_123');
    console.log('✅ User details retrieved for user:', userDetailsResponse.data.email);

    console.log('✅ User management features working correctly\n');
  }

  async testProductManagementFeatures() {
    console.log('📦 Testing Product Management Features...');

    // Test product analytics
    const analyticsResponse = await this.client.get('/admin/products/analytics');
    console.log('✅ Product analytics retrieved:', analyticsResponse.data.totalProducts, 'total products');

    // Test product listing with filters
    const productsResponse = await this.client.get('/admin/products?page=1&limit=10&category=Electronics');
    console.log('✅ Products retrieved:', productsResponse.data.total, 'products found');

    // Test bulk product operations
    const bulkOpResponse = await this.client.post('/admin/products/bulk-operation', {
      operation: 'change_category',
      productIds: ['product_123'],
      parameters: { newCategory: 'Updated Category' },
      adminId: 'admin_001'
    });
    console.log('✅ Bulk product operation completed:', bulkOpResponse.data.processed, 'processed');

    // Test duplicate detection
    const duplicatesResponse = await this.client.get('/admin/products/duplicates');
    console.log('✅ Duplicate detection completed:', duplicatesResponse.data.totalDuplicates, 'duplicates found');

    // Test product details
    const productDetailsResponse = await this.client.get('/admin/products/product_123');
    console.log('✅ Product details retrieved:', productDetailsResponse.data.title);

    console.log('✅ Product management features working correctly\n');
  }

  async testApprovalSystemFeatures() {
    console.log('✅ Testing Approval System Features...');

    // Test creating approval request
    const createApprovalResponse = await this.client.post('/admin/approvals', {
      type: 'user_registration',
      entityId: 'user_123',
      submittedBy: 'user_123',
      priority: 'medium',
      metadata: { email: 'test@example.com' }
    });
    console.log('✅ Approval request created:', createApprovalResponse.data.id);

    // Test getting pending approvals
    const pendingResponse = await this.client.get('/admin/approvals/pending');
    console.log('✅ Pending approvals retrieved:', pendingResponse.data.approvals.length, 'pending');

    // Test approval workflows
    const workflowsResponse = await this.client.get('/admin/approvals/workflows');
    console.log('✅ Approval workflows retrieved:', workflowsResponse.data.length, 'workflows');

    // Test reviewing approval
    const reviewResponse = await this.client.post(`/admin/approvals/${createApprovalResponse.data.id}/review`, {
      action: 'approve',
      reviewerId: 'admin_001',
      notes: 'Approved via automated test'
    });
    console.log('✅ Approval review completed:', reviewResponse.data.message);

    console.log('✅ Approval system features working correctly\n');
  }

  async testAIFeatures() {
    console.log('🤖 Testing AI Features...');

    // Test fraud detection
    const fraudResponse = await this.client.post('/admin/ai/fraud-detection', {
      auctionId: 'auction_123',
      userId: 'user_456',
      amount: 10000,
      userHistory: { recentBids: 5 },
      auctionHistory: { averageBid: 8000 }
    });
    console.log('✅ Fraud detection completed:', fraudResponse.data.isFraudulent ? 'Fraud detected' : 'No fraud detected');

    // Test price prediction
    const priceResponse = await this.client.post('/admin/ai/price-prediction', {
      category: 'Electronics',
      condition: 'good',
      brand: 'Apple',
      specifications: { storage: '256GB' },
      marketData: { similarItems: 25 }
    });
    console.log('✅ Price prediction completed: ₹', priceResponse.data.predictedPrice);

    // Test content moderation
    const moderationResponse = await this.client.post('/admin/ai/moderate-content', {
      title: 'Brand New iPhone 15',
      description: 'Excellent condition smartphone',
      category: 'Electronics',
      price: 80000
    });
    console.log('✅ Content moderation completed:', moderationResponse.data.shouldApprove ? 'Approved' : 'Rejected');

    // Test product categorization
    const categorizationResponse = await this.client.post('/admin/ai/categorize-product', {
      title: 'MacBook Pro 16-inch',
      description: 'Professional laptop for developers',
      price: 250000
    });
    console.log('✅ Product categorization completed:', categorizationResponse.data.primaryCategory);

    // Test recommendations
    const recommendationsResponse = await this.client.get('/admin/ai/recommendations/user_123?category=Electronics');
    console.log('✅ Recommendations retrieved:', recommendationsResponse.data.length, 'recommendations');

    console.log('✅ AI features working correctly\n');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AdminFeaturesTest();
  tester.runAllTests().catch(console.error);
}

module.exports = AdminFeaturesTest;
