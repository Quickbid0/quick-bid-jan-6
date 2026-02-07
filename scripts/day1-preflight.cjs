#!/usr/bin/env node

/**
 * DAY 1 PRE-FLIGHT CHECKLIST
 * 
 * Execute this BEFORE running day1-live-activation.cjs
 */

require('dotenv').config();

console.log('🔍 DAY 1 PRE-FLIGHT CHECKLIST');
console.log('=====================================\n');

class PreFlightChecker {
  constructor() {
    this.checks = {
      razorpayLiveMode: false,
      bankVerified: false,
      noTestMode: false,
      backendRestarted: false,
      webhookReachable: false
    };
    
    this.issues = [];
  }

  checkRazorpayLiveMode() {
    console.log('🔍 CHECK 1: RAZORPAY LIVE MODE');
    console.log('=====================================');
    
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const isLiveMode = razorpayKeyId?.startsWith('rzp_live_');
    
    console.log(`RAZORPAY_KEY_ID: ${razorpayKeyId ? razorpayKeyId.substring(0, 15) + '...' : 'NOT SET'}`);
    
    if (isLiveMode) {
      console.log('✅ Razorpay in LIVE MODE');
      this.checks.razorpayLiveMode = true;
    } else {
      console.log('❌ Razorpay NOT in LIVE MODE');
      console.log('📝 Action: Switch to LIVE MODE in Razorpay dashboard');
      this.issues.push('Razorpay not in LIVE MODE');
    }
    
    console.log('');
    return this.checks.razorpayLiveMode;
  }

  checkBankVerified() {
    console.log('🏦 CHECK 2: BANK VERIFICATION');
    console.log('=====================================');
    
    console.log('📝 MANUAL CHECK REQUIRED:');
    console.log('   [ ] Bank account verified in Razorpay dashboard');
    console.log('   [ ] Personal bank account OK for soft launch');
    console.log('   [ ] Settlement account configured');
    
    console.log('🔄 BANK VERIFICATION COMPLETE?');
    console.log('📝 Press ENTER if bank is verified:');
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'yes' || input === 'verified' || input === 'ok') {
          console.log('✅ Bank account verified');
          this.checks.bankVerified = true;
        } else {
          console.log('❌ Bank account not verified');
          this.issues.push('Bank account not verified');
        }
        
        console.log('');
        resolve(this.checks.bankVerified);
      });
    });
  }

  checkNoTestMode() {
    console.log('🧪 CHECK 3: NO TEST MODE REMNANTS');
    console.log('=====================================');
    
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const paymentMode = process.env.PAYMENT_MODE;
    
    const hasTestMode = razorpayKeyId?.includes('test') || paymentMode === 'test';
    
    if (!hasTestMode) {
      console.log('✅ No test mode remnants found');
      this.checks.noTestMode = true;
    } else {
      console.log('❌ Test mode remnants detected');
      console.log('📝 Action: Remove all "rzp_test_" and test mode settings');
      this.issues.push('Test mode remnants detected');
    }
    
    console.log('');
    return this.checks.noTestMode;
  }

  checkBackendRestarted() {
    console.log('🔄 CHECK 4: BACKEND RESTARTED');
    console.log('=====================================');
    
    console.log('📝 MANUAL CHECK REQUIRED:');
    console.log('   [ ] Backend restarted after .env changes');
    console.log('   [ ] New environment variables loaded');
    console.log('   [ ] LIVE MODE enabled in logs');
    
    console.log('🔄 BACKEND RESTARTED?');
    console.log('📝 Press ENTER if backend restarted:');
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'yes' || input === 'restarted' || input === 'ok') {
          console.log('✅ Backend restarted with new config');
          this.checks.backendRestarted = true;
        } else {
          console.log('❌ Backend not restarted');
          this.issues.push('Backend not restarted');
        }
        
        console.log('');
        resolve(this.checks.backendRestarted);
      });
    });
  }

  checkWebhookReachable() {
    console.log('🪝 CHECK 5: WEBHOOK REACHABLE');
    console.log('=====================================');
    
    const webhookUrl = process.env.RAZORPAY_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('❌ Webhook URL not configured');
      this.issues.push('Webhook URL not configured');
      console.log('');
      return false;
    }
    
    console.log(`📝 Testing webhook: ${webhookUrl}`);
    console.log('📝 Action: Run this command in another terminal:');
    console.log(`   curl -X POST ${webhookUrl} -H "Content-Type: application/json" -d '{"test": true}'`);
    
    console.log('🔄 WEBHOOK REACHABLE?');
    console.log('📝 Press ENTER if webhook responds (200 OK):');
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'yes' || input === 'ok' || input === '200') {
          console.log('✅ Webhook endpoint reachable');
          this.checks.webhookReachable = true;
        } else {
          console.log('❌ Webhook endpoint not reachable');
          this.issues.push('Webhook endpoint not reachable');
        }
        
        console.log('');
        resolve(this.checks.webhookReachable);
      });
    });
  }

  async runPreFlightChecks() {
    console.log('🚀 STARTING PRE-FLIGHT CHECKS');
    console.log('=====================================\n');
    
    try {
      // Check 1: Razorpay Live Mode
      this.checkRazorpayLiveMode();
      
      // Check 2: Bank Verification
      await this.checkBankVerified();
      
      // Check 3: No Test Mode
      this.checkNoTestMode();
      
      // Check 4: Backend Restarted
      await this.checkBackendRestarted();
      
      // Check 5: Webhook Reachable
      await this.checkWebhookReachable();
      
      // Results
      this.printResults();
      
      return this.checks;
      
    } catch (error) {
      console.error('🚨 Pre-flight checks failed:', error.message);
      throw error;
    }
  }

  printResults() {
    console.log('📊 PRE-FLIGHT CHECK RESULTS:');
    console.log('=====================================');
    
    Object.entries(this.checks).forEach(([check, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const checkName = check.replace(/([A-Z])/g, ' $1').trim();
      console.log(`${checkName.padEnd(25)}: ${status}`);
    });
    
    const passedChecks = Object.values(this.checks).filter(r => r === true).length;
    const totalChecks = Object.keys(this.checks).length;
    const successRate = Math.round((passedChecks / totalChecks) * 100);
    
    console.log(`\n🎯 Pre-flight Success Rate: ${successRate}%`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    if (successRate === 100) {
      console.log('\n✅ ALL PRE-FLIGHT CHECKS PASSED');
      console.log('🚀 READY FOR DAY 1 EXECUTION');
      console.log('📝 Run: node scripts/day1-live-activation.cjs');
    } else {
      console.log('\n❌ PRE-FLIGHT CHECKS FAILED');
      console.log('🛑 FIX ISSUES BEFORE PROCEEDING');
      console.log('📝 DO NOT run day1 script until all checks pass');
    }
  }
}

// MAIN EXECUTION
async function main() {
  console.log('🔍 DAY 1 PRE-FLIGHT CHECKLIST');
  console.log('=====================================\n');
  
  const checker = new PreFlightChecker();
  
  try {
    await checker.runPreFlightChecks();
    
    const passedChecks = Object.values(checker.checks).filter(r => r === true).length;
    const totalChecks = Object.keys(checker.checks).length;
    const successRate = Math.round((passedChecks / totalChecks) * 100);
    
    if (successRate === 100) {
      console.log('\n🎉 PRE-FLIGHT COMPLETE - EXECUTE DAY 1');
    } else {
      console.log('\n🛑 PRE-FLIGHT INCOMPLETE - FIX ISSUES FIRST');
    }
    
  } catch (error) {
    console.error('🚨 Pre-flight failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PreFlightChecker };
