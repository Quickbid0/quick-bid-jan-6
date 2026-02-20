# 🗄️ BACKEND API SPECIFICATION

**Status**: Complete specification for backend implementation  
**Language**: API specs (JSON/REST)  
**Implementation**: For backend team

---

## 📋 OVERVIEW

This document specifies all API endpoints required for the redesigned dashboards to work with real data.

### Base URL
```
Development:  http://localhost:3001/api
Staging:      https://api-staging.quickbid.com/api
Production:   https://api.quickbid.com/api
```

### API Prefix
All endpoints are prefixed with `/api`

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {JWT_TOKEN}
```

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "error": null,
  "timestamp": "2026-02-20T10:30:00Z"
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### Rate Limiting
```
Rate: 1000 requests/hour per user
Headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 999
  X-RateLimit-Reset: 1645346400
```

---

## 👤 BUYER ENDPOINTS

### GET /buyers/{userId}/dashboard
**Purpose**: Fetch complete buyer dashboard data  
**Authentication**: Required  
**Rate Limit**: 100 requests/hour

**Request**
```http
GET /api/buyers/user-123/dashboard HTTP/1.1
Authorization: Bearer {token}
```

**Query Parameters**
```
None
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "walletBalance": 50000,
      "avatarUrl": "https://...",
      "verificationLevel": "verified"
    },
    "activeBids": [
      {
        "id": "bid-456",
        "auctionId": "auction-789",
        "title": "Vintage Rolex Watch",
        "description": "Classic mechanical watch",
        "currentBid": 15000,
        "yourBid": 18000,
        "minimumBid": 16000,
        "status": "winning" | "outbid" | "leading",
        "timeRemaining": "2 days 4 hours",
        "endsAt": "2026-02-22T10:30:00Z",
        "sellerName": "Seller Name",
        "sellerRating": 4.8,
        "sellerResponseTime": 120,
        "image": "https://cdn.quickbid.com/auction-123-1.jpg",
        "category": "watches",
        "condition": "excellent",
        "participantCount": 24,
        "bidsCount": 45
      }
    ],
    "wonAuctions": [
      {
        "id": "won-111",
        "auctionId": "auction-222",
        "title": "iPhone 14 Pro",
        "winAmount": 45000,
        "winDate": "2026-02-18T08:00:00Z",
        "paymentStatus": "pending" | "paid" | "refunded",
        "deliveryStatus": "not_yet_shipped" | "in_transit" | "delivered" | "returned",
        "estimatedDelivery": "2026-02-25T00:00:00Z",
        "trackingNumber": "DHL123456789",
        "sellerName": "Tech Store",
        "image": "https://cdn.quickbid.com/won-123-1.jpg",
        "actions": ["pay", "track", "return"]
      }
    ],
    "stats": {
      "activeCount": 12,
      "wonCount": 48,
      "lostCount": 120,
      "totalSpent": 250000,
      "winRate": 28.5,
      "averageSpend": 5208.33
    },
    "recommendations": [
      {
        "id": "rec-333",
        "auctionId": "auction-444",
        "title": "Sony WH-1000XM4 Headphones",
        "image": "https://cdn.quickbid.com/rec-333-1.jpg",
        "price": "25000 - 35000",
        "confidence": 0.92,
        "reason": "Based on your interest in electronics",
        "category": "electronics",
        "endsIn": "3 hours",
        "currentBidCount": 12
      }
    ],
    "spending": {
      "thisWeek": 125000,
      "thisMonth": 450000,
      "thisYear": 2500000,
      "chartData": [
        {
          "day": "Mon",
          "amount": 15000,
          "bidsCount": 8
        },
        {
          "day": "Tue",
          "amount": 22000,
          "bidsCount": 12
        },
        // ... 5 more days
      ]
    }
  },
  "timestamp": "2026-02-20T10:30:00Z"
}
```

**Error Cases**
```
401 Unauthorized -> Not authenticated
404 Not Found -> User doesn't exist
429 Too Many Requests -> Rate limit exceeded
500 Internal Server Error -> Server error
```

---

## 🏪 SELLER ENDPOINTS

### GET /sellers/{userId}/dashboard
**Purpose**: Fetch complete seller dashboard data  
**Authentication**: Required  
**Rate Limit**: 100 requests/hour

**Request**
```http
GET /api/sellers/seller-123/dashboard HTTP/1.1
Authorization: Bearer {token}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "seller": {
      "id": "seller-123",
      "shopName": "TechGear Store",
      "shopUrl": "https://quickbid.com/shop/techgear",
      "rating": 4.85,
      "totalReviews": 2341,
      "responseTime": 45,
      "responseRate": 99.2,
      "totalSales": 50000,
      "joinDate": "2020-01-15",
      "goldBadge": true,
      "silverBadge": false,
      "verificationStatus": "verified",
      "storeBanner": "https://cdn.quickbid.com/seller-banner-123.jpg"
    },
    "analytics": {
      "monthlyRevenue": 450000,
      "rating": 4.85,
      "responseTime": 45,
      "activeListings": 87,
      "newOrders": 23,
      "pendingShipments": 5,
      "draftListings": 12,
      "soldThisMonth": 156,
      "viewsThisMonth": 12450,
      "conversionRate": 1.25
    },
    "products": [
      {
        "id": "prod-555",
        "name": "Wireless Keyboard",
        "sku": "WIRELESS-KB-001",
        "status": "active" | "draft" | "archived" | "sold",
        "price": 2500,
        "startingBid": 2500,
        "currentBid": 3200,
        "category": "Electronics > Accessories",
        "condition": "new",
        "images": ["https://...", "https://..."],
        "views": 245,
        "bids": 8,
        "endDate": "2026-02-25T18:00:00Z",
        "createdDate": "2026-02-10T10:00:00Z",
        "listingDuration": "8 days",
        "soldDate": null,
        "soldAmount": null
      }
    ],
    "liveAuctions": [
      {
        "id": "auction-666",
        "productName": "Gaming Mouse",
        "currentBid": 3500,
        "bids": 12,
        "views": 3421,
        "timeRemaining": "5 hours 30 minutes",
        "endsAt": "2026-02-20T15:30:00Z",
        "image": "https://...",
        "highBidderName": "Buyer Name",
        "participantCount": 45
      }
    ],
    "feedback": [
      {
        "id": "feedback-777",
        "rating": 5,
        "comment": "Great seller! Fast shipping!",
        "customerName": "Anonymous",
        "productName": "Keyboard",
        "date": "2026-02-15T10:00:00Z",
        "verified": true,
        "helpfulCount": 12
      }
    ],
    "performance": {
      "chartData": [
        {
          "day": "Mon",
          "revenue": 45000,
          "orders": 12,
          "views": 850
        }
        // 7 days total
      ],
      "performanceScore": 9.2,
      "scoreHistory": [ /* 30-day scores */ ]
    }
  },
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### POST /sellers/{userId}/products
**Purpose**: Create new product listing  
**Authentication**: Required  
**Rate Limit**: 50 requests/hour

