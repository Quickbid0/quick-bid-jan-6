# QUICKMELA USER GUIDE & DOCUMENTATION
# ===================================

## Welcome to QuickMela! 🚗💰

QuickMela is India's most trusted vehicle auction platform, bringing transparency and fairness to vehicle auctions. Whether you're buying your dream car or selling your vehicle, QuickMela provides a secure, real-time auction experience.

---

## 🚀 QUICK START GUIDE

### For New Users
1. **Sign Up**: Visit [quickmela.com](https://quickmela.com) and click "Register"
2. **Complete KYC**: Upload your ID documents for verification
3. **Add Funds**: Top up your wallet securely via Razorpay
4. **Start Bidding**: Browse live auctions and place your bids!

### For Sellers
1. **Register as Seller**: Choose "Seller" during registration
2. **List Your Vehicle**: Upload photos and vehicle details
3. **Set Auction Parameters**: Choose start price, duration, and reserve price
4. **Monitor & Manage**: Track bids and manage your auctions

---

## 📱 USER ROLES & FEATURES

### 👤 BUYER FEATURES
- **Browse Auctions**: Filter by vehicle type, price, location
- **Real-time Bidding**: Place bids with live updates
- **Watchlist**: Save auctions for later
- **Bid History**: Track all your bids and wins
- **Wallet Management**: Secure fund management
- **Purchase Protection**: Buyer guarantee program

### 🏪 SELLER FEATURES
- **Vehicle Listing**: Professional listing with photo uploads
- **Auction Management**: Control auction duration and parameters
- **Bid Monitoring**: Real-time bid tracking
- **Seller Dashboard**: Analytics and performance metrics
- **Bulk Upload**: Upload multiple vehicles at once
- **Seller Verification**: Build trust with buyer ratings

### 👑 ADMIN FEATURES
- **User Management**: Approve sellers and manage users
- **Auction Oversight**: Monitor all active auctions
- **Fraud Detection**: AI-powered suspicious activity detection
- **Payment Processing**: Oversee all transactions
- **System Analytics**: Comprehensive platform metrics
- **Content Moderation**: Review listings and user content

---

## 💰 HOW BIDDING WORKS

### Understanding Auction Types

#### ⏰ **Timed Auctions**
- Fixed duration (e.g., 24 hours)
- Last-minute bidding extends time
- Winner pays final bid amount

#### 📝 **Tender Auctions**
- Sealed bid system
- All bids submitted privately
- Highest bid wins at fixed time

#### 🎯 **Live Auctions**
- Real-time bidding with auctioneer
- Immediate bid acceptance
- Live video streaming

### Bidding Rules
1. **Minimum Bid Increment**: ₹100 or 5% of current bid (whichever is higher)
2. **Bid Retraction**: Not allowed once placed
3. **Reserve Price**: Hidden minimum price set by seller
4. **Buy Now**: Instant purchase at seller's set price
5. **Auto-bidding**: Set maximum bid for automatic bidding

### Winning an Auction
1. **Receive Notification**: Instant notification of win
2. **Payment Due**: 24 hours to complete payment
3. **Inspection**: Optional vehicle inspection booking
4. **Delivery**: Arrange pickup or delivery
5. **Ownership Transfer**: Complete paperwork and transfer

---

## 💳 PAYMENT & WALLET SYSTEM

### Wallet Management
- **Secure Storage**: Funds stored securely in your wallet
- **Instant Transfers**: Quick deposits and withdrawals
- **Transaction History**: Complete transaction records
- **Auto-reload**: Set up automatic wallet top-ups

### Payment Methods
- **Razorpay Integration**: Secure payment gateway
- **Multiple Options**: Cards, UPI, Net Banking, Wallets
- **Instant Processing**: Real-time payment confirmation
- **Refund Protection**: Automatic refunds for failed auctions

### Transaction Fees
- **Buyer Fees**: No bidding fees, only final purchase
- **Seller Fees**: 5% commission on successful sales
- **Platform Fees**: Transparent fee structure
- **Payment Protection**: Buyer and seller protection guarantee

---

## 🔒 SECURITY & TRUST

### Account Security
- **Two-Factor Authentication**: Optional 2FA setup
- **Secure Login**: Encrypted authentication
- **Session Management**: Automatic logout for security
- **Password Policies**: Strong password requirements

### KYC Verification
- **Required Documents**: Aadhaar, PAN, Bank details
- **Face Verification**: AI-powered identity matching
- **Document Validation**: Automated verification process
- **Trust Badges**: Verified seller/buyer indicators

### Fraud Protection
- **AI Detection**: Machine learning fraud detection
- **Bid Monitoring**: Suspicious activity alerts
- **Payment Security**: Encrypted transaction processing
- **Dispute Resolution**: 24/7 support for issues

---

## 📊 SELLER ANALYTICS

### Performance Metrics
- **Auction Success Rate**: Percentage of auctions ending in sales
- **Average Sale Price**: Your vehicles' average selling price
- **Bid Activity**: Number of bids per auction
- **Viewer Engagement**: Auction page views and engagement

### Optimization Tips
- **Professional Photos**: High-quality, multiple-angle photos
- **Detailed Descriptions**: Complete vehicle history and specs
- **Competitive Pricing**: Research similar vehicle prices
- **Timing**: Schedule auctions during peak hours

---

## 🛠️ TROUBLESHOOTING

### Common Issues

#### Can't Place Bids
- **Check Wallet Balance**: Ensure sufficient funds
- **Verify Account**: Complete KYC verification
- **Auction Status**: Confirm auction is still active

#### Payment Issues
- **Retry Payment**: Try alternative payment methods
- **Contact Support**: 24/7 support available
- **Refund Process**: Automatic refunds for failed payments

#### Account Issues
- **Password Reset**: Use "Forgot Password" feature
- **Email Verification**: Check spam folder
- **Browser Issues**: Try different browser or incognito mode

### Contact Support
- **Email**: support@quickmela.com
- **Phone**: +91-XXXX-XXXXXX (24/7)
- **Live Chat**: Available on website
- **Response Time**: <2 hours for urgent issues

---

## 📋 API DOCUMENTATION

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "9876543210",
  "role": "buyer"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "kycStatus": "pending"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Authenticate user login.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST /api/auth/send-otp
Send OTP for phone verification.

#### POST /api/auth/verify-otp
Verify OTP code.

### Auction Endpoints

#### GET /api/products
Get all active auctions.

**Query Parameters:**
- `category`: Filter by vehicle type
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `location`: Location filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "auction_123",
      "title": "Toyota Camry 2020",
      "currentBid": 850000,
      "endTime": "2024-02-10T10:00:00Z",
      "seller": {
        "name": "Authorized Dealer",
        "rating": 4.8
      },
      "images": ["url1.jpg", "url2.jpg"],
      "status": "active"
    }
  ]
}
```

#### POST /api/bids
Place a bid on an auction.

**Request Body:**
```json
{
  "auctionId": "auction_123",
  "amount": 860000
}
```

#### GET /api/auctions/:id/bids
Get bid history for an auction.

### Wallet Endpoints

#### GET /api/wallet/balance
Get user's wallet balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "availableBalance": 50000,
    "heldBalance": 10000,
    "totalBalance": 60000,
    "currency": "INR"
  }
}
```

