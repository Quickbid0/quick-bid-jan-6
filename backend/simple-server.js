const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = 4011;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Mock users database
const users = [
  {
    id: '1',
    email: 'founder@quickbid.com',
    password: 'QuickBid2026!',
    name: 'QuickBid Founder',
    role: 'ADMIN'
  },
  {
    id: '2',
    email: 'seller@quickbid.com',
    password: 'QuickBid2026!',
    name: 'Test Seller',
    role: 'SELLER'
  },
  {
    id: '3',
    email: 'buyer@quickbid.com',
    password: 'QuickBid2026!',
    name: 'Test Buyer',
    role: 'BUYER'
  }
];

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Login endpoint
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`Login attempt: ${email}`);
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const accessToken = 'mock-jwt-token-' + Math.random().toString(36).substring(7);
    const refreshToken = 'mock-refresh-token-' + Math.random().toString(36).substring(7);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: true
      },
      accessToken,
      refreshToken
    });
    
    console.log(`✅ Login successful: ${user.name} (${user.role})`);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
    console.log(`❌ Login failed: ${email}`);
  }
});

// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, address, pincode, password, role } = req.body;
  
  console.log(`Registration attempt: ${email}, role: ${role}`);
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    email,
    password,
    name: name || email.split('@')[0],
    role: role ? role.toUpperCase() : 'BUYER',
    phone: phone || '',
    address: address || '',
    pincode: pincode || ''
  };
  
  users.push(newUser);
  
  console.log(`New user created: ${email}, role: ${newUser.role}`);
  
  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role.toLowerCase()
    }
  });
});

// API login endpoint (for compatibility with frontend)
app.post('/api/auth/login', (req, res) => {
  // Redirect to the main login endpoint
  req.url = '/auth/login';
  app._router.handle(req, res);
});

// API logout endpoint
app.post('/api/auth/logout', (req, res) => {
  console.log('🔐 API Logout request received');
  res.json({ message: 'Logged out successfully' });
});

// Direct logout endpoint
app.post('/auth/logout', (req, res) => {
  console.log('🔐 Direct Logout request received');
  res.json({ message: 'Logged out successfully' });
});

// Send OTP endpoint
app.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  const otp = generateOTP();
  
  try {
    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'QuickBid - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">QuickBid OTP Verification</h2>
          <p>Use the OTP code below to complete your verification:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <div style="background: #007bff; color: white; font-size: 32px; font-weight: bold; 
                        padding: 20px; border-radius: 6px; letter-spacing: 4px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 10 minutes. For security reasons, do not share this code with anyone.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    
    res.json({
      message: 'OTP sent successfully',
      otp: otp // Return OTP for development
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify email endpoint
app.post('/auth/verify-email', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  // For demo, accept any 6-digit token
  if (token.length === 6 && /^\d+$/.test(token)) {
    console.log(`✅ Email verified with token: ${token}`);
    res.json({ message: 'Email verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// Products endpoint
app.get('/products', (req, res) => {
  const products = [
    {
      id: 1,
      title: 'Vintage Watch Collection',
      description: 'A beautiful collection of vintage watches from the 1960s',
      startingPrice: 10000,
      currentBid: 15000,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/watch1/400/300.jpg'],
      category: 'Watches',
      condition: 'Excellent',
      seller: {
        id: 'seller1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      highestBid: {
        amount: 15000,
        bidder: { id: 'bidder1', name: 'Jane Smith' }
      },
      bidCount: 5,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: 'Rare Book Collection',
      description: 'First edition books from renowned authors',
      startingPrice: 5000,
      currentBid: 7500,
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/books1/400/300.jpg'],
      category: 'Books',
      condition: 'Good',
      seller: {
        id: 'seller2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      highestBid: {
        amount: 7500,
        bidder: { id: 'bidder2', name: 'Bob Johnson' }
      },
      bidCount: 3,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      title: 'Antique Furniture Set',
      description: 'Beautiful Victorian era furniture set',
      startingPrice: 25000,
      currentBid: 30000,
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/furniture1/400/300.jpg'],
      category: 'Furniture',
      condition: 'Very Good',
      seller: {
        id: 'seller3',
        name: 'Bob Johnson',
        email: 'bob@example.com'
      },
      highestBid: {
        amount: 30000,
        bidder: { id: 'bidder3', name: 'Alice Brown' }
      },
      bidCount: 8,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  res.json(products);
});

// Product by ID endpoint
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const products = [
    {
      id: 1,
      title: 'Vintage Watch Collection',
      description: 'A beautiful collection of vintage watches from the 1960s',
      startingPrice: 10000,
      currentBid: 15000,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/watch1/400/300.jpg'],
      category: 'Watches',
      condition: 'Excellent',
      seller: {
        id: 'seller1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      highestBid: {
        amount: 15000,
        bidder: { id: 'bidder1', name: 'Jane Smith' }
      },
      bidCount: 5,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: 'Rare Book Collection',
      description: 'First edition books from renowned authors',
      startingPrice: 5000,
      currentBid: 7500,
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/books1/400/300.jpg'],
      category: 'Books',
      condition: 'Good',
      seller: {
        id: 'seller2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      highestBid: {
        amount: 7500,
        bidder: { id: 'bidder2', name: 'Bob Johnson' }
      },
      bidCount: 3,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      title: 'Antique Furniture Set',
      description: 'Beautiful Victorian era furniture set',
      startingPrice: 25000,
      currentBid: 30000,
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/furniture1/400/300.jpg'],
      category: 'Furniture',
      condition: 'Very Good',
      seller: {
        id: 'seller3',
        name: 'Bob Johnson',
        email: 'bob@example.com'
      },
      highestBid: {
        amount: 30000,
        bidder: { id: 'bidder3', name: 'Alice Brown' }
      },
      bidCount: 8,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const product = products.find(p => p.id === productId);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'QuickBid Backend API is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QuickBid Backend Server running on http://localhost:${PORT}`);
  console.log(`📧 Email service configured: ${process.env.SMTP_USER}`);
  console.log(`🔐 Demo users ready for testing`);
  console.log(`🛍️  Products API ready`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /auth/login - User login');
  console.log('  POST /auth/send-otp - Send OTP');
  console.log('  POST /auth/verify-email - Verify email');
  console.log('  GET /products - Get products');
  console.log('  GET /health - Health check');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Admin: founder@quickbid.com / QuickBid2026!');
  console.log('  Seller: seller@quickbid.com / QuickBid2026!');
  console.log('  Buyer: buyer@quickbid.com / QuickBid2026!');
});