**Request**
```json
POST /api/sellers/seller-123/products HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Wireless Keyboard",
  "description": "High quality wireless keyboard with 2-year battery life",
  "sku": "KB-WIRELESS-001",
  "category": "Electronics > Accessories",
  "condition": "new",
  "startingBid": 2500,
  "reservePrice": 2000,
  "durations": "8 days",
  "quantity": 1,
  "tags": ["wireless", "keyboard", "office"],
  "images": [
    {
      "url": "https://cdn.quickbid.com/upload-id-1.jpg",
      "position": 1
    }
  ],
  "shipping": {
    "shipper": "DHL",
    "cost": 200,
    "freeShippingThreshold": 5000,
    "estimatedDays": 5
  },
  "returns": {
    "allowed": true,
    "days": 30,
    "cost": "seller"
  }
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "auctionId": "auction-456",
    "status": "draft",
    "url": "https://quickbid.com/auction/auction-456",
    "createdAt": "2026-02-20T10:30:00Z"
  }
}
```

---

## 🚗 DEALER ENDPOINTS

### GET /dealers/{userId}/dashboard
**Purpose**: Fetch complete dealer dashboard data  
**Authentication**: Required  
**Rate Limit**: 100 requests/hour

**Response Format**
```json
{
  "success": true,
  "data": {
    "dealer": {
      "id": "dealer-123",
      "companyName": "Premium Auto Auctions",
      "location": "Mumbai, India",
      "dealerLicense": "DL-2024-001",
      "rating": 4.7,
      "reviewsCount": 1245,
      "vehicleCount": 342,
      "monthlyRevenue": 2500000,
      "conversionRate": 65.5,
      "totalVehiclesSold": 5420,
      "memberSince": "2015-01-01"
    },
    "inventory": {
      "totalVehicles": 342,
      "activeAuctions": 45,
      "soldThisMonth": 32,
      "pendingApproval": 3,
      "approvalRate": 99.2,
      "averageTimeToSell": 5.2
    },
    "vehicles": [
      {
        "id": "vehicle-123",
        "year": 2023,
        "make": "Honda",
        "model": "CR-V",
        "trim": "EX-L",
        "mileage": 15250,
        "color": "Pearl White",
        "transmission": "Automatic",
        "fuelType": "Petrol",
        "exterior": "Excellent",
        "interior": "Excellent",
        "serviceRecords": true,
        "price": 2800000,
        "location": "Mumbai",
        "auctionId": "auction-789",
        "bids": 8,
        "status": "active" | "sold" | "pending",
        "photos": [
          "https://cdn.quickbid.com/vehicle-123-exterior.jpg",
          "https://cdn.quickbid.com/vehicle-123-interior.jpg"
        ],
        "category": "SUV",
        "features": [
          "Sunroof",
          "Leather Seats",
          "Navigation System",
          "Backup Camera"
        ],
        "inspection": {
          "date": "2026-02-15T10:00:00Z",
          "passed": true,
          "notes": "All systems operational"
        },
        "history": {
          "owners": 2,
          "accidents": 0,
          "title": "Clean"
        }
      }
    ],
    "commissions": {
      "pending": 125000,
      "pendingCount": 5,
      "paid": 2500000,
      "paidCount": 128,
      "paymentsThisMonth": 5,
      "lastPaymentDate": "2026-02-10T10:00:00Z",
      "nextPaymentDate": "2026-03-10T10:00:00Z",
      "rate": 8,
      "chartData": [
        {
          "month": "Jan",
          "amount": 200000
        }
        // 6 months
      ]
    },
    "categoryPerformance": [
      {
        "category": "Sedan",
        "views": 4520,
        "conversions": 45,
        "revenue": 450000,
        "conversionRate": 9.95,
        "avgPrice": 10000000,
        "topModel": "Honda Accord"
      },
      {
        "category": "SUV",
        "views": 5820,
        "conversions": 68,
        "revenue": 680000,
        "conversionRate": 11.68,
        "avgPrice": 10000000,
        "topModel": "Honda CR-V"
      }
    ]
  }
}
```

