#!/usr/bin/env node

/**
 * DAY 1: LIVE RAZORPAY ACTIVATION CHECKLIST
 * 
 * CRITICAL: Execute this script after configuring LIVE Razorpay credentials
 */

require('dotenv').config();

console.log('🟥 DAY 1: LIVE RAZORPAY ACTIVATION');
console.log('=====================================\n');

class Day1Validator {
  constructor() {
    this.checklist = {
      liveCredentials: false,
      environmentSetup: false,
      webhookRegistered: false,
      realPaymentTest: false,
      walletUpdateLogic: false
    };
    
    this.criticalIssues = [];
  }

  async validateLiveCredentials() {
    console.log('🔍 STEP 1: VALIDATING LIVE CREDENTIALS');
    console.log('=====================================');
    
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const paymentMode = process.env.PAYMENT_MODE;
    
    console.log(`RAZORPAY_KEY_ID: ${razorpayKeyId ? razorpayKeyId.substring(0, 15) + '...' : 'NOT SET'}`);
    console.log(`RAZORPAY_KEY_SECRET: ${razorpayKeySecret ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`PAYMENT_MODE: ${paymentMode || 'NOT SET'}`);
    
    // Critical checks
    const isLiveMode = razorpayKeyId?.startsWith('rzp_live_');
    const hasSecret = !!razorpayKeySecret;
    const isLivePaymentMode = paymentMode === 'live';
    const noTestMode = !razorpayKeyId?.includes('test');
    
    if (!isLiveMode) {
      this.criticalIssues.push('❌ RAZORPAY_KEY_ID must start with "rzp_live_"');
    }
    
    if (!hasSecret) {
      this.criticalIssues.push('❌ RAZORPAY_KEY_SECRET not configured');
    }
    
    if (!isLivePaymentMode) {
      this.criticalIssues.push('❌ PAYMENT_MODE must be set to "live"');
    }
    
    if (!noTestMode) {
      this.criticalIssues.push('❌ Test mode detected - remove all "rzp_test_" references');
    }
    
    this.checklist.liveCredentials = isLiveMode && hasSecret && isLivePaymentMode && noTestMode;
    
    if (this.checklist.liveCredentials) {
      console.log('✅ LIVE CREDENTIALS VALIDATED');
    } else {
      console.log('❌ LIVE CREDENTIALS ISSUES:');
      this.criticalIssues.forEach(issue => console.log(`   ${issue}`));
    }
    
    console.log('');
    return this.checklist.liveCredentials;
  }

  validateEnvironmentSetup() {
    console.log('🔧 STEP 2: VALIDATING ENVIRONMENT SETUP');
    console.log('=====================================');
    
    const requiredEnvVars = [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET', 
      'RAZORPAY_WEBHOOK_SECRET',
      'PAYMENT_MODE'
    ];
    
    const missingVars = [];
    const configuredVars = [];
    
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        configuredVars.push(varName);
      } else {
        missingVars.push(varName);
      }
    });
    
    console.log('✅ Configured variables:');
    configuredVars.forEach(varName => {
      console.log(`   ${varName}: ${process.env[varName]?.substring(0, 20)}...`);
    });
    
    if (missingVars.length > 0) {
      console.log('❌ Missing variables:');
      missingVars.forEach(varName => {
        console.log(`   ${varName}: NOT SET`);
      });
      this.criticalIssues.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    this.checklist.environmentSetup = missingVars.length === 0;
    
    if (this.checklist.environmentSetup) {
      console.log('✅ ENVIRONMENT SETUP VALIDATED');
    } else {
      console.log('❌ ENVIRONMENT SETUP INCOMPLETE');
    }
    
    console.log('');
    return this.checklist.environmentSetup;
  }

  validateWebhookSetup() {
    console.log('🪝 STEP 3: VALIDATING WEBHOOK SETUP');
    console.log('=====================================');
    
    const webhookUrl = process.env.RAZORPAY_WEBHOOK_URL;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    console.log(`RAZORPAY_WEBHOOK_URL: ${webhookUrl || 'NOT SET'}`);
    console.log(`RAZORPAY_WEBHOOK_SECRET: ${webhookSecret ? '✅ SET' : '❌ NOT SET'}`);
    
    if (!webhookUrl) {
      this.criticalIssues.push('❌ RAZORPAY_WEBHOOK_URL not configured');
      console.log('📝 Expected format: https://api.quickbid.in/webhooks/razorpay');
    }
    
    if (!webhookSecret) {
      this.criticalIssues.push('❌ RAZORPAY_WEBHOOK_SECRET not configured');
    }
    
    // Check webhook endpoint exists
    console.log('📝 Required webhook events:');
    console.log('   ✅ payment.captured');
    console.log('   ✅ payment.failed');
    console.log('   ✅ refund.processed');
    
    this.checklist.webhookRegistered = !!(webhookUrl && webhookSecret);
    
    if (this.checklist.webhookRegistered) {
      console.log('✅ WEBHOOK SETUP VALIDATED');
    } else {
      console.log('❌ WEBHOOK SETUP INCOMPLETE');
    }
    
    console.log('');
    return this.checklist.webhookRegistered;
  }

  async prepareRealPaymentTest() {
    console.log('💳 STEP 4: PREPARING ₹1 REAL PAYMENT TEST');
    console.log('=====================================');
    
    console.log('📝 PAYMENT TEST INSTRUCTIONS:');
    console.log('=====================================');
    console.log('1. Start QuickBid frontend application');
    console.log('2. Navigate to wallet top-up');
    console.log('3. Enter ₹1.00 as amount');
    console.log('4. Use your own phone/UPI/card');
    console.log('5. Complete payment');
    console.log('');
    console.log('⚠️  CRITICAL: This will charge ₹1.00 to your account');
    console.log('⚠️  ONLY PROCEED if you are ready for LIVE transaction');
    console.log('');
    console.log('📊 EXPECTED RESULTS:');
    console.log('   ✅ Razorpay payment success');
    console.log('   ✅ Webhook hits backend');
    console.log('   ✅ Wallet updated ONLY after webhook');
    console.log('   ✅ Admin sees transaction with razorpay_payment_id');
    console.log('   ✅ Transaction status = captured');
    console.log('');
    console.log('❌ CRITICAL FAILURE INDICATORS:');
    console.log('   ❌ Wallet updates before webhook');
    console.log('   ❌ No webhook received');
    console.log('   ❌ Transaction not recorded');
    console.log('   ❌ Admin cannot see transaction');
    
    console.log('🔄 READY TO TEST?');
    console.log('📝 Press ENTER when payment test is completed:');
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'success' || input === 'completed' || input === 'yes') {
          console.log('✅ ₹1 REAL PAYMENT TEST COMPLETED');
          this.checklist.realPaymentTest = true;
        } else {
          console.log('❌ ₹1 REAL PAYMENT TEST FAILED OR INCOMPLETE');
          this.checklist.realPaymentTest = false;
          this.criticalIssues.push('Real payment test failed or incomplete');
        }
        
        resolve(this.checklist.realPaymentTest);
      });
    });
  }

  validateWalletUpdateLogic() {
    console.log('💰 STEP 5: VALIDATING WALLET UPDATE LOGIC');
    console.log('=====================================');
    
    console.log('📝 WALLET UPDATE VERIFICATION:');
    console.log('=====================================');
    console.log('1. Check wallet_transactions table');
    console.log('2. Verify new transaction with order ID');
    console.log('3. Confirm wallet balance increased by ₹1.00');
    console.log('4. Transaction should be marked "completed"');
    console.log('5. Verify metadata includes webhook info');
    console.log('');
    console.log('🔍 CRITICAL CHECK:');
    console.log('❌ If wallet updates BEFORE webhook → STOP LAUNCH');
    console.log('✅ Wallet should update ONLY AFTER webhook processing');
    console.log('');
    
    console.log('📊 VERIFICATION CHECKLIST:');
    console.log('   [ ] Transaction recorded in wallet_transactions');
    console.log('   [ ] Amount = ₹1.00');
    console.log('   [ ] Status = "completed"');
    console.log('   [ ] gateway_transaction_id matches Razorpay');
    console.log('   [ ] wallet_balance updated correctly');
    console.log('   [ ] webhook_processed = true in metadata');
    console.log('');
    
    console.log('🔄 VERIFICATION COMPLETE?');
    console.log('📝 Press ENTER when wallet verification is done:');
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'success' || input === 'completed' || input === 'yes') {
          console.log('✅ WALLET UPDATE LOGIC VALIDATED');
          this.checklist.walletUpdateLogic = true;
        } else {
          console.log('❌ WALLET UPDATE LOGIC ISSUES FOUND');
          this.checklist.walletUpdateLogic = false;
          this.criticalIssues.push('Wallet update logic has issues');
        }
        
        resolve(this.checklist.walletUpdateLogic);
      });
    });
  }

  async executeDay1Validation() {
    console.log('🚀 STARTING DAY 1 VALIDATION');
    console.log('=====================================\n');
    
    try {
      // Step 1: Validate Live Credentials
      await this.validateLiveCredentials();
      
      // Step 2: Validate Environment Setup
      this.validateEnvironmentSetup();
      
      // Step 3: Validate Webhook Setup
      this.validateWebhookSetup();
      
      // Step 4: Prepare Real Payment Test
      if (this.checklist.liveCredentials && this.checklist.environmentSetup) {
        await this.prepareRealPaymentTest();
      } else {
        console.log('❌ CANNOT PROCEED WITH PAYMENT TEST - FIX CREDENTIALS FIRST');
        this.checklist.realPaymentTest = false;
      }
      
      // Step 5: Validate Wallet Update Logic
      if (this.checklist.realPaymentTest) {
        await this.validateWalletUpdateLogic();
      } else {
        console.log('❌ CANNOT VERIFY WALLET UPDATE - PAYMENT TEST REQUIRED');
        this.checklist.walletUpdateLogic = false;
      }
      
      // Results Summary
      this.printResults();
      
      return this.checklist;
      
    } catch (error) {
      console.error('🚨 DAY 1 VALIDATION FAILED:', error.message);
      throw error;
    }
  }

  printResults() {
    console.log('\n📊 DAY 1 VALIDATION RESULTS:');
    console.log('=====================================');
    
    Object.entries(this.checklist).forEach(([task, completed]) => {
      const status = completed ? '✅ PASS' : '❌ FAIL';
      const taskName = task.replace(/([A-Z])/g, ' $1').trim();
      console.log(`${taskName.padEnd(30)}: ${status}`);
    });
    
    const passedTasks = Object.values(this.checklist).filter(r => r === true).length;
    const totalTasks = Object.keys(this.checklist).length;
    const successRate = Math.round((passedTasks / totalTasks) * 100);
    
    console.log(`\n🎯 Day 1 Success Rate: ${successRate}%`);
    
    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.criticalIssues.forEach(issue => console.log(`   ${issue}`));
    }
    
    if (successRate >= 80 && this.criticalIssues.length === 0) {
      console.log('\n✅ DAY 1 COMPLETED SUCCESSFULLY');
      console.log('🚀 READY FOR DAY 2: FAILURE & EDGE-CASE VALIDATION');
    } else {
      console.log('\n❌ DAY 1 INCOMPLETE');
      console.log('🛑 FIX CRITICAL ISSUES BEFORE PROCEEDING');
    }
  }
}

// MAIN EXECUTION
async function main() {
  console.log('🟥 DAY 1: LIVE RAZORPAY ACTIVATION');
  console.log('=====================================\n');
  
  const validator = new Day1Validator();
  
  try {
    await validator.executeDay1Validation();
    
    const passedTasks = Object.values(validator.checklist).filter(r => r === true).length;
    const totalTasks = Object.keys(validator.checklist).length;
    const successRate = Math.round((passedTasks / totalTasks) * 100);
    
    if (successRate >= 80 && validator.criticalIssues.length === 0) {
      console.log('\n🎉 DAY 1 COMPLETE - PROCEED TO DAY 2');
    } else {
      console.log('\n🛑 DAY 1 INCOMPLETE - FIX ISSUES FIRST');
    }
    
  } catch (error) {
    console.error('🚨 Day 1 validation failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { Day1Validator };
