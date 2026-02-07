# 🔌 QUICKMELA API DOCUMENTATION

## Base URL
```
Production: https://api.quickmela.com
Staging: https://api-staging.quickmela.com
Development: http://localhost:4011
```

## Authentication

### JWT Token Authentication
All API requests require authentication except public endpoints. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "buyer",
    "walletBalance": 10000,
    "kycStatus": "verified"
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "buyer"
}
```

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

## Products

### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `location`: Location search
- `search`: Text search

**Response:**
```json
{
  "products": [
    {
      "id": "1",
      "title": "2020 Toyota Camry",
      "description": "Excellent condition sedan",
      "startingPrice": 800000,
      "currentPrice": 850000,
      "buyNowPrice": 900000,
      "endTime": "2024-02-15T10:00:00Z",
      "images": ["url1.jpg", "url2.jpg"],
      "category": "sedan",
      "fuelType": "petrol",
      "transmission": "automatic",
      "year": 2020,
      "mileage": 25000,
      "location": "Mumbai, Maharashtra",
      "seller": {
        "name": "Auto Dealer",
        "rating": 4.5
      },
      "bidCount": 5,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Product by ID
```http
GET /api/products/{id}
```

### Create Product (Seller Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "2020 Honda City",
  "description": "Well maintained sedan",
  "category": "sedan",
  "startingPrice": 600000,
  "buyNowPrice": 650000,
  "endTime": "2024-02-20T15:00:00Z",
  "images": ["image1.jpg", "image2.jpg"],
  "fuelType": "petrol",
  "transmission": "manual",
  "year": 2020,
  "mileage": 30000,
  "location": "Delhi, India"
}
```

### Bulk Create Products (Enterprise Only)
```http
POST /api/products/bulk-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Commercial Vehicles",
  "description": "Fleet of commercial vehicles",
  "category": "commercial",
  "startingPrice": 1500000,
  "buyNowPrice": 1600000,
  "quantity": 5,
  "condition": "excellent",
  "fuelType": "diesel",
  "transmission": "manual",
  "year": 2022,
  "mileage": 10000
}
```

### Get My Products (Seller Only)
```http
GET /api/products/my-products
Authorization: Bearer <token>
```

## Bidding

### Place Bid
```http
POST /api/products/{productId}/bid
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 900000,
  "isAutoBid": false,
  "maxAutoBidAmount": 950000
}
```

### Get Bid History
```http
GET /api/products/{productId}/bids
```

### Get My Bids
```http
GET /api/bids/my-bids
Authorization: Bearer <token>
```

## Wallet & Payments

### Get Wallet Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "balance": 50000,
  "currency": "INR",
  "transactions": [
    {
      "id": "1",
      "type": "credit",
      "amount": 10000,
      "description": "Wallet top-up",
      "createdAt": "2024-02-01T10:00:00Z"
    }
  ]
}
```

### Add Wallet Funds
```http
POST /api/wallet/add-funds
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "currency": "INR"
}
```

### Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "currency": "INR",
  "productId": "123"
}
```

**Response:**
```json
{
  "orderId": "order_xyz123",
  "amount": 50000,
  "currency": "INR",
  "razorpayOrderId": "rzp_order_xyz123",
  "key": "rzp_live_xyz123"
}
```

### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayOrderId": "rzp_order_xyz123",
  "razorpayPaymentId": "pay_xyz123",
  "razorpaySignature": "signature_xyz123"
}
```

## KYC Verification

### Submit Aadhaar Verification
```http
POST /api/kyc/aadhaar-verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "aadhaarNumber": "123456789012",
  "name": "John Doe",
  "dob": "1990-01-01"
}
```

### Submit PAN Verification
```http
POST /api/kyc/pan-verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "panNumber": "ABCDE1234F",
  "name": "John Doe",
  "dob": "1990-01-01"
}
```

### Get KYC Status
```http
GET /api/kyc/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "aadhaarVerified": true,
  "panVerified": true,
  "faceVerified": false,
  "overallStatus": "pending",
  "documents": [
    {
      "type": "aadhaar",
      "status": "verified",
      "submittedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Enterprise Features

### Company Registration
```http
POST /api/company/register
Content-Type: application/json

{
  "companyName": "ABC Motors Ltd",
  "email": "contact@abcmotors.com",
  "phone": "9876543210",
  "gstin": "GSTIN1234567890",
  "pan": "PANABCDE1234F",
  "businessType": "Authorized Dealer",
  "subscriptionTier": "Premium"
}
```

### Bulk User Registration
```http
POST /api/company/bulk-register
Authorization: Bearer <company_admin_token>
Content-Type: application/json