### POST /dealers/{userId}/vehicles
**Purpose**: Add new vehicle to inventory  
**Authentication**: Required

**Request**
```json
POST /api/dealers/dealer-123/vehicles HTTP/1.1
Authorization: Bearer {token}

{
  "year": 2023,
  "make": "Honda",
  "model": "Accord",
  "trim": "EX",
  "mileage": 25000,
  "color": "Silver",
  "transmission": "Automatic",
  "fuelType": "Petrol",
  "price": 2500000,
  "location": "Mumbai",
  "category": "Sedan",
  "exterior": "Excellent",
  "interior": "Excellent",
  "features": ["Sunroof", "Navigation"],
  "photos": ["https://..."],
  "inspection": {
    "passed": true,
    "notes": "Perfect condition"
  },
  "history": {
    "owners": 2,
    "accidents": 0,
    "title": "Clean"
  }
}
```

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "vehicle-456",
    "status": "pending_approval"
  }
}
```

---

## 👨‍💼 ADMIN ENDPOINTS

### GET /admin/{adminId}/dashboard
**Purpose**: Fetch complete admin dashboard data  
**Authentication**: Required (Admin role)  
**Rate Limit**: 200 requests/hour

**Response Format**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-123",
        "type": "dispute" | "fraud" | "compliance",
        "severity": "critical" | "high" | "medium" | "low",
        "title": "High-value dispute filed",
        "description": "User XYZ filed dispute for ₹500,000 transaction",
        "amount": 500000,
        "buyerId": "buyer-123",
        "sellerId": "seller-456",
        "auctionId": "auction-789",
        "timestamp": "2026-02-20T10:25:00Z",
        "action": "Review Dispute",
        "priority": 1,
        "metadata": {
          "previousDisputes": 0,
          "sellerRating": 4.8
        }
      }
    ],
    "systemHealth": {
      "apiStatus": "healthy" | "degraded" | "down",
      "dbStatus": "healthy" | "degraded" | "down",
      "paymentStatus": "healthy" | "degraded" | "down",
      "storageStatus": "healthy" | "degraded" | "down",
      "lastChecked": "2026-02-20T10:29:00Z",
      "uptime": 99.97,
      "averageResponseTime": 145,
      "errorRate": 0.02
    },
    "businessMetrics": {
      "gmvToday": 25000000,
      "gmvYesterday": 23500000,
      "gmvTrend": 6.4,
      "activeAuctions": 2345,
      "completedToday": 567,
      "completedYesterday": 542,
      "completionTrend": 4.6,
      "totalUsers": 125450,
      "newUsersToday": 234,
      "activeUserCount": 8923,
      "chartData": [
        {
          "time": "00:00",
          "gmv": 500000,
          "auctions": 45
        }
        // 24 hours
      ]
    },
    "pendingApprovals": [
      {
        "id": "approval-123",
        "type": "seller_signup" | "product_listing" | "store_verification",
        "itemName": "Electronics Store",
        "itemId": "seller-123",
        "submittedBy": "seller@example.com",
        "submittedDate": "2026-02-19T10:00:00Z",
        "priority": "high" | "medium" | "low",
        "metadata": {
          "documents": 3,
          "verified": false
        }
      }
    ],
    "disputes": [
      {
        "id": "dispute-123",
        "status": "open" | "resolved" | "appealed" | "closed",
        "buyerId": "buyer-123",
        "buyerName": "John Doe",
        "sellerId": "seller-456",
        "sellerName": "Tech Store",
        "auctionId": "auction-789",
        "itemName": "iPhone 14",
        "amount": 50000,
        "reason": "Item not received",
        "createdDate": "2026-02-01T10:00:00Z",
        "resolvedDate": null,
        "resolution": null,
        "notes": "Buyer claims non-receipt, seller claims delivered",
        "evidenceCount": 5,
        "daysOpen": 19
      }
    ],
    "analytics": {
      "topCategories": [
        {
          "category": "Electronics",
          "gmv": 5000000,
          "count": 450
        }
      ],
      "fraudMetrics": {
        "flaggedListings": 12,
        "flaggedUsers": 5,
        "detectionRate": 99.2
      },
      "paymentMetrics": {
        "successRate": 99.85,
        "failedCount": 3,
        "disputeRate": 0.2
      }
    }
  }
}
```

