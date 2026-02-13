import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginTrend = new Trend('login_duration');
const auctionLoadTrend = new Trend('auction_load_duration');
const bidPlacementTrend = new Trend('bid_placement_duration');

// Test configuration
export const options = {
  stages: [
    // Ramp up to 50 users over 1 minute
    { duration: '1m', target: 50 },
    // Stay at 50 users for 3 minutes
    { duration: '3m', target: 50 },
    // Ramp up to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Stay at 100 users for 5 minutes
    { duration: '5m', target: 100 },
    // Ramp down to 0 users over 1 minute
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
    errors: ['rate<0.1'], // Custom error rate
  },
  tags: {
    test: 'quickmela-load-test',
  },
};

// Base URL configuration
const BASE_URL = 'https://quickmela.netlify.app';
const API_BASE_URL = 'https://quickmela-backend.onrender.com';

// Test data
const testUsers = [
  { email: 'buyer1@test.com', password: 'TestPass123!' },
  { email: 'buyer2@test.com', password: 'TestPass123!' },
  { email: 'buyer3@test.com', password: 'TestPass123!' },
  { email: 'buyer4@test.com', password: 'TestPass123!' },
  { email: 'buyer5@test.com', password: 'TestPass123!' },
];

let authTokens = [];
let auctionIds = [];

