#!/usr/bin/env node

/**
 * QuickMela Deployment Verification & Launch Script
 * Verify deployment and prepare for production launch
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 QuickMela Deployment Verification & Launch');
console.log('==============================================');

const verificationResults = {
  timestamp: new Date().toISOString(),
  deploymentUrl: '',
  checks: [],
  overallStatus: 'pending',
  summary: {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
  }
};

function runVerificationCheck(name, description, checkFunction, critical = false) {
  console.log(`\n🔍 ${name}`);
  console.log(`📝 ${description}`);
  console.log('─'.repeat(60));

  const checkResult = {
    name,
    description,
    status: 'running',
    critical,
    details: '',
    duration: 0,
    startTime: new Date().toISOString(),
  };

  const startTime = Date.now();

  try {
    const result = checkFunction();
    checkResult.status = result.passed ? 'passed' : 'failed';
    checkResult.details = result.details || '';

    console.log(result.passed ? '✅ PASSED' : '❌ FAILED');
    if (result.details) console.log(`📄 ${result.details}`);

  } catch (error) {
    checkResult.status = 'error';
    checkResult.details = error.message;

    console.log('❌ ERROR');
    console.log(`Error: ${error.message}`);

    if (critical) {
      console.log('\n🚨 CRITICAL FAILURE - Cannot proceed with launch');
      process.exit(1);
    }
  }

  checkResult.duration = Date.now() - startTime;
  console.log(`⏱️ Duration: ${checkResult.duration}ms`);

  verificationResults.checks.push(checkResult);
  return checkResult;
}

// ================================
// DEPLOYMENT VERIFICATION CHECKS
// ================================

// Check 1: Environment Configuration
runVerificationCheck(
  'Environment Configuration',
  'Verify production environment variables are properly configured',
  () => {
    const envPath = path.join(__dirname, '.env.production');
    const issues = [];

    if (!fs.existsSync(envPath)) {
      throw new Error('Production environment file not found');
    }

    const envContent = fs.readFileSync(envPath, 'utf8');

    // Critical environment variables
    const criticalVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'WHATSAPP_ACCESS_TOKEN',
    ];

    criticalVars.forEach(varName => {
      const regex = new RegExp(`^${varName}=`, 'm');
      const match = envContent.match(regex);

      if (!match || match[0].includes('your_') || match[0].includes('placeholder')) {
        issues.push(`${varName} not properly configured`);
      }
    });

    return {
      passed: issues.length === 0,
      details: issues.length === 0 ? 'All critical environment variables configured' : `Issues: ${issues.join(', ')}`
    };
  },
  true // Critical check
);

// Check 2: Application Build
runVerificationCheck(
  'Application Build',
  'Verify application builds successfully for production',
  () => {
    try {
      // Test backend build
      execSync('npm run build', {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'pipe'
      });

      // Check if dist directory exists
      const distPath = path.join(__dirname, 'backend', 'dist');
      if (!fs.existsSync(distPath)) {
        throw new Error('Backend build failed - dist directory not found');
      }

      return {
        passed: true,
        details: 'Backend application built successfully'
      };

    } catch (error) {
      return {
        passed: false,
        details: `Build failed: ${error.message}`
      };
    }
  },
  true // Critical check
);

// Check 3: WhatsApp API Configuration
runVerificationCheck(
  'WhatsApp API Configuration',
  'Verify WhatsApp Business API is properly configured',
  () => {
    const envContent = fs.readFileSync(path.join(__dirname, '.env.production'), 'utf8');

    const hasToken = envContent.includes('WHATSAPP_ACCESS_TOKEN=EAAMhbiZBMtLYBQor9gdZAZBBVQNyH3aYGfLHI2iDodYQPvCiaoZCtvv4pL8b1ehdY1I6RbNWrbQ5QZCJgsn9IKJZBGoOOFrEC10kpWuVoXNC70NaHdvZBcz67Fuqcy0Oij0FSrDftqpZBz71UZAZAegP9FKu1d6jEEWDcP4VGZAwmWVCg9kUIHa4atqZC2ZAlCwX6nOyfDHLuZABT8lSk8ZCQKUP1gFpS2ACtkvdCVkNsJLmJ6mXvFw0L3HWzC7Kzr8WURvJb2Ry4e80UJwJuj7ApfbFziwPvbW');

    return {
      passed: hasToken,
      details: hasToken ? 'WhatsApp access token configured' : 'WhatsApp access token not found'
    };
  },
  true // Critical check
);

// Check 4: Security Configuration
runVerificationCheck(
  'Security Configuration',
  'Verify security settings are production-ready',
  () => {
    const envContent = fs.readFileSync(path.join(__dirname, '.env.production'), 'utf8');

    const securityChecks = [
      { name: 'NODE_ENV', pattern: /NODE_ENV=production/, required: true },
      { name: 'JWT_SECRET', pattern: /JWT_SECRET=.{32,}/, required: true },
      { name: 'CORS_ORIGINS', pattern: /CORS_ORIGINS=https:\/\/quickmela/, required: false },
    ];

    const issues = [];
    securityChecks.forEach(check => {
      const hasConfig = check.pattern.test(envContent);
      if (check.required && !hasConfig) {
        issues.push(`${check.name} not properly configured`);
      }
    });

    return {
      passed: issues.length === 0,
      details: issues.length === 0 ? 'Security configuration validated' : `Security issues: ${issues.join(', ')}`
    };
  }
);

// Check 5: Deployment Readiness
runVerificationCheck(
  'Deployment Readiness',
  'Verify all components are ready for Railway deployment',
  () => {
    const checks = [
      { name: 'package.json exists', check: () => fs.existsSync(path.join(__dirname, 'backend', 'package.json')) },
      { name: 'TypeScript config exists', check: () => fs.existsSync(path.join(__dirname, 'backend', 'tsconfig.json')) },
      { name: 'Prisma schema exists', check: () => fs.existsSync(path.join(__dirname, 'backend', 'prisma', 'schema.prisma')) },
      { name: 'Railway config exists', check: () => fs.existsSync(path.join(__dirname, 'railway.toml')) },
    ];

    const failedChecks = checks.filter(c => !c.check());

    return {
      passed: failedChecks.length === 0,
      details: failedChecks.length === 0 ? 'All deployment files present' : `Missing files: ${failedChecks.map(c => c.name).join(', ')}`
    };
  }
);

// ================================
// DEPLOYMENT SUMMARY
// ================================

function generateDeploymentSummary() {
  // Calculate summary
  verificationResults.summary.totalChecks = verificationResults.checks.length;
  verificationResults.summary.passedChecks = verificationResults.checks.filter(c => c.status === 'passed').length;
  verificationResults.summary.failedChecks = verificationResults.checks.filter(c => c.status !== 'passed').length;

  const criticalFailures = verificationResults.checks.filter(c => c.critical && c.status !== 'passed').length;

  if (criticalFailures > 0) {
    verificationResults.overallStatus = 'failed';
  } else if (verificationResults.summary.failedChecks > 0) {
    verificationResults.overallStatus = 'partial';
  } else {
    verificationResults.overallStatus = 'ready';
  }

  console.log('\n📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('==================================');
  console.log(`Total Checks: ${verificationResults.summary.totalChecks}`);
  console.log(`✅ Passed: ${verificationResults.summary.passedChecks}`);
  console.log(`❌ Failed: ${verificationResults.summary.failedChecks}`);
  console.log(`📈 Success Rate: ${Math.round((verificationResults.summary.passedChecks / verificationResults.summary.totalChecks) * 100)}%`);

  if (verificationResults.overallStatus === 'ready') {
    console.log('\n🎉 DEPLOYMENT READY - ALL CHECKS PASSED');
    console.log('=========================================');
    console.log('✅ System is ready for Railway deployment');
    console.log('🚀 Proceed with Railway web dashboard deployment');

  } else if (verificationResults.overallStatus === 'partial') {
    console.log('\n⚠️ PARTIAL SUCCESS - SOME ISSUES FOUND');
    console.log('====================================');
    console.log('✅ Critical systems OK, but some optimizations needed');
    console.log('🚀 Can proceed with deployment, but address issues post-launch');

  } else {
    console.log('\n🚨 DEPLOYMENT BLOCKED - CRITICAL ISSUES');
    console.log('=====================================');
    console.log('❌ Critical issues must be resolved before deployment');
    console.log('🔧 Fix the issues above and re-run verification');
  }

  // Detailed results
  console.log('\n📋 CHECK DETAILS:');
  verificationResults.checks.forEach((check, index) => {
    const statusIcon = check.status === 'passed' ? '✅' : check.status === 'failed' ? '❌' : '🔄';
    console.log(`${statusIcon} ${index + 1}. ${check.name}`);
    if (check.details) console.log(`      ${check.details}`);
  });

  return verificationResults;
}

// ================================
// MANUAL DEPLOYMENT INSTRUCTIONS
// ================================

function printDeploymentInstructions() {
  if (verificationResults.overallStatus !== 'ready') {
    console.log('\n⚠️  ADDRESS ISSUES BEFORE PROCEEDING WITH DEPLOYMENT');
    return;
  }

  console.log('\n🚀 MANUAL RAILWAY DEPLOYMENT INSTRUCTIONS');
  console.log('==========================================');

  console.log('\n📋 STEP-BY-STEP DEPLOYMENT:');
  console.log('===========================');

  console.log('\n1️⃣ CREATE RAILWAY PROJECT:');
  console.log('   • Go to: https://railway.app');
  console.log('   • Click: "New Project" → "Empty Project"');
  console.log('   • Name: quickmela-production');

  console.log('\n2️⃣ ADD DATABASE SERVICES:');
  console.log('   • PostgreSQL: Add → Database → PostgreSQL');
  console.log('   • Redis: Add → Database → Redis');

  console.log('\n3️⃣ DEPLOY BACKEND APPLICATION:');
  console.log('   • Click: "Add" → "GitHub Repo" (connect your repository)');
  console.log('   • OR: "Empty Service" → Upload code manually');
  console.log('   • Railway will auto-detect Node.js');
  console.log('   • Build Command: npm run build');
  console.log('   • Start Command: npm run start:prod');

  console.log('\n4️⃣ CONFIGURE ENVIRONMENT VARIABLES:');
  console.log('   • Go to: Service → Variables tab');
  console.log('   • Copy all variables from .env.production');
  console.log('   • Key variables: DATABASE_URL, REDIS_URL, JWT_SECRET, WHATSAPP_ACCESS_TOKEN');

  console.log('\n5️⃣ RUN DATABASE MIGRATIONS:');
  console.log('   • Go to: Service → Terminal tab');
  console.log('   • Run: npx prisma migrate deploy');
  console.log('   • Run: npx prisma db seed');

  console.log('\n6️⃣ CONFIGURE DOMAIN & SSL:');
  console.log('   • Go to: Project Settings → Domains');
  console.log('   • Add: quickmela.com, www.quickmela.com');
  console.log('   • SSL: Automatic (free)');

  console.log('\n🎯 POST-DEPLOYMENT TESTING:');
  console.log('===========================');

  console.log('\nTest Health Check:');
  console.log('curl https://[your-railway-url]/health');

  console.log('\nTest API Endpoints:');
  console.log('curl https://[your-railway-url]/api/products');

  console.log('\nTest WhatsApp Webhook:');
  console.log(`curl -X POST https://[your-railway-url]/webhooks/whatsapp \\
  -H "Content-Type: application/json" \\
  -d '{"test": "webhook"}'`);

  console.log('\n🎊 SUCCESS METRICS:');
  console.log('===================');
  console.log('• Response Time: < 500ms');
  console.log('• Health Check: 200 OK');
  console.log('• Error Rate: < 1%');
  console.log('• WhatsApp: Webhook responding');

  console.log('\n⏰ ESTIMATED TIME: 30-45 minutes');
}

// ================================
// LAUNCH SEQUENCE
// ================================

function printLaunchSequence() {
  if (verificationResults.overallStatus !== 'ready') {
    console.log('\n⚠️  COMPLETE VERIFICATION BEFORE LAUNCH');
    return;
  }

  console.log('\n🎯 QUICKMELA LAUNCH SEQUENCE');
  console.log('============================');

  console.log('\n📅 PHASE 1: DEPLOYMENT (30 minutes)');
  console.log('   ⏳ Railway project setup');
  console.log('   ⏳ Database configuration');
  console.log('   ⏳ Application deployment');
  console.log('   ⏳ Environment setup');
  console.log('   ✅ Domain & SSL configuration');

  console.log('\n📅 PHASE 2: INTEGRATION SETUP (30 minutes)');
  console.log('   ⏳ WhatsApp Business API (Meta Business Manager)');
  console.log('   ⏳ Razorpay payment gateway');
  console.log('   ⏳ SendGrid email service');
  console.log('   ⏳ Sentry error monitoring');

  console.log('\n📅 PHASE 3: TESTING & VALIDATION (30 minutes)');
  console.log('   ⏳ Health check validation');
  console.log('   ⏳ API endpoint testing');
  console.log('   ⏳ WhatsApp webhook testing');
  console.log('   ⏳ Payment flow testing');

  console.log('\n📅 PHASE 4: GO-LIVE (10 minutes)');
  console.log('   ⏳ Final security audit');
  console.log('   ⏳ Enable launch mode features');
  console.log('   🚀 OPEN TO PUBLIC');

  console.log('\n🎊 TOTAL LAUNCH TIME: ~2 hours');
  console.log('============================');

  console.log('\n🏆 SUCCESS CRITERIA:');
  console.log('===================');
  console.log('✅ Zero critical errors in first hour');
  console.log('✅ 99.9% uptime maintained');
  console.log('✅ User registration working');
  console.log('✅ WhatsApp messages sending');
  console.log('✅ Payment processing active');

  console.log('\n🚨 EMERGENCY CONTACTS:');
  console.log('======================');
  console.log('• Technical Issues: dev@quickmela.com');
  console.log('• Railway Support: Railway dashboard');
  console.log('• WhatsApp: Meta Business Manager');
  console.log('• Payments: Razorpay support');
}

// Generate reports and instructions
const report = generateDeploymentSummary();
printDeploymentInstructions();
printLaunchSequence();

// Save verification results
fs.writeFileSync(
  path.join(__dirname, 'deployment-verification-results.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📄 Verification results saved to: deployment-verification-results.json');

if (verificationResults.overallStatus === 'ready') {
  console.log('\n🎉 QUICKMELA IS READY FOR DEPLOYMENT!');
  console.log('=====================================');
  console.log('✅ All systems verified and ready');
  console.log('🚀 Follow the deployment instructions above');
  console.log('🎯 Launch sequence: 2 hours to live platform');
} else {
  console.log('\n⚠️  DEPLOYMENT ISSUES DETECTED');
  console.log('==============================');
  console.log('❌ Resolve critical issues before deployment');
  console.log('🔧 Run verification again after fixes');
}

// Exit with appropriate code
const exitCode = verificationResults.overallStatus === 'ready' ? 0 :
                verificationResults.overallStatus === 'partial' ? 1 : 2;
process.exit(exitCode);