### POST /admin/{adminId}/alerts/{alertId}/resolve
**Purpose**: Resolve critical alert  
**Authentication**: Required (Admin role)

**Request**
```json
POST /api/admin/admin-123/alerts/alert-123/resolve HTTP/1.1
Authorization: Bearer {token}

{
  "resolution": "approved" | "rejected" | "escalated",
  "notes": "Approved after verifying seller credentials",
  "actionTaken": "Verified seller",
  "followUpRequired": false
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "alertId": "alert-123",
    "resolvedAt": "2026-02-20T10:35:00Z",
    "resolvedBy": "admin-123"
  }
}
```

### POST /admin/{adminId}/approvals/{itemId}/approve
**Purpose**: Approve pending item  
**Authentication**: Required (Admin role)

**Request**
```json
POST /api/admin/admin-123/approvals/item-123/approve HTTP/1.1
Authorization: Bearer {token}

{
  "notes": "All documents verified"
}
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "itemId": "item-123",
    "approvedAt": "2026-02-20T10:40:00Z"
  }
}
```

---

## 🔍 SEARCH & FILTER ENDPOINTS

### GET /search/auctions
**Purpose**: Search and filter auctions  
**Query Parameters**
```
keyword=string          # Search term
category=string         # Category filter
minPrice=number         # Minimum price
maxPrice=number         # Maximum price
condition=string        # new, excellent, good, fair
sort=string            # price_asc, price_desc, ending_soon, newest
page=number            # Page number (1-indexed)
limit=number           # Results per page (max 100)
```

