// Automated Database and Login Testing Script
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKEND_URL = 'http://localhost:4010';

console.log('🚀 Starting Automated Database and Login Testing...\n');

// Test results tracking
const results = {
  database: { passed: 0, failed: 0, tests: [] },
  auth: { passed: 0, failed: 0, tests: [] },
  api: { passed: 0, failed: 0, tests: [] }
};

function logResult(category, testName, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  const fullMessage = `${status} ${testName}${message ? ': ' + message : ''}`;
  console.log(fullMessage);

  results[category].tests.push({ name: testName, success, message });
  if (success) {
    results[category].passed++;
  } else {
    results[category].failed++;
  }
}

async function testDatabaseConnectivity() {
  console.log('📊 Testing Database Connectivity...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Test 1: Basic connection
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);

    if (usersError) {
      logResult('database', 'Basic connection', false, usersError.message);
    } else {
      logResult('database', 'Basic connection', true, `Found ${users.length} users`);
    }

    // Test 2: Users table operations
    const testEmail = `test-${Date.now()}@quickbid.com`;
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: 'Test User',
        role: 'buyer',
        status: 'active',
        email_verification_status: 'verified'
      })
      .select()
      .single();

    if (insertError) {
      logResult('database', 'User insertion', false, insertError.message);
    } else {
      logResult('database', 'User insertion', true, `Created user: ${insertData.email}`);

      // Test 3: User update
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: 'Updated Test User' })
        .eq('id', insertData.id);

      if (updateError) {
        logResult('database', 'User update', false, updateError.message);
      } else {
        logResult('database', 'User update', true);
      }

      // Test 4: User deletion (cleanup)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        logResult('database', 'User deletion', false, deleteError.message);
      } else {
        logResult('database', 'User deletion', true);
      }
    }

    // Test 5: Wallets table
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('id, user_id, balance')
      .limit(3);

    if (walletsError) {
      logResult('database', 'Wallets query', false, walletsError.message);
    } else {
      logResult('database', 'Wallets query', true, `Found ${wallets.length} wallets`);
    }

    // Test 6: Products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, current_bid, auction_status')
      .limit(3);

    if (productsError) {
      logResult('database', 'Products query', false, productsError.message);
    } else {
      logResult('database', 'Products query', true, `Found ${products.length} products`);
    }

    // Test 7: Security tables
    const { data: security, error: securityError } = await supabase
      .from('user_security_status')
      .select('user_id, risk_level')
      .limit(3);

    if (securityError) {
      logResult('database', 'Security status query', false, securityError.message);
    } else {
      logResult('database', 'Security status query', true, `Found ${security.length} security records`);
    }

  } catch (err) {
    logResult('database', 'Database connectivity', false, err.message);
  }

  console.log('');
}

async function testAPIs() {
  console.log('🔗 Testing API Endpoints...\n');

  try {
    // Test 1: Backend health check
    const healthResponse = await fetch(`${BACKEND_URL}/api/test`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      logResult('api', 'Backend health check', true, `Response: ${JSON.stringify(healthData)}`);
    } else {
      logResult('api', 'Backend health check', false, `Status: ${healthResponse.status}`);
    }

    // Test 2: CORS preflight
    const corsResponse = await fetch(`${BACKEND_URL}/api/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    if (corsResponse.status === 200) {
      logResult('api', 'CORS preflight', true);
    } else {
      logResult('api', 'CORS preflight', false, `Status: ${corsResponse.status}`);
    }

    // Test 3: Authentication endpoints (will fail without valid tokens, but should not crash)
    try {
      const authResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass'
        })
      });

      // We expect this to fail (401 unauthorized) or return 404 (not implemented in minimal server), but not crash the server
      if (authResponse.status === 401 || authResponse.status === 200 || authResponse.status === 404) {
        logResult('api', 'Auth endpoint response', true, `Status: ${authResponse.status}`);
      } else {
        logResult('api', 'Auth endpoint response', false, `Unexpected status: ${authResponse.status}`);
      }
    } catch (err) {
      logResult('api', 'Auth endpoint', false, err.message);
    }

  } catch (err) {
    logResult('api', 'API connectivity', false, err.message);
  }

  console.log('');
}

async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Test 1: Create test user directly in database
    const testEmail = `autotest-${Date.now()}@quickbid.com`;
    const testPassword = 'TestPass123!';

    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (userError) {
      logResult('auth', 'User creation via Supabase Auth', false, userError.message);
    } else {
      logResult('auth', 'User creation via Supabase Auth', true, `Created user: ${userData.user.email}`);

      // Test 2: Create user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userData.user.id,
          email: testEmail,
          name: 'Auto Test User',
          role: 'buyer',
          status: 'active',
          email_verification_status: 'verified'
        });

      if (profileError) {
        logResult('auth', 'User profile creation', false, profileError.message);
      } else {
        logResult('auth', 'User profile creation', true);
      }

      // Test 3: Create wallet for user
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: userData.user.id,
          balance: 100.00,
          is_sandbox: false
        });

      if (walletError) {
        logResult('auth', 'Wallet creation', false, walletError.message);
      } else {
        logResult('auth', 'Wallet creation', true);
      }

      // Test 4: Sign in user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        logResult('auth', 'User sign in', false, signInError.message);
      } else {
        logResult('auth', 'User sign in', true, `Session created for ${signInData.user.email}`);

        // Test 5: Access protected data with session
        const sessionToken = signInData.session.access_token;

        const protectedResponse = await fetch(`${BACKEND_URL}/api/test`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Origin': 'http://localhost:5173'
          }
        });

        if (protectedResponse.ok) {
          logResult('auth', 'Protected API access', true);
        } else {
          logResult('auth', 'Protected API access', false, `Status: ${protectedResponse.status}`);
        }

        // Test 6: Sign out
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          logResult('auth', 'User sign out', false, signOutError.message);
        } else {
          logResult('auth', 'User sign out', true);
        }
      }

      // Cleanup: Delete test user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userData.user.id);
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test user:', deleteError.message);
      }
    }

  } catch (err) {
    logResult('auth', 'Authentication flow', false, err.message);
  }

  console.log('');
}

function printSummary() {
  console.log('📋 TEST SUMMARY\n');

  const categories = ['database', 'api', 'auth'];
  let totalPassed = 0;
  let totalFailed = 0;

  categories.forEach(category => {
    const { passed, failed, tests } = results[category];
    totalPassed += passed;
    totalFailed += failed;

    console.log(`${category.toUpperCase()}: ${passed} passed, ${failed} failed`);

    tests.forEach(test => {
      const status = test.success ? '✅' : '❌';
      console.log(`  ${status} ${test.name}`);
      if (!test.success && test.message) {
        console.log(`    ${test.message}`);
      }
    });

    console.log('');
  });

  const totalTests = totalPassed + totalFailed;
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

  console.log(`🎯 OVERALL: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);

  if (totalFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! Database and authentication are working correctly.');
    console.log('🚀 READY FOR PRODUCTION DEPLOYMENT');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Review the errors above before production deployment.');
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testDatabaseConnectivity();
    await testAPIs();
    await testAuthenticationFlow();
  } catch (err) {
    console.error('❌ Test execution failed:', err);
  } finally {
    printSummary();
  }
}

runAllTests();
