"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const path_1 = require("path");
const app = express();
const PORT = process.env.PORT || 4011;
app.use(cors({
    origin: [
        'http://localhost:3021',
        'http://localhost:3024',
        'http://localhost:3025',
        'http://localhost:3026',
        'http://localhost:3000',
        'http://localhost:5183'
    ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static((0, path_1.join)(__dirname, 'assets')));
const mockUsers = [
    {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        isVerified: true,
    },
    {
        id: '2',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        isVerified: true,
    },
];
const mockProducts = [
    {
        id: '1',
        title: 'Vintage Camera',
        description: 'A beautiful vintage camera from the 1960s',
        startingBid: 1000,
        currentBid: 1500,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        images: ['https://via.placeholder.com/300x200'],
        seller: {
            name: 'John Doe',
            rating: 4.5,
            verified: true,
        },
    },
    {
        id: '2',
        title: 'Classic Watch',
        description: 'Luxury Swiss watch from 1980s',
        startingBid: 5000,
        currentBid: 5500,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        images: ['https://via.placeholder.com/300x200'],
        seller: {
            name: 'Jane Smith',
            rating: 4.8,
            verified: true,
        },
    },
];
const mockAuctions = [
    ...mockProducts,
    {
        id: '3',
        title: 'Rare Painting',
        description: 'Original oil painting from renowned artist',
        startingBid: 10000,
        currentBid: 12000,
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        images: ['https://via.placeholder.com/300x200'],
        seller: {
            name: 'Art Gallery',
            rating: 4.9,
            verified: true,
        },
    },
];
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            res.json({
                message: 'Login successful',
                user,
                token: 'mock-jwt-token-' + Date.now(),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    else {
        res.status(400).json({ message: 'Email and password required' });
    }
});
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    if (email && password && name) {
        const newUser = {
            id: String(mockUsers.length + 1),
            email,
            name,
            role: 'buyer',
            isVerified: false,
        };
        mockUsers.push(newUser);
        res.status(201).json({
            message: 'Registration successful',
            user: newUser,
        });
    }
    else {
        res.status(400).json({ message: 'Email, password, and name required' });
    }
});
app.get('/api/auth/me', (req, res) => {
    res.json({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
    });
});
app.get('/api/products', (req, res) => {
    res.json({
        products: mockProducts,
        total: mockProducts.length,
    });
});
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);
    if (product) {
        res.json(product);
    }
    else {
        res.status(404).json({ message: 'Product not found' });
    }
});
app.get('/api/auctions', (req, res) => {
    res.json({
        auctions: mockAuctions,
        total: mockAuctions.length,
    });
});
app.get('/api/auctions/:id', (req, res) => {
    const { id } = req.params;
    const auction = mockAuctions.find(a => a.id === id);
    if (auction) {
        res.json(auction);
    }
    else {
        res.status(404).json({ message: 'Auction not found' });
    }
});
app.get('/api/users/profile', (req, res) => {
    res.json({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        walletBalance: 5000,
        activeBids: 2,
        wonAuctions: 1,
    });
});
app.post('/api/bids', (req, res) => {
    const { auctionId, userId, amount } = req.body;
    if (!auctionId || !userId || !amount) {
        return res.status(400).json({ message: 'Auction ID, user ID, and amount required' });
    }
    const bid = {
        id: String(Date.now()),
        auctionId,
        userId,
        amount: parseFloat(amount),
        status: 'active',
        createdAt: new Date().toISOString()
    };
    const auction = mockAuctions.find(a => a.id === auctionId);
    if (auction) {
        auction.currentBid = parseFloat(amount);
    }
    res.status(201).json({
        message: 'Bid placed successfully',
        bid
    });
});
app.get('/api/auctions/:id/bids', (req, res) => {
    const { id } = req.params;
    const auction = mockAuctions.find(a => a.id === id);
    if (!auction) {
        return res.status(404).json({ message: 'Auction not found' });
    }
    const bids = [
        {
            id: '1',
            auctionId: id,
            userId: 'user1',
            amount: auction.currentBid,
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
    res.json({ bids });
});
app.get('/api/wallet/balance', (req, res) => {
    res.json({
        balance: 5000,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
    });
});
app.post('/api/wallet/add', (req, res) => {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount required' });
    }
    res.json({
        message: 'Funds added successfully',
        newBalance: 5000 + parseFloat(amount),
        transactionId: 'txn_' + Date.now()
    });
});
app.post('/api/razorpay-create-order', (req, res) => {
    const { amount, currency = 'INR', notes } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount required' });
    }
    res.json({
        order: {
            id: 'order_' + Date.now(),
            amount: amount,
            currency: currency,
            status: 'created'
        },
        key_id: 'rzp_test_Rgj5MPfUNPnjY8'
    });
});
app.post('/api/payments/confirm', (req, res) => {
    const { paymentId, orderId, type } = req.body;
    res.json({
        message: 'Payment confirmed successfully',
        status: 'completed',
        transactionId: 'txn_' + Date.now()
    });
});
app.get('/favicon.ico', (req, res) => {
    res.status(404).send('Not found');
});
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
    });
});
app.listen(PORT, () => {
});
//# sourceMappingURL=server.js.map