**Response**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "auction-123",
        "title": "Item Title",
        "currentBid": 5000,
        "bids": 10,
        "image": "https://...",
        "endsAt": "2026-02-22T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 245,
      "pages": 13
    }
  }
}
```

---

## 🔐 ERROR CODES

```
100 - Validation Error
      Fields required, invalid format, etc.

200 - Authentication Error
      Invalid token, expired token, missing token

300 - Authorization Error
      User doesn't have permission

400 - Not Found
      Resource doesn't exist

500 - Conflict
      Duplicate entry, invalid state transition

600 - Rate Limited
      Too many requests

700 - Server Error
      Internal server error, database error
```

---

## 📊 DATABASE SCHEMA OUTLINE

Your backend will need these tables:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password HASH,
  role ENUM('buyer', 'seller', 'dealer', 'admin'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Auctions
CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users,
  product_name VARCHAR,
  starting_bid DECIMAL,
  current_bid DECIMAL,
  end_date TIMESTAMP,
  status ENUM('active', 'ended', 'cancelled'),
  created_at TIMESTAMP
);

-- Bids
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  auction_id UUID REFERENCES auctions,
  bidder_id UUID REFERENCES users,
  amount DECIMAL,
  placed_at TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  auction_id UUID REFERENCES auctions,
  buyer_id UUID REFERENCES users,
  seller_id UUID REFERENCES users,
  amount DECIMAL,
  status ENUM('pending', 'paid', 'shipped', 'delivered'),
  created_at TIMESTAMP
);

-- And more: vehicles, products, disputes, alerts, etc.
```

---

## 🚀 MIGRATION CHECKLIST

Implement endpoints in this order:

**Phase 1** (Week 1):
- [ ] GET /buyers/{userId}/dashboard
- [ ] GET /sellers/{userId}/dashboard
- [ ] GET /dealers/{userId}/dashboard
- [ ] GET /admin/{adminId}/dashboard

**Phase 2** (Week 2):
- [ ] POST /sellers/{userId}/products
- [ ] POST /dealers/{userId}/vehicles
- [ ] POST /admin/{adminId}/alerts/{alertId}/resolve
- [ ] POST /admin/{adminId}/approvals/{itemId}/approve

**Phase 3** (Week 3):
- [ ] GET /search/auctions
- [ ] Additional filtering/sorting endpoints
- [ ] Bulk operations (if needed)

---

**Ready to build the backend? 🚀**

All endpoint specs are detailed above. Start with Phase 1 endpoints and test with the frontend using REACT_APP_API_URL=localhost:3001/api.
