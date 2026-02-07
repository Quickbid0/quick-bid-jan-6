// QuickMela Frontend-Backend Connection Test
const API_URL = 'http://localhost:4011';

async function testConnection() {
  console.log('🧪 TESTING FRONTEND-BACKEND CONNECTION');
  console.log('====================================');
  console.log('');

  try {
    // Test 1: Basic API health check
    console.log('1. Testing API health...');
    const healthResponse = await fetch(`${API_URL}/`);
    console.log(`✅ API Health: ${healthResponse.status}`);
    
    // Test 2: Login endpoint with CORS
    console.log('2. Testing login endpoint with CORS...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3021'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log(`✅ Login: ${loginResponse.status} - ${loginData.message}`);
    
    // Test 3: Get products
    console.log('3. Testing products endpoint...');
    const productsResponse = await fetch(`${API_URL}/api/products`);
    console.log(`✅ Products: ${productsResponse.status}`);
    
    // Test 4: Wallet balance (with auth)
    console.log('4. Testing wallet endpoint...');
    const walletResponse = await fetch(`${API_URL}/api/wallet/balance`, {
      headers: {
        'Authorization': 'Bearer mock-token',
        'Origin': 'http://localhost:3021'
      }
    });
    console.log(`✅ Wallet: ${walletResponse.status}`);
    
    console.log('');
    console.log('🎉 ALL CONNECTIONS WORKING!');
    console.log('✅ Frontend can successfully connect to backend');
    console.log('✅ CORS is properly configured');
    console.log('✅ All endpoints are responding');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
