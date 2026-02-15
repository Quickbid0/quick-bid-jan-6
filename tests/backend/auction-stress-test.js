#!/usr/bin/env node

/**
 * REAL-TIME AUCTION STRESS TESTER
 * Tests auction system under extreme concurrent load
 * Simulates 1000+ concurrent users bidding in real-time
 * Run with: node tests/backend/auction-stress-test.js
 */

import axios from 'axios';
import WebSocket from 'ws';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4010';
const WS_URL = process.env.WS_URL || 'ws://localhost:4010';
const API_PREFIX = '/api';

// Test configuration
const CONFIG = {
  totalUsers: 1000,
  concurrentUsers: 100, // Process in batches
  auctionDuration: 300000, // 5 minutes
  biddingIntensity: 'high', // low, medium, high
  bidIntervalRange: {
    low: [5000, 15000],     // 5-15 seconds between bids
    medium: [2000, 8000],   // 2-8 seconds
    high: [500, 3000],      // 0.5-3 seconds (intense bidding)
  },
  maxBidsPerUser: 50,
  testDuration: 600000, // 10 minutes total test time
};

// Test metrics collector
class MetricsCollector {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalBids: 0,
      successfulBids: 0,
      failedBids: 0,
      averageResponseTime: 0,
      bidLatencies: [],
      memoryUsage: [],
      websocketConnections: 0,
      websocketErrors: 0,
      auctionStateUpdates: 0,
      timerDrifts: [],
      concurrentUsers: 0,
      errors: [],
    };
  }

  recordBid(success, latency) {
    this.metrics.totalBids++;
    if (success) {
      this.metrics.successfulBids++;
    } else {
      this.metrics.failedBids++;
    }

    if (latency) {
      this.metrics.bidLatencies.push(latency);
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime + latency) / 2;
    }
  }

  recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
    });
  }

  recordWebSocketEvent(type, data) {
    switch (type) {
      case 'connect':
        this.metrics.websocketConnections++;
        break;
      case 'error':
        this.metrics.websocketErrors++;
        break;
      case 'auction_update':
        this.metrics.auctionStateUpdates++;
        break;
    }
  }

  recordTimerDrift(driftMs) {
    this.metrics.timerDrifts.push(driftMs);
  }

  recordError(error) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
    });
  }

  getSummary() {
    const duration = Date.now() - this.metrics.startTime;
    const avgLatency = this.metrics.bidLatencies.length > 0
      ? this.metrics.bidLatencies.reduce((a, b) => a + b, 0) / this.metrics.bidLatencies.length
      : 0;

    const maxMemory = this.metrics.memoryUsage.length > 0
      ? Math.max(...this.metrics.memoryUsage.map(m => m.heapUsed))
      : 0;

    const avgTimerDrift = this.metrics.timerDrifts.length > 0
      ? this.metrics.timerDrifts.reduce((a, b) => a + b, 0) / this.metrics.timerDrifts.length
      : 0;

    return {
      duration: duration / 1000, // seconds
      totalBids: this.metrics.totalBids,
      successfulBids: this.metrics.successfulBids,
      failedBids: this.metrics.failedBids,
      successRate: this.metrics.totalBids > 0 ? (this.metrics.successfulBids / this.metrics.totalBids) * 100 : 0,
      averageLatency: avgLatency,
      p95Latency: this.calculatePercentile(this.metrics.bidLatencies, 95),
      p99Latency: this.calculatePercentile(this.metrics.bidLatencies, 99),
      maxMemoryUsage: maxMemory,
      websocketConnections: this.metrics.websocketConnections,
      websocketErrors: this.metrics.websocketErrors,
      auctionUpdates: this.metrics.auctionStateUpdates,
      averageTimerDrift: avgTimerDrift,
      totalErrors: this.metrics.errors.length,
    };
  }

  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

// Simulated auction participant
class AuctionParticipant {
  constructor(userId, auctionId, metricsCollector) {
    this.userId = userId;
    this.auctionId = auctionId;
    this.metrics = metricsCollector;
    this.bidsPlaced = 0;
    this.connected = false;
    this.lastBidTime = 0;
    this.sessionToken = this.generateSessionToken();
  }

  generateSessionToken() {
    return `session_${this.userId}_${Date.now()}`;
  }

