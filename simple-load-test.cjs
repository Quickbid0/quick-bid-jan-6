const http = require('http');
const https = require('https');

// Configuration
const FRONTEND_URL = 'http://localhost:3021';
const API_URL = 'http://localhost:4011';
const CONCURRENT_USERS = 100;
const TEST_DURATION = 60000; // 1 minute

// Metrics
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let responseTimes = [];

// Simple HTTP client
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        resolve({
          status: res.statusCode,
          responseTime,
          data
        });
      });
    });

    req.on('error', (err) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      reject({
        error: err.message,
        responseTime
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject({ error: 'Timeout', responseTime: 5000 });
    });
  });
}

// Test scenarios
async function testLandingPage() {
  try {
    const response = await makeRequest(FRONTEND_URL, {
      headers: {
        'User-Agent': 'LoadTest/1.0'
      }
    });
    
    totalRequests++;
    if (response.status === 200) {
      successfulRequests++;
      responseTimes.push(response.responseTime);
    } else {
      failedRequests++;
    }
    
    return response;
  } catch (error) {
    totalRequests++;
    failedRequests++;
    return { error: error.error, responseTime: error.responseTime };
  }
}

async function testAPIHealth() {
  try {
    const response = await makeRequest(API_URL, {
      headers: {
        'User-Agent': 'LoadTest/1.0'
      }
    });
    
    totalRequests++;
    if (response.status === 200) {
      successfulRequests++;
      responseTimes.push(response.responseTime);
    } else {
      failedRequests++;
    }
    
    return response;
  } catch (error) {
    totalRequests++;
    failedRequests++;
    return { error: error.error, responseTime: error.responseTime };
  }
}

async function testProductsAPI() {
  try {
    const response = await makeRequest(`${API_URL}/api/products`, {
      headers: {
        'User-Agent': 'LoadTest/1.0'
      }
    });
    
    totalRequests++;
    if (response.status === 200) {
      successfulRequests++;
      responseTimes.push(response.responseTime);
    } else {
      failedRequests++;
    }
    
    return response;
  } catch (error) {
    totalRequests++;
    failedRequests++;
    return { error: error.error, responseTime: error.responseTime };
  }
}

async function testLiveAuctionPage() {
  try {
    const response = await makeRequest(`${FRONTEND_URL}/live-auction`, {
      headers: {
        'User-Agent': 'LoadTest/1.0'
      }
    });
    
    totalRequests++;
    if (response.status === 200) {
      successfulRequests++;
      responseTimes.push(response.responseTime);
    } else {
      failedRequests++;
    }
    
    return response;
  } catch (error) {
    totalRequests++;
    failedRequests++;
    return { error: error.error, responseTime: error.responseTime };
  }
}

// Single user simulation
async function simulateUser(userId) {
  const endTime = Date.now() + TEST_DURATION;
  
  while (Date.now() < endTime) {
    // Random test selection
    const tests = [
      testLandingPage,
      testAPIHealth,
      testProductsAPI,
      testLiveAuctionPage
    ];
    
    const randomTest = tests[Math.floor(Math.random() * tests.length)];
    await randomTest();
    
    // Random delay between requests (100ms to 1s)
    const delay = Math.random() * 900 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Run load test
async function runLoadTest() {
  console.log(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users`);
  console.log(`⏱️  Test duration: ${TEST_DURATION / 1000} seconds`);
  console.log(`🎯 Target URLs: ${FRONTEND_URL}, ${API_URL}`);
  console.log('---');
  
  const startTime = Date.now();
  
  // Start concurrent users
  const users = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    users.push(simulateUser(i));
    
    // Stagger user starts
    if (i < CONCURRENT_USERS - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  // Wait for all users to complete
  await Promise.all(users);
  
  const endTime = Date.now();
  const totalTestTime = endTime - startTime;
  
  // Calculate metrics
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  const maxResponseTime = responseTimes.length > 0 
    ? Math.max(...responseTimes) 
    : 0;
  
  const minResponseTime = responseTimes.length > 0 
    ? Math.min(...responseTimes) 
    : 0;
  
  const requestsPerSecond = (totalRequests / totalTestTime) * 1000;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
  
  // Display results
  console.log('---');
  console.log('📊 LOAD TEST RESULTS');
  console.log('---');
  console.log(`⏱️  Total test time: ${(totalTestTime / 1000).toFixed(2)} seconds`);
  console.log(`📈 Total requests: ${totalRequests}`);
  console.log(`✅ Successful requests: ${successfulRequests}`);
  console.log(`❌ Failed requests: ${failedRequests}`);
  console.log(`📊 Success rate: ${successRate.toFixed(2)}%`);
  console.log(`🚀 Requests per second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`⚡ Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`🔥 Max response time: ${maxResponseTime}ms`);
  console.log(`❄️  Min response time: ${minResponseTime}ms`);
  
  // Performance assessment
  console.log('---');
  console.log('🎯 PERFORMANCE ASSESSMENT');
  console.log('---');
  
  if (successRate >= 95) {
    console.log('✅ Success rate: EXCELLENT (>95%)');
  } else if (successRate >= 90) {
    console.log('⚠️  Success rate: GOOD (90-95%)');
  } else {
    console.log('❌ Success rate: POOR (<90%)');
  }
  
  if (avgResponseTime <= 500) {
    console.log('✅ Response time: EXCELLENT (<500ms)');
  } else if (avgResponseTime <= 1000) {
    console.log('⚠️  Response time: GOOD (500ms-1s)');
  } else {
    console.log('❌ Response time: POOR (>1s)');
  }
  
  if (requestsPerSecond >= 50) {
    console.log('✅ Throughput: EXCELLENT (>50 RPS)');
  } else if (requestsPerSecond >= 20) {
    console.log('⚠️  Throughput: GOOD (20-50 RPS)');
  } else {
    console.log('❌ Throughput: POOR (<20 RPS)');
  }
  
  console.log('---');
  console.log('🏁 Load test completed!');
}

// Run the test
runLoadTest().catch(console.error);