{
  "companyName": "ABC Motors Ltd",
  "contactEmail": "hr@abcmotors.com",
  "users": [
    {
      "name": "Rajesh Kumar",
      "email": "rajesh@abcmotors.com",
      "role": "manager",
      "phone": "9876543211"
    },
    {
      "name": "Priya Singh",
      "email": "priya@abcmotors.com",
      "role": "sales",
      "phone": "9876543212"
    }
  ]
}
```

### Company Dashboard
```http
GET /api/company/dashboard
Authorization: Bearer <company_token>
```

**Response:**
```json
{
  "company": {
    "name": "ABC Motors Ltd",
    "subscriptionTier": "Premium",
    "usersCount": 15,
    "activeListings": 25,
    "totalRevenue": 2500000
  },
  "analytics": {
    "monthlyRevenue": 500000,
    "activeBids": 12,
    "conversionRate": 85,
    "topVehicles": [...]
  }
}
```

### Company Analytics
```http
GET /api/company/analytics
Authorization: Bearer <company_token>
```

## Admin Features

### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin_token>
```

### Update User Status
```http
PUT /api/auth/users/{userId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "active"
}
```

### Get Platform Statistics
```http
GET /api/admin/statistics
Authorization: Bearer <admin_token>
```

## Notifications

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `unreadOnly`: Show only unread notifications

### Mark as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer <token>
```

### Bulk Mark as Read
```http
PUT /api/notifications/bulk-read
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificationIds": ["1", "2", "3"]
}
```

## Watchlist

### Add to Watchlist
```http
POST /api/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "123"
}
```

### Get Watchlist
```http
GET /api/watchlist
Authorization: Bearer <token>
```

### Remove from Watchlist
```http
DELETE /api/watchlist/{productId}
Authorization: Bearer <token>
```

## Error Responses

All API endpoints return standard HTTP status codes:

### 200 OK - Success
### 201 Created - Resource created
### 400 Bad Request - Invalid request data
### 401 Unauthorized - Authentication required
### 403 Forbidden - Insufficient permissions
### 404 Not Found - Resource not found
### 422 Unprocessable Entity - Validation errors
### 429 Too Many Requests - Rate limit exceeded
### 500 Internal Server Error - Server error

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field error"
  }
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Payment Webhooks
Configure webhook endpoint for payment notifications:

```http
POST /api/webhooks/razorpay
X-Razorpay-Signature: signature_here
Content-Type: application/json

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_xyz123",
      "amount": 50000,
      "currency": "INR",
      "status": "captured"
    }
  }
}
```

## SDKs & Libraries

### JavaScript SDK
```javascript
import { QuickMelaAPI } from 'quickmela-sdk';

const api = new QuickMelaAPI({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.quickmela.com'
});

// Login
const { user, tokens } = await api.auth.login('email@example.com', 'password');

// Get products
const products = await api.products.list({ category: 'sedan' });

// Place bid
await api.bids.place(productId, 1000000);
```

### Mobile SDKs
- **React Native**: `npm install quickmela-react-native`
- **Flutter**: `flutter pub add quickmela_flutter`
- **iOS**: Available via CocoaPods
- **Android**: Available via Maven

## Testing

### Sandbox Environment
Use our sandbox environment for testing:
```
Base URL: https://api-sandbox.quickmela.com
Test Cards: Use Razorpay test cards
Test OTP: 123456
```

### Test Data
```javascript
// Test user credentials
const testUsers = {
  buyer: { email: 'buyer@test.com', password: 'TestPass123!' },
  seller: { email: 'seller@test.com', password: 'TestPass123!' },
  admin: { email: 'admin@test.com', password: 'TestPass123!' }
};
```

## Support

### Developer Portal
- **Documentation**: https://developers.quickmela.com
- **API Explorer**: Interactive API testing
- **Code Samples**: SDK examples and snippets
- **Community Forum**: Developer discussions

### Getting Help
- **Email**: developers@quickmela.com
- **Slack**: Join our developer community
- **GitHub**: Report issues and contribute
- **Status Page**: Real-time API status

---

## 📊 API Performance

### Response Times
- **Authentication**: <200ms
- **Product Listing**: <300ms
- **Bid Placement**: <150ms
- **Payment Processing**: <500ms

### Uptime SLA
- **Production**: 99.9% uptime
- **Sandbox**: 99.5% uptime
- **Maintenance**: Scheduled weekly maintenance windows

### Rate Limits
- **Free Tier**: 1000 requests/hour
- **Basic Plan**: 10000 requests/hour
- **Premium Plan**: 100000 requests/hour
- **Enterprise**: Custom limits

---

*This documentation is regularly updated. Check https://developers.quickmela.com for the latest version.*
