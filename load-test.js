import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 100 }, // Ramp up to 100 users
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3021';
const API_URL = 'http://localhost:4011';

// Test data
const users = [
  { email: 'buyer1@test.com', password: 'password123' },
  { email: 'buyer2@test.com', password: 'password123' },
  { email: 'seller1@test.com', password: 'password123' },
  { email: 'seller2@test.com', password: 'password123' },
];

export function setup() {
  // Create test users if needed
  console.log('Setting up load test...');
}

export default function () {
  // Test 1: Landing page load
  let response = http.get(BASE_URL, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Mozilla/5.0 (compatible; k6/0.46.0)',
    },
  });
  
  let success = check(response, {
    'landing page status is 200': (r) => r.status === 200,
    'landing page response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);

  // Test 2: API health check
  response = http.get(`${API_URL}/`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'k6-load-test',
    },
  });
  
  success = check(response, {
    'API health check status is 200': (r) => r.status === 200,
    'API response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!success);

  // Test 3: Product listing API
  response = http.get(`${API_URL}/api/products`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'k6-load-test',
    },
  });
  
  success = check(response, {
    'products API status is 200': (r) => r.status === 200,
    'products API response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  errorRate.add(!success);

  // Test 4: Wallet balance API (simulated)
  response = http.get(`${API_URL}/api/wallet/balance`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer mock-token',
      'User-Agent': 'k6-load-test',
    },
  });
  
  // Wallet might return 401 without proper auth, that's expected
  check(response, {
    'wallet API responds': (r) => r.status < 500,
  });

  // Test 5: Live auction page
  response = http.get(`${BASE_URL}/live-auction`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; k6/0.46.0)',
    },
  });
  
  success = check(response, {
    'live auction page status is 200': (r) => r.status === 200,
    'live auction response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);

  // Test 6: Product detail page
  response = http.get(`${BASE_URL}/product/1`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; k6/0.46.0)',
    },
  });
  
  success = check(response, {
    'product detail page status is 200': (r) => r.status === 200,
    'product detail response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);

  sleep(1); // Wait 1 second between iterations
}

export function teardown() {
  console.log('Load test completed');
}
