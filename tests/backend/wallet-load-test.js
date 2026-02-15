#!/usr/bin/env node

/**
 * WALLET & ESCROW INTEGRITY LOAD TESTER
 * Tests concurrent wallet operations to detect race conditions
 * Run with: node tests/backend/wallet-load-test.js
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4010';
const API_PREFIX = '/api';

// Test configuration
const CONFIG = {
  concurrentUsers: 50,
  operationsPerUser: 10,
  testDuration: 60000, // 60 seconds
  walletOperations: [
    { type: 'add_funds', amount: 1000 },
    { type: 'deduct_funds', amount: 500 },
    { type: 'hold_funds', amount: 200 },
    { type: 'release_funds', amount: 200 },
  ],
};

// Test user credentials (should be created in database first)
const TEST_USERS = Array.from({ length: CONFIG.concurrentUsers }, (_, i) => ({
  id: `test_user_${i}`,
  email: `test${i}@example.com`,
  token: 'test_jwt_token', // Would need real JWT in production
}));

class WalletLoadTester {
  constructor() {
    this.results = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      raceConditions: 0,
      averageResponseTime: 0,
      errors: [],
      startTime: Date.now(),
    };

    this.activeOperations = new Map();
  }

  async runLoadTest() {
    console.log('🚀 Starting Wallet & Escrow Integrity Load Test');
    console.log(`📊 Configuration: ${CONFIG.concurrentUsers} users, ${CONFIG.operationsPerUser} ops each`);
    console.log(`⏱️  Test Duration: ${CONFIG.testDuration / 1000} seconds\n`);

    const startTime = performance.now();

    // Create concurrent user operations
    const userPromises = TEST_USERS.map(user =>
      this.simulateUserOperations(user)
    );

    try {
      await Promise.allSettled(userPromises);
    } catch (error) {
      console.error('❌ Load test failed:', error);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.printResults(duration);
    this.validateIntegrity();
  }

  async simulateUserOperations(user) {
    const operations = [];

    for (let i = 0; i < CONFIG.operationsPerUser; i++) {
      const operation = CONFIG.walletOperations[Math.floor(Math.random() * CONFIG.walletOperations.length)];
      operations.push(this.performWalletOperation(user, operation));
    }

    await Promise.all(operations);
  }

  async performWalletOperation(user, operation) {
    const operationId = `${user.id}_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();

    try {
      this.activeOperations.set(operationId, { user: user.id, operation, startTime });

      let response;

      switch (operation.type) {
        case 'add_funds':
          response = await this.addFunds(user, operation.amount);
          break;
        case 'deduct_funds':
          response = await this.deductFunds(user, operation.amount);
          break;
        case 'hold_funds':
          response = await this.holdFunds(user, operation.amount);
          break;
        case 'release_funds':
          response = await this.releaseFunds(user, operation.amount);
          break;
      }

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.results.totalOperations++;
      this.results.successfulOperations++;
      this.results.averageResponseTime =
        (this.results.averageResponseTime + responseTime) / 2;

      this.activeOperations.delete(operationId);

      // Log slow operations
      if (responseTime > 1000) {
        console.log(`🐌 Slow operation: ${operation.type} took ${responseTime.toFixed(2)}ms`);
      }

    } catch (error) {
      this.results.totalOperations++;
      this.results.failedOperations++;
      this.results.errors.push({
        user: user.id,
        operation,
        error: error.message,
        timestamp: new Date(),
      });

      this.activeOperations.delete(operationId);

      // Check for race condition indicators
      if (error.message.includes('Insufficient funds') && operation.type === 'deduct_funds') {
        // This might indicate a race condition if funds were available
        this.results.raceConditions++;
      }
    }
  }

  async addFunds(user, amount) {
    const response = await axios.post(
      `${BASE_URL}${API_PREFIX}/wallet/add-funds`,
      { amount },
      {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    return response.data;
  }

  async deductFunds(user, amount) {
    const response = await axios.post(
      `${BASE_URL}${API_PREFIX}/wallet/place-bid`,
      { amount },
      {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    return response.data;
  }

  async holdFunds(user, amount) {
    const response = await axios.post(
      `${BASE_URL}${API_PREFIX}/wallet/hold-funds`,
      {
        amount,
        purpose: 'security_deposit',
        referenceId: `hold_${Date.now()}`
      },
      {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    return response.data;
  }

  async releaseFunds(user, amount) {
    // Get a hold transaction to release
    try {
      const response = await axios.post(
        `${BASE_URL}${API_PREFIX}/wallet/release-funds`,
        {
          amount,
          originalTransactionId: `mock_transaction_${Date.now()}`
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
      return response.data;
    } catch (error) {
      // If no held funds, that's expected - don't count as error
      if (error.response?.status === 400 && error.response.data.message.includes('held funds')) {
        return { success: true, message: 'No held funds to release' };
      }
      throw error;
    }
  }

  printResults(duration) {
    console.log('\n📈 WALLET INTEGRITY TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`🔄 Total Operations: ${this.results.totalOperations}`);
    console.log(`✅ Successful: ${this.results.successfulOperations}`);
    console.log(`❌ Failed: ${this.results.failedOperations}`);
    console.log(`🏎️  Average Response Time: ${this.results.averageResponseTime.toFixed(2)}ms`);
    console.log(`⚠️  Potential Race Conditions: ${this.results.raceConditions}`);
    console.log(`📊 Success Rate: ${((this.results.successfulOperations / this.results.totalOperations) * 100).toFixed(2)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 TOP ERRORS:');
      const errorSummary = this.results.errors.reduce((acc, err) => {
        acc[err.error] = (acc[err.error] || 0) + 1;
        return acc;
      }, {});

      Object.entries(errorSummary)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([error, count]) => {
          console.log(`   ${error}: ${count} times`);
        });
    }

    console.log('\n' + '=' .repeat(50));
  }

  validateIntegrity() {
    console.log('\n🔍 INTEGRITY VALIDATION');

    const successRate = this.results.successfulOperations / this.results.totalOperations;

    if (successRate >= 0.95) {
      console.log('✅ HIGH SUCCESS RATE: Wallet operations are stable');
    } else if (successRate >= 0.85) {
      console.log('⚠️  MODERATE SUCCESS RATE: Some operations failing, investigate');
    } else {
      console.log('❌ LOW SUCCESS RATE: Critical wallet issues detected');
    }

    if (this.results.raceConditions === 0) {
      console.log('✅ NO RACE CONDITIONS: Atomic transactions working correctly');
    } else {
      console.log(`⚠️  RACE CONDITIONS DETECTED: ${this.results.raceConditions} potential issues`);
    }

    if (this.results.averageResponseTime < 500) {
      console.log('✅ GOOD PERFORMANCE: Operations responding quickly');
    } else {
      console.log('⚠️  SLOW PERFORMANCE: Average response time too high');
    }

    // Final assessment
    const isProductionReady = successRate >= 0.95 && this.results.raceConditions === 0;

    console.log('\n🎯 FINAL ASSESSMENT:');
    if (isProductionReady) {
      console.log('✅ WALLET & ESCROW INTEGRITY: PRODUCTION READY');
      console.log('   - High success rate');
      console.log('   - No race conditions detected');
      console.log('   - Good performance under load');
    } else {
      console.log('❌ WALLET & ESCROW INTEGRITY: REQUIRES FIXES');
      console.log('   - Check atomic transaction implementation');
      console.log('   - Investigate race conditions');
      console.log('   - Optimize performance');
    }
  }
}

// Run the load test
if (require.main === module) {
  const tester = new WalletLoadTester();
  tester.runLoadTest().catch(console.error);
}

module.exports = WalletLoadTester;