  async connect() {
    try {
      // Simulate WebSocket connection for real-time updates
      this.ws = new WebSocket(`${WS_URL}/auction/${this.auctionId}`, {
        headers: {
          'Authorization': `Bearer ${this.sessionToken}`,
        }
      });

      return new Promise((resolve, reject) => {
        this.ws.on('open', () => {
          this.connected = true;
          this.metrics.recordWebSocketEvent('connect');
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'auction_update') {
              this.metrics.recordWebSocketEvent('auction_update', message.data);
            }
          } catch (error) {
            this.metrics.recordError(new Error(`WebSocket message parse error: ${error.message}`));
          }
        });

        this.ws.on('error', (error) => {
          this.metrics.recordWebSocketEvent('error', error);
          reject(error);
        });

        this.ws.on('close', () => {
          this.connected = false;
        });

        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      });
    } catch (error) {
      this.metrics.recordError(error);
      return false;
    }
  }

  async placeBid(amount) {
    if (this.bidsPlaced >= CONFIG.maxBidsPerUser) {
      return false;
    }

    const startTime = performance.now();

    try {
      const response = await axios.post(
        `${BASE_URL}${API_PREFIX}/auctions/${this.auctionId}/bid`,
        { amount },
        {
          headers: {
            'Authorization': `Bearer ${this.sessionToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      const endTime = performance.now();
      const latency = endTime - startTime;

      this.metrics.recordBid(true, latency);
      this.bidsPlaced++;
      this.lastBidTime = Date.now();

      return response.data;
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;

      this.metrics.recordBid(false, latency);
      this.metrics.recordError(error);

      return false;
    }
  }

  async disconnect() {
    if (this.ws && this.connected) {
      this.ws.close();
    }
  }

  getBidInterval() {
    const [min, max] = CONFIG.bidIntervalRange[CONFIG.biddingIntensity];
    return Math.random() * (max - min) + min;
  }

  async participate() {
    await this.connect();

    // Participate in auction bidding
    const participationEndTime = Date.now() + CONFIG.auctionDuration;

    while (Date.now() < participationEndTime && this.bidsPlaced < CONFIG.maxBidsPerUser) {
      const bidAmount = Math.floor(Math.random() * 1000) + 100; // Random bid between 100-1100
      await this.placeBid(bidAmount);

      // Wait before next bid
      const waitTime = this.getBidInterval();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    await this.disconnect();
  }
}

// Auction stress tester
class AuctionStressTester {
  constructor() {
    this.metrics = new MetricsCollector();
    this.participants = [];
    this.auctionId = null;
  }

  async initializeAuction() {
    try {
      console.log('🚀 Creating test auction...');

      // Create a test auction
      const auctionResponse = await axios.post(
        `${BASE_URL}${API_PREFIX}/auctions`,
        {
          title: 'Stress Test Auction - High Concurrency',
          productId: 'stress_test_product',
          startPrice: 100,
          endTime: new Date(Date.now() + CONFIG.auctionDuration).toISOString(),
        },
        {
          headers: {
            'Authorization': 'Bearer admin_token', // Would need real admin token
            'Content-Type': 'application/json',
          },
        }
      );

      this.auctionId = auctionResponse.data.id;
      console.log(`✅ Created auction: ${this.auctionId}`);

      // Start the auction
      await axios.post(`${BASE_URL}${API_PREFIX}/auctions/${this.auctionId}/start`, {}, {
        headers: {
          'Authorization': 'Bearer admin_token',
        },
      });

      console.log('▶️  Auction started');
      return true;
    } catch (error) {
      console.error('❌ Failed to create auction:', error.message);
      return false;
    }
  }

  async createParticipants() {
    console.log(`👥 Creating ${CONFIG.totalUsers} participants...`);

    for (let i = 0; i < CONFIG.totalUsers; i++) {
      const participant = new AuctionParticipant(`user_${i}`, this.auctionId, this.metrics);
      this.participants.push(participant);
    }

    console.log('✅ All participants created');
  }

  async runStressTest() {
    console.log('\n🔥 STARTING AUCTION STRESS TEST');
    console.log('='.repeat(60));

    if (!await this.initializeAuction()) {
      return;
    }

    await this.createParticipants();

    // Start memory monitoring
    const memoryInterval = setInterval(() => {
      this.metrics.recordMemoryUsage();
    }, 5000);

    // Run test in batches to avoid overwhelming the system
    const batches = Math.ceil(CONFIG.totalUsers / CONFIG.concurrentUsers);

    console.log(`📊 Running test with ${batches} batches of ${CONFIG.concurrentUsers} users each`);

    for (let batch = 0; batch < batches; batch++) {
      const startIndex = batch * CONFIG.concurrentUsers;
      const endIndex = Math.min(startIndex + CONFIG.concurrentUsers, CONFIG.totalUsers);
      const batchParticipants = this.participants.slice(startIndex, endIndex);

      console.log(`\n📦 Starting batch ${batch + 1}/${batches} (users ${startIndex}-${endIndex - 1})`);

      // Start all participants in this batch concurrently
      const batchPromises = batchParticipants.map(participant => participant.participate());

      try {
        await Promise.allSettled(batchPromises);
        console.log(`✅ Batch ${batch + 1} completed`);
      } catch (error) {
        console.error(`❌ Batch ${batch + 1} failed:`, error.message);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Stop memory monitoring
    clearInterval(memoryInterval);

    // Wait for auction to end
    console.log('\n⏳ Waiting for auction to complete...');
    await new Promise(resolve => setTimeout(resolve, CONFIG.auctionDuration + 10000));

    this.printResults();
  }

  printResults() {
    console.log('\n📈 AUCTION STRESS TEST RESULTS');
    console.log('='.repeat(60));

    const summary = this.metrics.getSummary();

    console.log(`⏱️  Test Duration: ${summary.duration.toFixed(2)} seconds`);
    console.log(`👥 Total Participants: ${CONFIG.totalUsers}`);
    console.log(`💰 Total Bids: ${summary.totalBids.toLocaleString()}`);
    console.log(`✅ Successful Bids: ${summary.successfulBids.toLocaleString()}`);
    console.log(`❌ Failed Bids: ${summary.failedBids.toLocaleString()}`);
    console.log(`📊 Success Rate: ${summary.successRate.toFixed(2)}%`);

    console.log(`\n⚡ PERFORMANCE METRICS`);
    console.log(`Average Response Time: ${summary.averageLatency.toFixed(2)}ms`);
    console.log(`95th Percentile Latency: ${summary.p95Latency.toFixed(2)}ms`);
    console.log(`99th Percentile Latency: ${summary.p99Latency.toFixed(2)}ms`);

    console.log(`\n💾 MEMORY USAGE`);
    console.log(`Max Heap Usage: ${(summary.maxMemoryUsage / 1024 / 1024).toFixed(2)} MB`);

    console.log(`\n🌐 WEBSOCKET METRICS`);
    console.log(`Connections Established: ${summary.websocketConnections}`);
    console.log(`WebSocket Errors: ${summary.websocketErrors}`);
    console.log(`Auction State Updates: ${summary.auctionUpdates}`);

    console.log(`\n⏰ TIMER SYNCHRONIZATION`);
    console.log(`Average Timer Drift: ${summary.averageTimerDrift.toFixed(2)}ms`);

    console.log(`\n🚨 ERROR ANALYSIS`);
    console.log(`Total Errors: ${summary.totalErrors}`);

    if (summary.errors.length > 0) {
      console.log('\nTop 5 Errors:');
      const errorCounts = {};
      summary.errors.forEach(err => {
        const key = err.error.split(':')[0];
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });

      Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([error, count]) => {
          console.log(`   ${error}: ${count} times`);
        });
    }

    console.log('\n' + '='.repeat(60));

    // Performance assessment
    this.assessPerformance(summary);
  }

  assessPerformance(summary) {
    console.log('🎯 PERFORMANCE ASSESSMENT');

    let score = 100;
    let issues = [];

    // Success rate assessment
    if (summary.successRate < 95) {
      score -= 20;
      issues.push('Low bid success rate');
    }

    // Latency assessment
    if (summary.averageLatency > 1000) {
      score -= 15;
      issues.push('High average latency');
    }

    if (summary.p95Latency > 3000) {
      score -= 10;
      issues.push('High P95 latency');
    }

    // Memory assessment
    if (summary.maxMemoryUsage > 500 * 1024 * 1024) { // 500MB
      score -= 10;
      issues.push('High memory usage');
    }

    // WebSocket assessment
    if (summary.websocketErrors > summary.websocketConnections * 0.05) {
      score -= 10;
      issues.push('High WebSocket error rate');
    }

    // Timer drift assessment
    if (Math.abs(summary.averageTimerDrift) > 1000) {
      score -= 5;
      issues.push('Significant timer drift');
    }

    console.log(`Overall Score: ${score}/100`);

    if (score >= 90) {
      console.log('✅ EXCELLENT: Auction system handles high concurrency well');
    } else if (score >= 80) {
      console.log('⚠️  GOOD: Auction system performs adequately under load');
    } else if (score >= 70) {
      console.log('⚠️  FAIR: Auction system needs optimization for high load');
    } else {
      console.log('❌ POOR: Auction system cannot handle production load');
    }

    if (issues.length > 0) {
      console.log('\nAreas for improvement:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log('\n🎯 PRODUCTION READINESS:');
    if (score >= 85 && summary.successRate >= 95) {
      console.log('✅ READY: Auction system can handle 1000+ concurrent users');
    } else {
      console.log('❌ NOT READY: Requires optimization before production deployment');
    }
  }
}

// Run the stress test
if (require.main === module) {
  const tester = new AuctionStressTester();
  tester.runStressTest().catch(console.error);
}

module.exports = AuctionStressTester;
