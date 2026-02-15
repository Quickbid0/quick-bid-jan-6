import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

class LoadTester {
  private app: INestApplication;
  private server: any;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4010') {
    this.baseUrl = baseUrl;
  }

  async setup() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
    this.server = this.app.getHttpServer();
  }

  async cleanup() {
    await this.app.close();
  }

  async runLoadTest(options: {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    concurrentUsers: number;
    requestsPerUser: number;
    duration?: number; // in seconds
    data?: any;
  }): Promise<LoadTestResult> {
    const { endpoint, method = 'GET', concurrentUsers, requestsPerUser, duration, data } = options;
    
    console.log(`🚀 Starting load test: ${method} ${endpoint}`);
    console.log(`📊 Concurrent users: ${concurrentUsers}`);
    console.log(`📊 Requests per user: ${requestsPerUser}`);
    
    const startTime = Date.now();
    const results: Array<{ status: number; responseTime: number; error?: string }> = [];
    
    const userPromises = Array(concurrentUsers).fill(null).map(async (_, userIndex) => {
      const userResults: Array<{ status: number; responseTime: number; error?: string }> = [];
      
      for (let i = 0; i < requestsPerUser; i++) {
        const requestStart = Date.now();
        
        try {
          let response;
          
          switch (method) {
            case 'GET':
              response = await request(this.server).get(endpoint);
              break;
            case 'POST':
              response = await request(this.server).post(endpoint).send(data);
              break;
            case 'PUT':
              response = await request(this.server).put(endpoint).send(data);
              break;
            case 'DELETE':
              response = await request(this.server).delete(endpoint);
              break;
          }
          
          const requestEnd = Date.now();
          userResults.push({
            status: response.status,
            responseTime: requestEnd - requestStart,
          });
        } catch (error) {
          const requestEnd = Date.now();
          userResults.push({
            status: 0,
            responseTime: requestEnd - requestStart,
            error: error.message,
          });
        }
        
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      return userResults;
    });
    
    const allResults = await Promise.all(userPromises);
    const flatResults = allResults.flat();
    
    const endTime = Date.now();
    const totalDuration = (endTime - startTime) / 1000; // in seconds
    
    // Calculate metrics
    const successfulRequests = flatResults.filter(r => r.status >= 200 && r.status < 300);
    const failedRequests = flatResults.filter(r => r.status === 0 || r.status >= 400);
    const responseTimes = flatResults.map(r => r.responseTime);
    
    const result: LoadTestResult = {
      totalRequests: flatResults.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestsPerSecond: flatResults.length / totalDuration,
      errorRate: (failedRequests.length / flatResults.length) * 100,
    };
    
    return result;
  }

  async runComprehensiveLoadTests(): Promise<void> {
    console.log('🔥 Starting comprehensive load tests...\n');
    
    const tests = [
      {
        name: 'Health Check',
        endpoint: '/health',
        concurrentUsers: 10,
        requestsPerUser: 20,
      },
      {
        name: 'Database Test',
        endpoint: '/test-db',
        concurrentUsers: 5,
        requestsPerUser: 10,
      },
      {
        name: 'Auth Login',
        endpoint: '/api/auth/login',
        method: 'POST' as const,
        concurrentUsers: 5,
        requestsPerUser: 5,
        data: { email: 'test@example.com', password: 'password123' },
      },
      {
        name: 'High Load Health Check',
        endpoint: '/health',
        concurrentUsers: 50,
        requestsPerUser: 10,
      },
    ];
    
    for (const test of tests) {
      console.log(`\n📋 Running: ${test.name}`);
      console.log('=' .repeat(50));
      
      const result = await this.runLoadTest(test);
      
      console.log(`✅ Total Requests: ${result.totalRequests}`);
      console.log(`✅ Successful: ${result.successfulRequests}`);
      console.log(`❌ Failed: ${result.failedRequests}`);
      console.log(`📊 Success Rate: ${(100 - result.errorRate).toFixed(2)}%`);
      console.log(`⚡ Average Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
      console.log(`⚡ Min Response Time: ${result.minResponseTime}ms`);
      console.log(`⚡ Max Response Time: ${result.maxResponseTime}ms`);
      console.log(`🚀 Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);
      console.log(`📈 Error Rate: ${result.errorRate.toFixed(2)}%`);
      
      // Performance assessment
      if (result.averageResponseTime < 100) {
        console.log('🟢 Performance: Excellent');
      } else if (result.averageResponseTime < 500) {
        console.log('🟡 Performance: Good');
      } else {
        console.log('🔴 Performance: Needs improvement');
      }
      
      if (result.errorRate < 1) {
        console.log('🟢 Reliability: Excellent');
      } else if (result.errorRate < 5) {
        console.log('🟡 Reliability: Good');
      } else {
        console.log('🔴 Reliability: Needs improvement');
      }
    }
    
    console.log('\n🎉 Load testing completed!');
  }
}

// Run load tests if this file is executed directly
if (require.main === module) {
  const loadTester = new LoadTester();
  
  loadTester.setup()
    .then(() => loadTester.runComprehensiveLoadTests())
    .then(() => loadTester.cleanup())
    .catch(console.error);
}

export { LoadTester, LoadTestResult };
