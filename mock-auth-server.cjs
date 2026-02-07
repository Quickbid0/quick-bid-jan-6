const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4011;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3021', 'http://localhost:3022', 'http://127.0.0.1:3021', 'http://127.0.0.1:3022'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Demo users
const demoUsers = {
  'buyer@quickbid.com': {
    id: 'buyer-123',
    email: 'buyer@quickbid.com',
    name: 'Demo Buyer',
    role: 'BUYER',
    password: 'QuickBid2026!'
  },
  'seller@quickbid.com': {
    id: 'seller-123',
    email: 'seller@quickbid.com',
    name: 'Demo Seller',
    role: 'SELLER',
    password: 'QuickBid2026!'
  },
  'founder@quickbid.com': {
    id: 'admin-123',
    email: 'founder@quickbid.com',
    name: 'Demo Admin',
    role: 'ADMIN',
    password: 'QuickBid2026!'
  }
};

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password: '***' });
  
  const user = demoUsers[email];
  
  if (user && user.password === password) {
    const response = {
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
    
    console.log('Login successful:', { email, role: user.role });
    res.json(response);
  } else {
    console.log('Login failed:', { email });
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Mock OTP endpoint
app.post('/auth/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`OTP for ${email}: ${otp}`);
  res.json({ otp, message: 'OTP sent successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock auth server running on http://localhost:${PORT}`);
  console.log('📝 Demo accounts:');
  console.log('   buyer@quickbid.com / QuickBid2026!');
  console.log('   seller@quickbid.com / QuickBid2026!');
  console.log('   founder@quickbid.com / QuickBid2026!');
});
