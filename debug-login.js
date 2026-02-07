// Debug script to test login functionality
import axios from 'axios';

async function testLogin() {
    try {
        console.log('🔐 Testing login with real credentials...');
        
        // Test the exact same request the frontend would make
        const response = await axios.post('http://localhost:4010/api/auth/login', {
            email: 'founder@quickbid.com',
            password: 'QuickBid2026!'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login SUCCESS:', response.data);
        console.log('👤 User:', response.data.user);
        console.log('🔑 Token:', response.data.token.substring(0, 20) + '...');
        
    } catch (error) {
        console.error('❌ Login FAILED:', error.response?.data || error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

// Test the login
testLogin();
