const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:4011';
const FRONTEND_URL = 'http://localhost:3021';

// Test payment scenarios
const paymentTests = [
  {
    name: 'Create Order',
    method: 'POST',
    url: `${API_URL}/api/payments/create-order`,
    data: { amount: 10000, currency: 'INR' },
    expectedStatus: 201
  },
  {
    name: 'Verify Payment',
    method: 'POST',
    url: `${API_URL}/api/payments/verify`,
    data: { 
      paymentId: 'pay_test123', 
      orderId: 'order_test123', 
      signature: 'test_signature' 
    },
    expectedStatus: 201
  },
  {
    name: 'Wallet Balance',
    method: 'GET',
    url: `${API_URL}/api/wallet/balance`,
    headers: { 'Authorization': 'Bearer test-token' },
    expectedStatus: 200
  },
  {
    name: 'Add Funds to Wallet',
    method: 'POST',
    url: `${API_URL}/api/wallet/add-funds`,
    data: { amount: 5000 },
    headers: { 'Authorization': 'Bearer test-token' },
    expectedStatus: 201
  }
];

// KYC Test scenarios
const kycTests = [
  {
    name: 'Aadhaar Verification',
    method: 'POST',
    url: `${API_URL}/api/kyc/aadhaar-verify`,
    data: { 
      aadhaarNumber: '123456789012', 
      name: 'Test User', 
      dob: '1990-01-01' 
    },
    expectedStatus: 201
  },
  {
    name: 'PAN Verification',
    method: 'POST',
    url: `${API_URL}/api/kyc/pan-verify`,
    data: { 
      panNumber: 'ABCDE1234F', 
      name: 'Test User' 
    },
    expectedStatus: 201
  },
  {
    name: 'KYC Status Check',
    method: 'POST',
    url: `${API_URL}/api/kyc/check-status`,
    data: { userId: 'test-user-123' },
    expectedStatus: 201
  }
];

// Real-time bidding test
const biddingTests = [
  {
    name: 'Get Products',
    method: 'GET',
    url: `${API_URL}/api/products`,
    expectedStatus: 200
  },
  {
    name: 'Place Bid',
    method: 'POST',
    url: `${API_URL}/api/products/1/bid`,
    data: { 
      bidAmount: 15000, 
      bidderId: 'test-user-123',
      bidderName: 'Test User'
    },
    expectedStatus: 201
  },
  {
    name: 'Get Product Details',
    method: 'GET',
    url: `${API_URL}/api/products/1`,
    expectedStatus: 200
  }
];

// Test runner
async function runTest(test, category) {
  try {
    const config = {
      method: test.method,
      url: test.url,
      timeout: 10000,
      headers: test.headers || {}
    };
    
    if (test.data) {
      config.data = test.data;
      config.headers['Content-Type'] = 'application/json';
    }
    
    const startTime = Date.now();
    const response = await axios(config);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    const success = response.status === test.expectedStatus;
    
    return {
      name: test.name,
      category,
      status: response.status,
      expectedStatus: test.expectedStatus,
      success,
      responseTime,
      data: response.data
    };
    
  } catch (error) {
    return {
      name: test.name,
      category,
      status: error.response?.status || 0,
      expectedStatus: test.expectedStatus,
      success: false,
      responseTime: 0,
      error: error.message
    };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 QUICKMELA PRODUCTION TESTING');
  console.log('=====================================');
  console.log('');
  
  const allTests = [
    ...paymentTests.map(t => ({ ...t, category: 'Payment Gateway' })),
    ...kycTests.map(t => ({ ...t, category: 'KYC Verification' })),
    ...biddingTests.map(t => ({ ...t, category: 'Real-time Bidding' }))
  ];
  
  const results = [];
  
  // Run all tests
  for (const test of allTests) {
    console.log(`🧪 Testing ${test.category}: ${test.name}...`);
    const result = await runTest(test, test.category);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${test.name} - ${result.responseTime}ms`);
    } else {
      console.log(`❌ ${test.name} - Status: ${result.status}, Error: ${result.error || 'Unknown'}`);
    }
  }
  
  console.log('');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log('');
  
  // Group results by category
  const categories = {};
  results.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = [];
    }
    categories[result.category].push(result);
  });
  
  // Display results by category
  Object.keys(categories).forEach(category => {
    console.log(`📁 ${category}`);
    console.log('---');
    
    const categoryResults = categories[category];
    const passed = categoryResults.filter(r => r.success).length;
    const total = categoryResults.length;
    const successRate = (passed / total) * 100;
    
    categoryResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      console.log(`${status} ${result.name} - ${time}`);
    });
    
    console.log(`📈 Success Rate: ${passed}/${total} (${successRate.toFixed(1)}%)`);
    console.log('');
  });
  
  // Overall summary
  const totalPassed = results.filter(r => r.success).length;
  const totalTests = results.length;
  const overallSuccessRate = (totalPassed / totalTests) * 100;
  
  console.log('🎯 OVERALL SUMMARY');
  console.log('==================');
  console.log(`✅ Passed: ${totalPassed}/${totalTests}`);
  console.log(`📊 Success Rate: ${overallSuccessRate.toFixed(1)}%`);
  console.log(`🚀 Ready for Production: ${overallSuccessRate >= 80 ? 'YES' : 'NO'}`);
  console.log('');
  
  // Performance metrics
  const successfulTests = results.filter(r => r.success && r.responseTime > 0);
  if (successfulTests.length > 0) {
    const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
    const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTime));
    const minResponseTime = Math.min(...successfulTests.map(r => r.responseTime));
    
    console.log('⚡ PERFORMANCE METRICS');
    console.log('=====================');
    console.log(`📊 Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🔥 Max Response Time: ${maxResponseTime}ms`);
    console.log(`❄️  Min Response Time: ${minResponseTime}ms`);
    console.log('');
    
    // Performance assessment
    if (avgResponseTime <= 500) {
      console.log('🟢 Performance: EXCELLENT (<500ms avg)');
    } else if (avgResponseTime <= 1000) {
      console.log('🟡 Performance: GOOD (500ms-1s avg)');
    } else {
      console.log('🔴 Performance: POOR (>1s avg)');
    }
  }
  
  // Production readiness checklist
  console.log('');
  console.log('🏗️  PRODUCTION READINESS CHECKLIST');
  console.log('==================================');
  
  const paymentSuccess = categories['Payment Gateway']?.filter(r => r.success).length || 0;
  const kycSuccess = categories['KYC Verification']?.filter(r => r.success).length || 0;
  const biddingSuccess = categories['Real-time Bidding']?.filter(r => r.success).length || 0;
  
  console.log(`💳 Payment Gateway: ${paymentSuccess}/4 tests passed`);
  console.log(`🆔 KYC Verification: ${kycSuccess}/3 tests passed`);
  console.log(`🔨 Real-time Bidding: ${biddingSuccess}/3 tests passed`);
  console.log('');
  
  if (overallSuccessRate >= 80) {
    console.log('🎉 QUICKMELA IS PRODUCTION READY!');
    console.log('🚀 Ready for controlled user rollout');
  } else {
    console.log('⚠️  QUICKMELA NEEDS FIXES BEFORE PRODUCTION');
    console.log('🔧 Address failing tests before deployment');
  }
}

// Run tests
runAllTests().catch(console.error);