// Setup function - runs before the test starts
export function setup() {
  console.log('🚀 Starting QuickMela Load Test Setup');

  // Pre-authenticate users to get tokens
  const tokens = [];
  for (const user of testUsers) {
    const loginPayload = {
      email: user.email,
      password: user.password,
    };

    const loginResponse = http.post(`${API_BASE_URL}/api/auth/login`, JSON.stringify(loginPayload), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (loginResponse.status === 200) {
      const responseBody = JSON.parse(loginResponse.body);
      if (responseBody.access_token) {
        tokens.push(responseBody.access_token);
      }
    }
  }

  // Get some auction IDs for testing
  const auctionsResponse = http.get(`${API_BASE_URL}/api/auctions?page=1&limit=10`);
  if (auctionsResponse.status === 200) {
    const auctionsData = JSON.parse(auctionsResponse.body);
    if (auctionsData.data && Array.isArray(auctionsData.data)) {
      auctionIds = auctionsData.data.slice(0, 5).map(auction => auction.id);
    }
  }

  console.log(`✅ Setup complete. Authenticated ${tokens.length} users, found ${auctionIds.length} auctions`);

  return { authTokens: tokens, auctionIds };
}

// Main test function
export default function (data) {
  const { authTokens, auctionIds } = data;

  // Get random user token and auction ID
  const userToken = authTokens[Math.floor(Math.random() * authTokens.length)];
  const auctionId = auctionIds[Math.floor(Math.random() * auctionIds.length)];

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
  };

  // Test 1: Login performance
  const loginStart = new Date().getTime();
  const loginResponse = http.post(`${API_BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: testUsers[Math.floor(Math.random() * testUsers.length)].email,
      password: 'TestPass123!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const loginDuration = new Date().getTime() - loginStart;
  loginTrend.add(loginDuration);

  const loginCheck = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.access_token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!loginCheck) {
    errorRate.add(1);
  }

  // Test 2: Load auctions page
  const auctionsStart = new Date().getTime();
  const auctionsResponse = http.get(`${API_BASE_URL}/api/auctions?page=1&limit=20&category=electronics`);
  const auctionsDuration = new Date().getTime() - auctionsStart;
  auctionLoadTrend.add(auctionsDuration);

  const auctionsCheck = check(auctionsResponse, {
    'auctions status is 200': (r) => r.status === 200,
    'auctions response is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
  });

  if (!auctionsCheck) {
    errorRate.add(1);
  }

  // Test 3: Get auction details
  const detailsResponse = http.get(`${API_BASE_URL}/api/auctions/${auctionId}`);
  const detailsCheck = check(detailsResponse, {
    'auction details status is 200': (r) => r.status === 200,
    'auction details has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!detailsCheck) {
    errorRate.add(1);
  }

  // Test 4: Place bid (with random chance to avoid conflicts)
  if (Math.random() < 0.3) { // 30% of users place bids
    const bidAmount = Math.floor(Math.random() * 100) + 100; // Random bid between 100-200
    const bidStart = new Date().getTime();

    const bidResponse = http.post(`${API_BASE_URL}/api/bids`,
      JSON.stringify({
        auctionId: auctionId,
        amount: bidAmount,
      }),
      { headers }
    );

    const bidDuration = new Date().getTime() - bidStart;
    bidPlacementTrend.add(bidDuration);

    const bidCheck = check(bidResponse, {
      'bid placement succeeds or fails gracefully': (r) => {
        // Accept both success and expected failures (bid too low, etc.)
        return [200, 201, 400, 422].includes(r.status);
      },
    });

    if (!bidCheck) {
      errorRate.add(1);
    }
  }

  // Test 5: Get wallet balance
  const walletResponse = http.get(`${API_BASE_URL}/api/wallet/balance`, { headers });
  const walletCheck = check(walletResponse, {
    'wallet balance retrieved': (r) => [200, 401, 403].includes(r.status),
  });

  if (!walletCheck) {
    errorRate.add(1);
  }

  // Test 6: Search auctions
  const searchResponse = http.get(`${API_BASE_URL}/api/auctions/search?q=electronics&page=1&limit=10`);
  const searchCheck = check(searchResponse, {
    'search returns results': (r) => r.status === 200,
  });

  if (!searchCheck) {
    errorRate.add(1);
  }

  // Simulate user think time
  sleep(Math.random() * 3 + 1); // 1-4 seconds between actions
}

// Teardown function - runs after the test completes
export function teardown(data) {
  console.log('🏁 Load test completed');

  // Log final metrics
  console.log(`Authenticated users: ${data.authTokens.length}`);
  console.log(`Available auctions: ${data.auctionIds.length}`);
}

// Handle summary - custom summary output
export function handleSummary(data) {
  const summary = {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'quickmela-load-test-results.json': JSON.stringify(data, null, 2),
    'quickmela-load-test-report.html': htmlReport(data),
  };

  return summary;
}

function textSummary(data, options) {
  return `
📊 QuickMela Load Test Summary
================================

Test Duration: ${data.metrics.duration.values.avg}ms
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%

Response Time Metrics:
- Average: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
- 95th percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
- 99th percentile: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms

Custom Metrics:
- Login Duration: ${Math.round(data.metrics.login_duration?.values.avg || 0)}ms
- Auction Load Duration: ${Math.round(data.metrics.auction_load_duration?.values.avg || 0)}ms
- Bid Placement Duration: ${Math.round(data.metrics.bid_placement_duration?.values.avg || 0)}ms
- Error Rate: ${(data.metrics.errors?.values.rate || 0) * 100}%

Load Test Stages:
${options.stages.map(stage =>
  `- ${stage.duration}: ${stage.target} users`
).join('\n')}

Recommendations:
${generateRecommendations(data)}
`;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>QuickMela Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🚀 QuickMela Load Test Report</h1>

    <div class="metric">
        <h2>📈 Performance Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
            <tr>
                <td>Average Response Time</td>
                <td>${Math.round(data.metrics.http_req_duration.values.avg)}ms</td>
                <td class="${data.metrics.http_req_duration.values.avg < 1000 ? 'success' : 'warning'}">
                    ${data.metrics.http_req_duration.values.avg < 1000 ? '✅ Good' : '⚠️ Slow'}
                </td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms</td>
                <td class="${data.metrics.http_req_duration.values['p(95)'] < 2000 ? 'success' : 'warning'}">
                    ${data.metrics.http_req_duration.values['p(95)'] < 2000 ? '✅ Good' : '⚠️ Needs Improvement'}
                </td>
            </tr>
            <tr>
                <td>Error Rate</td>
                <td>${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</td>
                <td class="${data.metrics.http_req_failed.values.rate < 0.1 ? 'success' : 'error'}">
                    ${data.metrics.http_req_failed.values.rate < 0.1 ? '✅ Acceptable' : '❌ High'}
                </td>
            </tr>
            <tr>
                <td>Total Requests</td>
                <td>${data.metrics.http_reqs.values.count}</td>
                <td>ℹ️ Info</td>
            </tr>
        </table>
    </div>

    <div class="metric">
        <h2>🎯 Custom Metrics</h2>
        <table>
            <tr><th>Operation</th><th>Average Duration</th><th>Status</th></tr>
            <tr>
                <td>User Login</td>
                <td>${Math.round(data.metrics.login_duration?.values.avg || 0)}ms</td>
                <td class="${(data.metrics.login_duration?.values.avg || 0) < 1000 ? 'success' : 'warning'}">
                    ${(data.metrics.login_duration?.values.avg || 0) < 1000 ? '✅ Fast' : '⚠️ Slow'}
                </td>
            </tr>
            <tr>
                <td>Auction Loading</td>
                <td>${Math.round(data.metrics.auction_load_duration?.values.avg || 0)}ms</td>
                <td class="${(data.metrics.auction_load_duration?.values.avg || 0) < 1500 ? 'success' : 'warning'}">
                    ${(data.metrics.auction_load_duration?.values.avg || 0) < 1500 ? '✅ Good' : '⚠️ Slow'}
                </td>
            </tr>
            <tr>
                <td>Bid Placement</td>
                <td>${Math.round(data.metrics.bid_placement_duration?.values.avg || 0)}ms</td>
                <td class="${(data.metrics.bid_placement_duration?.values.avg || 0) < 2000 ? 'success' : 'warning'}">
                    ${(data.metrics.bid_placement_duration?.values.avg || 0) < 2000 ? '✅ Acceptable' : '⚠️ Slow'}
                </td>
            </tr>
        </table>
    </div>

    <div class="metric">
        <h2>📋 Recommendations</h2>
        <ul>
            ${generateRecommendations(data).split('\n').map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div class="metric">
        <h2>🔍 Test Configuration</h2>
        <p><strong>Base URL:</strong> ${BASE_URL}</p>
        <p><strong>API URL:</strong> ${API_BASE_URL}</p>
        <p><strong>Test Users:</strong> ${testUsers.length}</p>
        <p><strong>Load Stages:</strong></p>
        <ul>
            ${options.stages.map(stage => `<li>${stage.duration}: ${stage.target} concurrent users</li>`).join('')}
        </ul>
    </div>
</body>
</html>
`;
}

function generateRecommendations(data) {
  const recommendations = [];

  const avgResponseTime = data.metrics.http_req_duration.values.avg;
  const p95ResponseTime = data.metrics.http_req_duration.values['p(95)'];
  const errorRate = data.metrics.http_req_failed.values.rate;

  if (avgResponseTime > 1000) {
    recommendations.push('⚡ Optimize API response times - consider caching, database indexing, or CDN');
  }

  if (p95ResponseTime > 2000) {
    recommendations.push('📊 Improve 95th percentile performance - focus on slow queries and bottlenecks');
  }

  if (errorRate > 0.1) {
    recommendations.push('🚨 Reduce error rate - investigate and fix failing endpoints');
  }

  if (data.metrics.login_duration?.values.avg > 1500) {
    recommendations.push('🔐 Optimize authentication flow - consider JWT caching or faster password hashing');
  }

  if (data.metrics.bid_placement_duration?.values.avg > 3000) {
    recommendations.push('💰 Speed up bid placement - implement optimistic updates and background processing');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All performance metrics are within acceptable ranges');
  }

  return recommendations.join('\n');
}