#### POST /api/wallet/add
Add funds to wallet.

**Request Body:**
```json
{
  "amount": 10000,
  "paymentMethod": "razorpay"
}
```

#### GET /api/wallet/transactions
Get transaction history.

### KYC Endpoints

#### POST /api/kyc/aadhaar-verify
Submit Aadhaar verification.

#### POST /api/kyc/pan-verify
Submit PAN verification.

#### POST /api/kyc/face-verify
Upload face photo for verification.

### Admin Endpoints

#### GET /admin/users
Get all users (Admin only).

#### POST /admin/users/:id/status
Update user status (Admin only).

#### GET /admin/auctions
Get all auctions (Admin only).

---

## 📞 SUPPORT & HELP

### Help Resources
- **FAQ Section**: Comprehensive answers to common questions
- **Video Tutorials**: Step-by-step guides for all features
- **User Community**: Connect with other users
- **Blog**: Tips and best practices

### Premium Support
- **Priority Support**: Faster response times
- **Dedicated Manager**: Personal account manager
- **Advanced Features**: Early access to new features
- **Custom Solutions**: Tailored solutions for high-volume users

---

## 📈 PLATFORM STATISTICS

- **Active Users**: 50,000+
- **Vehicles Sold**: 25,000+
- **Total Value**: ₹500 crores+
- **Success Rate**: 98%
- **Average Response Time**: <2 seconds
- **Mobile Users**: 75%

---

## 🎯 FUTURE ROADMAP

### Coming Soon
- **AI Price Prediction**: Smart pricing recommendations
- **Virtual Inspections**: 360° vehicle viewing
- **Financing Options**: In-platform loan approvals
- **Delivery Tracking**: Real-time delivery updates
- **Seller Subscriptions**: Premium seller features

### Mobile App
- **iOS & Android Apps**: Native mobile experience
- **Push Notifications**: Instant auction alerts
- **Offline Bidding**: Queue bids for online submission
- **AR Vehicle Viewing**: Augmented reality inspections

---

## 📜 LEGAL & COMPLIANCE

### Terms of Service
- User agreements and responsibilities
- Platform usage guidelines
- Dispute resolution process

### Privacy Policy
- Data collection and usage
- Security measures
- User rights and controls

### Refund Policy
- Automatic refunds for failed auctions
- Buyer protection guarantee
- Seller payment assurance

---

Thank you for choosing QuickMela! We're committed to providing the best vehicle auction experience in India.

**Happy Bidding! 🚗💨**
