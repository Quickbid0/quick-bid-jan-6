const http = require('http');
const https = require('https');

// Real-time monitoring
class QuickMelaMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: {},
      endpoints: {}
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    console.log('🔍 QUICKMELA REAL-TIME MONITORING');
    console.log('==================================');
    console.log('');
    
    // Monitor key endpoints
    this.monitorEndpoint('Frontend Home', 'http://localhost:3021');
    this.monitorEndpoint('Backend API', 'http://localhost:4011');
    this.monitorEndpoint('Products API', 'http://localhost:4011/api/products');
    this.monitorEndpoint('Wallet API', 'http://localhost:4011/api/wallet/balance');
    this.monitorEndpoint('Live Auction', 'http://localhost:3021/live-auction');
    
    // Start real-time updates
    this.startRealTimeUpdates();
  }
  
  async monitorEndpoint(name, url) {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      this.metrics.totalRequests++;
      
      if (response.status >= 200 && response.status < 500) {
        this.metrics.successfulRequests++;
        this.metrics.responseTimes.push(responseTime);
        
        if (!this.metrics.endpoints[name]) {
          this.metrics.endpoints[name] = { success: 0, failed: 0, avgTime: 0 };
        }
        this.metrics.endpoints[name].success++;
        this.metrics.endpoints[name].avgTime = 
          (this.metrics.endpoints[name].avgTime + responseTime) / 2;
        
        console.log(`✅ ${name}: ${response.status} (${responseTime}ms)`);
      } else {
        this.metrics.failedRequests++;
        this.metrics.errors[name] = `HTTP ${response.status}`;
        console.log(`❌ ${name}: ${response.status} (${responseTime}ms)`);
      }
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      this.metrics.totalRequests++;
      this.metrics.failedRequests++;
      this.metrics.errors[name] = error.message;
      console.log(`💥 ${name}: ${error.message} (${responseTime}ms)`);
    }
  }
  
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }
  
  startRealTimeUpdates() {
    setInterval(() => {
      this.displayMetrics();
    }, 10000); // Update every 10 seconds
  }
  
  displayMetrics() {
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
      : 0;
    
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;
    
    console.log('');
    console.log('📊 REAL-TIME METRICS');
    console.log('===================');
    console.log(`📈 Total Requests: ${this.metrics.totalRequests}`);
    console.log(`✅ Successful: ${this.metrics.successfulRequests}`);
    console.log(`❌ Failed: ${this.metrics.failedRequests}`);
    console.log(`📊 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    if (Object.keys(this.metrics.errors).length > 0) {
      console.log('');
      console.log('⚠️  RECENT ERRORS:');
      Object.entries(this.metrics.errors).forEach(([endpoint, error]) => {
        console.log(`  ${endpoint}: ${error}`);
      });
    }
    
    console.log('');
    console.log('🔗 ENDPOINT STATUS:');
    Object.entries(this.metrics.endpoints).forEach(([endpoint, stats]) => {
      const endpointSuccessRate = stats.success + stats.failed > 0 
        ? (stats.success / (stats.success + stats.failed)) * 100 
        : 0;
      console.log(`  ${endpoint}: ${endpointSuccessRate.toFixed(1)}% (${stats.avgTime.toFixed(0)}ms avg)`);
    });
    
    console.log('---');
    
    // Health assessment
    if (successRate >= 95) {
      console.log('🟢 SYSTEM HEALTH: EXCELLENT');
    } else if (successRate >= 80) {
      console.log('🟡 SYSTEM HEALTH: GOOD');
    } else {
      console.log('🔴 SYSTEM HEALTH: POOR - INVESTIGATE ISSUES');
    }
  }
}

// Start monitoring
const monitor = new QuickMelaMonitor();

// Keep process running
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Monitoring stopped');
  process.exit(0);
});
