import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4010;

// Test accounts
const testAccounts = [
  { email: '123abc@gmail.com', password: 'San@8897', role: 'user' },
  { email: 'arjun@quickmela.com', password: 'BuyerPass123!', role: 'buyer' },
  { email: 'kavya@quickmela.com', password: 'BuyerPass123!', role: 'buyer' },
  { email: 'anita@quickmela.com', password: 'SellerPass123!', role: 'seller' },
  { email: 'suresh@quickmela.com', password: 'SellerPass123!', role: 'seller' },
  { email: 'system@quickmela.com', password: 'AdminPass123!', role: 'admin' },
  { email: 'admin@quickmela.com', password: 'AdminPass123!', role: 'admin' }
];

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Mock backend for login testing' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = testAccounts.find(acc => acc.email === email && acc.password === password);

  if (user) {
    res.json({
      success: true,
      token: 'mock-jwt-token-' + user.role,
      user: {
        id: 'user-' + user.email.split('@')[0],
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Mock user profile endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
    const role = authHeader.replace('Bearer mock-jwt-token-', '');
    res.json({
      id: 'user-mock',
      email: 'test@example.com',
      role: role
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('Available test accounts:');
  testAccounts.forEach(acc => {
    console.log(`- ${acc.email} / ${acc.password} (${acc.role})`);
  });
});
