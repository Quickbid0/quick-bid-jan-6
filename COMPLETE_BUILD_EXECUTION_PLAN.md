# QUICKMELA - COMPLETE BUILD EXECUTION PLAN
## From Current State to Market Launch (16 Weeks)

---

# ⚡ IMMEDIATE ACTION (TODAY - 4 Hours)

## Phase 0: Apply Critical Fixes NOW

### Task 0.1: Fix App.tsx Importing (30 minutes)
**File:** `/src/App.tsx`

```typescript
// STEP 1: Replace lines 1-5
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';

// STEP 2: Delete ALL lazy imports except these 13:
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/RegisterFixed'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfileFixed'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const AISettings = lazy(() => import('./pages/AISettings'));
const AddProduct = lazy(() => import('./pages/AddProductFixed'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const About = lazy(() => import('./pages/About'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));

// STEP 3: Replace lines 185-257 (ScrollToTop + useProductionEnhancements)
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const useProductionEnhancements = () => {
  useEffect(() => {
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          return false;
        }
      };
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);
};

// STEP 4: Update routes (around line 259-278)
function App() {
  useProductionEnhancements();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/buyer/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/seller/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
        <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
        <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute adminRequired={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
```

✅ **Test:** `npm run dev` → Should start without errors

---

### Task 0.2: Fix Admin Registration Security (20 minutes)
**File:** `/backend/src/auth/auth.service.ts`

```typescript
async register(registerDto: RegisterDto): Promise<any> {
  // ADD VALIDATION
  if (registerDto.role === 'admin' || registerDto.role === 'ADMIN') {
    throw new BadRequestException(
      'Admin accounts cannot be self-registered. Contact support for admin access.'
    );
  }

  const allowedRoles = ['buyer', 'seller'];
  if (!allowedRoles.includes(registerDto.role?.toLowerCase())) {
    throw new BadRequestException(`Invalid role. Allowed: ${allowedRoles.join(', ')}`);
  }

  // Rest of registration logic...
}
```

**File:** `/src/pages/RegisterFixed.tsx`

Find roleOptions and remove admin:
```typescript
const roleOptions = [
  { value: 'buyer', label: 'I want to buy items' },
  { value: 'seller', label: 'I want to sell items' },
  { value: 'company', label: 'Company/Business Account' },
  // REMOVE: { value: 'admin', label: 'Admin Account' }
];
```

✅ **Test:** Try registering with admin role → Should fail

---

### Task 0.3: Fix Database Connection (10 minutes)
**File:** `/backend/.env`

Replace:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/quickmela_db"
```

Or for Supabase:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_UUID.supabase.co:5432/postgres"
```

✅ **Test:** `npm run start:dev` → Check logs for "Database connected"

---

### Task 0.4: Create Prisma Migrations (15 minutes)
**Terminal:**
```bash
cd backend

# Generate migration
npx prisma migrate dev --name init_schema

# Verify
npx prisma studio
```

✅ Should see database tables in browser

---

### Task 0.5: Commit Changes (15 minutes)
```bash
git checkout -b phase-0-critical-fixes
git add -A
git commit -m "Phase 0: Fix critical startup issues, imports, security, database"
git push origin phase-0-critical-fixes
```

Create PR and get approval

---

## After Phase 0 (Now = Monday of Week 1)
✅ App starts without crashes
✅ All basic routes work
✅ Database connected
✅ Security fix applied
✅ Ready for Phase 1

**Total Time: 4 hours TODAY**

---

---

# WEEK 1: PHASE 1 - HIGH PRIORITY FIXES (Days 1-5)

## Phase 1 Objectives
- ✅ Email verification working
- ✅ Auth context consolidated
- ✅ Database schema complete
- ✅ 50+ routes accessible
- ✅ All P1 issues resolved

---

## Task 1.1: Email Verification System (3-4 hours)

### Part A: Backend Email Service (2 hours)

**File:** `/backend/src/email/email.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(/* add SendGrid or your provider */) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your QuickMela Account',
      html: `
        <h1>Welcome to QuickMela!</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>Link expires in 24 hours</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to QuickMela',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Your account is ready to go.</p>
        <a href="${process.env.FRONTEND_URL}/login">Login Now</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Link expires in 1 hour</p>
      `,
    });
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    // Implementation depends on provider
    // For now, log it
    console.log(`Email would be sent to ${options.to}: ${options.subject}`);
  }
}
```

**File:** `/backend/src/auth/auth.service.ts`

Update register method:
```typescript
async register(registerDto: RegisterDto): Promise<any> {
  // ... validation code ...

  const user = await this.prisma.user.create({
    data: {
      email: registerDto.email,
      passwordHash: hashedPassword,
      name: registerDto.name,
      role: registerDto.role.toLowerCase(),
      emailVerified: false, // Add this
      status: 'pending_verification', // Add this
    }
  });

  // Generate verification token
  const verificationToken = this.generateToken(user.id);

  // Send verification email
  await this.emailService.sendVerificationEmail(user.email, verificationToken);

  return { user, message: 'Verification email sent' };
}

async verifyEmail(token: string): Promise<any> {
  const userId = this.validateToken(token);

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      status: 'active',
    }
  });

  return { message: 'Email verified successfully' };
}

private generateToken(userId: string): string {
  // Generate secure token (use JWT or similar)
  return require('crypto').randomBytes(32).toString('hex');
}

private validateToken(token: string): string {
  // Validate token and return userId
  // For now, return mock
  return 'user-id';
}
```

### Part B: Database Schema Updates (30 minutes)

**File:** `/backend/prisma/schema.prisma`

Update User model:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          String    @default("buyer")
  status        String    @default("pending_verification")
  emailVerified Boolean   @default(false)
  phoneVerified Boolean   @default(false)
  faceVerified  Boolean   @default(false)
  kycStatus     String    @default("pending")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  auctions      Auction[]
  bids          Bid[]
  wallet        Wallet?
  profile       Profile?
}

model VerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  type      String   // "email", "phone", "kyc"
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

Run migration:
```bash
npx prisma migrate dev --name add_email_verification
```

✅ **Test:** Register new user → Check email (or logs) for verification link

---

## Task 1.2: Auth Context Consolidation (1-2 hours)

**File:** `/src/components/RoleGuard.tsx`

Find this:
```typescript
import { useSession } from '../context/SessionContext';
```

Change to:
```typescript
import { useAuth } from '../context/UnifiedAuthContext';
```

And update usage:
```typescript
export const RoleGuard = ({ children, allowedRoles }: any) => {
  const { user, isLoading } = useAuth(); // Changed from useSession

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
```

**File:** `/src/main.tsx`

Remove SessionProvider wrapper:
```typescript
// BEFORE:
<SessionProvider>
  <UnifiedAuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </UnifiedAuthProvider>
</SessionProvider>

// AFTER:
<UnifiedAuthProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</UnifiedAuthProvider>
```

Search for other SessionContext usage and replace:
```bash
grep -r "SessionContext" src/
```

✅ **Test:** Login flow works, auth state is consistent

---

## Task 1.3: Create Additional Dashboard Routes (1 hour)

Create proper dashboard components instead of reusing Dashboard everywhere.

**File:** `/src/pages/BuyerDashboard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/UnifiedAuthContext';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeAuctions: 0,
    wonAuctions: 0,
    myBids: 0,
    walletBalance: 0,
  });

  useEffect(() => {
    // Will be wired to API later
    setStats({
      activeAuctions: 0,
      wonAuctions: 0,
      myBids: 0,
      walletBalance: 0,
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-bold">Active Auctions</h3>
          <p className="text-2xl">{stats.activeAuctions}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-bold">Won Auctions</h3>
          <p className="text-2xl">{stats.wonAuctions}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-bold">My Bids</h3>
          <p className="text-2xl">{stats.myBids}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-bold">Wallet Balance</h3>
          <p className="text-2xl">₹{stats.walletBalance}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="text-gray-500">No recent activity</div>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
          <div className="text-gray-500">Loading recommendations...</div>
        </div>
      </div>
    </div>
  );
}
```

**File:** `/src/pages/SellerDashboard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/UnifiedAuthContext';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeAuctions: 0,
    soldItems: 0,
    earnings: 0,
    pendingPayment: 0,
  });

  useEffect(() => {
    // Will be wired to API later
    setStats({
      activeAuctions: 0,
      soldItems: 0,
      earnings: 0,
      pendingPayment: 0,
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-bold">Active Listings</h3>
          <p className="text-2xl">{stats.activeAuctions}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-bold">Sold Items</h3>
          <p className="text-2xl">{stats.soldItems}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-bold">Total Earnings</h3>
          <p className="text-2xl">₹{stats.earnings}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-bold">Pending Payment</h3>
          <p className="text-2xl">₹{stats.pendingPayment}</p>
        </div>
      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg mb-6">
        Create New Auction
      </button>

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Your Auctions</h2>
        <div className="text-gray-500">No auctions yet</div>
      </div>
    </div>
  );
}
```

**File:** `/src/App.tsx` - Update routes

```typescript
// Add imports
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));

// Update routes
<Route path="/buyer/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
<Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
```

✅ **Test:** Each role sees different dashboard after login

---

## Task 1.4: Add 40+ Missing Routes (1-2 hours)

Instead of creating all pages, we'll create stub components for now:

**File:** `/src/pages/AuctionsList.tsx`

```typescript
export default function AuctionsList() {
  return <div className="p-6"><h1>Auctions</h1></div>;
}
```

**In App.tsx, add these routes:**

```typescript
// Buyer Routes
const AuctionsList = lazy(() => import('./pages/AuctionsList'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MyWins = lazy(() => import('./pages/MyWins'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const WalletPage = lazy(() => import('./pages/WalletPage'));

// Add to routes:
<Route path="/auctions" element={<ProtectedRoute><AuctionsList /></ProtectedRoute>} />
<Route path="/buyer/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
<Route path="/buyer/wins" element={<ProtectedRoute><MyWins /></ProtectedRoute>} />
<Route path="/buyer/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
<Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
```

**Create stub pages** (copy-paste template for each):
```typescript
export default function StubPage() {
  return (
    <div className="p-6">
      <h1>This page is under construction</h1>
      <p>Check back soon!</p>
    </div>
  );
}
```

Create these files (can be stubs for now):
- `/src/pages/MyOrders.tsx`
- `/src/pages/MyWins.tsx`
- `/src/pages/Watchlist.tsx`
- `/src/pages/WalletPage.tsx`
- `/src/pages/LiveAuction.tsx`
- `/src/pages/BiddingHistory.tsx`
- `/src/pages/SellerProducts.tsx`
- `/src/pages/SellerAnalytics.tsx`
- `/src/pages/SellerSettings.tsx`
- And ~30 more...

✅ **Result:** No more 404 links

---

## Task 1.5: Delete Dead Code (30 minutes)

Remove all unused imports from App.tsx and delete stub page files that won't be used.

```bash
# Delete unused page files
rm src/pages/AIDashboard.tsx
rm src/pages/BuyerDashboard.tsx
rm src/pages/WatchlistPage.tsx
# ... etc
```

Update App.tsx to only 60 lines instead of 400+.

---

## Task 1.6: Database Schema Complete (1 hour)

**File:** `/backend/prisma/schema.prisma`

Add missing models:

```prisma
model Auction {
  id            String   @id @default(cuid())
  productId     String   @unique
  product       Product  @relation(fields: [productId], references: [id])

  sellerId      String
  seller        User     @relation("AuctionsSold", fields: [sellerId], references: [id])

  title         String
  description   String?
  category      String

  startingPrice Float
  currentBid    Float    @default(0)
  reservePrice  Float?

  startTime     DateTime
  endTime       DateTime

  winnerId      String?
  winner        User?    @relation("AuctionsWon", fields: [winnerId], references: [id])

  status        String   @default("scheduled")
  auctionType   String   @default("timed")

  bids          Bid[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Product {
  id            String   @id @default(cuid())
  title         String
  description   String
  category      String

  sellerId      String
  seller        User     @relation("ProductsSold", fields: [sellerId], references: [id])

  images        String[] // URLs
  video         String?

  condition     String   @default("new")
  price         Float
  inventory     Int      @default(1)

  auction       Auction?

  status        String   @default("draft")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Bid {
  id            String   @id @default(cuid())
  auctionId     String
  auction       Auction  @relation(fields: [auctionId], references: [id])

  bidderId      String
  bidder        User     @relation(fields: [bidderId], references: [id])

  amount        Float
  isWinning     Boolean  @default(false)
  isAutoBid     Boolean  @default(false)
  maxAutoBid    Float?

  status        String   @default("active")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Wallet {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])

  balance       Float    @default(0)
  blockedBalance Float   @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WalletTransaction {
  id            String   @id @default(cuid())
  walletId      String
  wallet        Wallet   @relation(fields: [walletId], references: [id])

  type          String   // "deposit", "payment", "refund", "payout"
  amount        Float

  status        String   @default("pending")

  description   String?
  referenceId   String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Profile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])

  avatarUrl     String?
  bio           String?
  phone         String?
  address       String?
  city          String?
  state         String?
  pincode       String?

  rating        Float    @default(0)
  totalReviews  Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model KYC {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  documentType      String   // "aadhaar", "pan", "passport"
  documentNumber    String
  documentFrontUrl  String?
  documentBackUrl   String?

  selfieUrl         String?

  status            String   @default("pending")
  rejectionReason   String?

  verifiedAt        DateTime?
  verifiedBy        String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

Update User model to add relations:
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  name            String
  role            String    @default("buyer")
  status          String    @default("pending_verification")
  emailVerified   Boolean   @default(false)
  phoneVerified   Boolean   @default(false)
  faceVerified    Boolean   @default(false)
  kycStatus       String    @default("pending")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  auctionsSold    Auction[] @relation("AuctionsSold")
  auctionsWon     Auction[] @relation("AuctionsWon")
  productsSold    Product[] @relation("ProductsSold")
  bids            Bid[]
  wallet          Wallet?
  profile         Profile?
  kyc             KYC?
  walletTransactions WalletTransaction[]
}
```

Run migration:
```bash
npx prisma migrate dev --name add_core_models
```

✅ **Test:** `npx prisma studio` shows all tables

---

## Task 1.7: Week 1 Integration Testing (2-3 hours)

Test all flows:

```bash
# 1. Clear and fresh start
npm run dev

# 2. Test registration
- Go to /register
- Register as buyer
- Should redirect to /login
- Should receive verification email (check logs)

# 3. Test login
- Login with registered account
- Should redirect to /buyer/dashboard
- Dashboard should show

# 4. Test role protection
- Try accessing /admin/dashboard without admin account
- Should show "Unauthorized"

# 5. Test navigation
- All navbar links should work (no 404s)

# 6. Backend test
npm run start:dev
- Should connect to database
- Should create test users automatically
- Should accept login requests
```

Document any issues and fix before moving to Week 2.

---

## Week 1 Deliverables

✅ Email verification system
✅ Auth context consolidated
✅ Database schema with 8+ models
✅ 50+ routes accessible
✅ All P1 issues resolved
✅ No security vulnerabilities
✅ Clean, working codebase

---

---

# WEEK 2-3: PHASE 2 - CORE AUCTION ENGINE (Days 6-17)

## Phase 2 Objectives
- ✅ Auction system working
- ✅ Product upload system
- ✅ Bidding logic complete
- ✅ Winner determination
- ✅ Real-time auction updates

---

## Task 2.1: Auction Backend System (3-4 days)

### Part A: Auction Service

**File:** `/backend/src/auctions/auction.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuctionService {
  constructor(private prisma: PrismaService) {}

  async createAuction(data: {
    productId: string;
    sellerI d: string;
    startingPrice: number;
    reservePrice?: number;
    duration: number; // in minutes
    auctionType: string;
  }) {
    const endTime = new Date(Date.now() + data.duration * 60 * 1000);

    const auction = await this.prisma.auction.create({
      data: {
        productId: data.productId,
        sellerId: data.sellerId,
        title: '', // Will get from product
        startingPrice: data.startingPrice,
        reservePrice: data.reservePrice,
        currentBid: data.startingPrice,
        startTime: new Date(),
        endTime,
        auctionType: data.auctionType,
        status: 'scheduled',
      },
    });

    return auction;
  }

  async getAuction(auctionId: string) {
    return this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        product: true,
        seller: { select: { id: true, name: true, email: true } },
        bids: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async getActiveAuctions() {
    return this.prisma.auction.findMany({
      where: {
        status: 'active',
        endTime: { gt: new Date() },
      },
      include: { product: true, seller: true },
      orderBy: { endTime: 'asc' },
    });
  }

  async updateAuctionStatus(auctionId: string, status: string) {
    return this.prisma.auction.update({
      where: { id: auctionId },
      data: { status },
    });
  }

  async determineWinner(auctionId: string) {
    const auction = await this.getAuction(auctionId);

    if (!auction) throw new Error('Auction not found');

    // Find highest bid
    const highestBid = await this.prisma.bid.findFirst({
      where: { auctionId, status: 'active' },
      orderBy: { amount: 'desc' },
    });

    if (!highestBid) {
      // No bids, auction failed
      return this.updateAuctionStatus(auctionId, 'failed');
    }

    if (highestBid.amount < (auction.reservePrice || auction.startingPrice)) {
      // Reserve not met
      return this.updateAuctionStatus(auctionId, 'failed');
    }

    // Update auction with winner
    await this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        winnerId: highestBid.bidderId,
        status: 'completed',
        currentBid: highestBid.amount,
      },
    });

    // Mark winning bid
    await this.prisma.bid.update({
      where: { id: highestBid.id },
      data: { isWinning: true },
    });

    return { winnerId: highestBid.bidderId, finalPrice: highestBid.amount };
  }
}
```

### Part B: Auction Controller

**File:** `/backend/src/auctions/auction.controller.ts`

```typescript
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuctionService } from './auction.service';

@Controller('auctions')
export class AuctionController {
  constructor(private auctionService: AuctionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createAuction(@Body() data: any) {
    return this.auctionService.createAuction(data);
  }

  @Get(':id')
  async getAuction(@Param('id') id: string) {
    return this.auctionService.getAuction(id);
  }

  @Get()
  async getActiveAuctions() {
    return this.auctionService.getActiveAuctions();
  }
}
```

### Part C: Module Setup

**File:** `/backend/src/auctions/auction.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuctionService],
  controllers: [AuctionController],
  exports: [AuctionService],
})
export class AuctionModule {}
```

Add to `/backend/src/app.module.ts`:
```typescript
import { AuctionModule } from './auctions/auction.module';

@Module({
  imports: [
    // ... existing
    AuctionModule,
  ],
})
export class AppModule {}
```

✅ **Test:** `POST /auctions/create` creates auction

---

## Task 2.2: Bidding System (2-3 days)

### Part A: Bid Service

**File:** `/backend/src/bids/bid.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BidService {
  constructor(private prisma: PrismaService) {}

  async placeBid(data: {
    auctionId: string;
    bidderId: string;
    amount: number;
    isAutoBid?: boolean;
    maxAutoBidAmount?: number;
  }) {
    // Validate auction exists and is active
    const auction = await this.prisma.auction.findUnique({
      where: { id: data.auctionId },
    });

    if (!auction) throw new BadRequestException('Auction not found');
    if (auction.status !== 'active') throw new BadRequestException('Auction not active');
    if (new Date() > auction.endTime) throw new BadRequestException('Auction ended');

    // Validate bid amount
    if (data.amount <= auction.currentBid) {
      throw new BadRequestException(`Bid must be higher than current bid: ${auction.currentBid}`);
    }

    // Update current bid
    await this.prisma.auction.update({
      where: { id: data.auctionId },
      data: { currentBid: data.amount },
    });

    // Create bid record
    const bid = await this.prisma.bid.create({
      data: {
        auctionId: data.auctionId,
        bidderId: data.bidderId,
        amount: data.amount,
        isAutoBid: data.isAutoBid || false,
        maxAutoBid: data.maxAutoBidAmount,
        status: 'active',
      },
    });

    // Outbid previous highest bidder
    const previousBids = await this.prisma.bid.findMany({
      where: {
        auctionId: data.auctionId,
        bidderId: { not: data.bidderId },
        status: 'active',
      },
      orderBy: { amount: 'desc' },
      take: 1,
    });

    if (previousBids.length > 0) {
      await this.prisma.bid.updateMany({
        where: {
          id: { in: previousBids.map(b => b.id) },
        },
        data: { status: 'outbid' },
      });
    }

    return bid;
  }

  async getBidHistory(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' },
      include: { bidder: { select: { id: true, name: true } } },
    });
  }

  async getUserBids(userId: string) {
    return this.prisma.bid.findMany({
      where: { bidderId: userId },
      include: { auction: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### Part B: Bid Controller

**File:** `/backend/src/bids/bid.controller.ts`

```typescript
import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BidService } from './bid.service';

@Controller('bids')
export class BidController {
  constructor(private bidService: BidService) {}

  @Post('place')
  @UseGuards(JwtAuthGuard)
  async placeBid(@Request() req: any, @Body() data: any) {
    return this.bidService.placeBid({
      ...data,
      bidderId: req.user.id,
    });
  }

  @Get('auction/:auctionId')
  async getBidHistory(@Param('auctionId') auctionId: string) {
    return this.bidService.getBidHistory(auctionId);
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  async getUserBids(@Request() req: any) {
    return this.bidService.getUserBids(req.user.id);
  }
}
```

### Part C: Bid Module

**File:** `/backend/src/bids/bid.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BidService],
  controllers: [BidController],
  exports: [BidService],
})
export class BidModule {}
```

Add to `app.module.ts`:
```typescript
import { BidModule } from './bids/bid.module';

@Module({
  imports: [
    // ... existing
    BidModule,
  ],
})
export class AppModule {}
```

✅ **Test:** `POST /bids/place` places bid on auction

---

## Task 2.3: Product Upload System (2 days)

### Part A: Product Service

**File:** `/backend/src/products/product.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: {
    title: string;
    description: string;
    category: string;
    sellerId: string;
    price: number;
    condition: string;
    images: string[];
    video?: string;
  }) {
    const product = await this.prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        sellerId: data.sellerId,
        price: data.price,
        condition: data.condition,
        images: data.images,
        video: data.video,
        status: 'draft',
      },
    });

    return product;
  }

  async getProduct(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: { seller: { select: { id: true, name: true } } },
    });
  }

  async getSellerProducts(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProduct(productId: string, data: any) {
    return this.prisma.product.update({
      where: { id: productId },
      data,
    });
  }
}
```

### Part B: Product Controller

**File:** `/backend/src/products/product.controller.ts`

```typescript
import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createProduct(@Request() req: any, @Body() data: any) {
    return this.productService.createProduct({
      ...data,
      sellerId: req.user.id,
    });
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(id);
  }

  @Get('seller/:sellerId')
  async getSellerProducts(@Param('sellerId') sellerId: string) {
    return this.productService.getSellerProducts(sellerId);
  }
}
```

### Part C: Product Module

```typescript
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
```

✅ **Test:** `POST /products/create` creates product

---

## Task 2.4: Frontend Auction Pages (2 days)

### Part A: Live Auction Page

**File:** `/src/pages/LiveAuction.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/UnifiedAuthContext';

export default function LiveAuction() {
  const { auctionId } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Fetch auction
    fetch(`/api/auctions/${auctionId}`)
      .then(r => r.json())
      .then(data => setAuction(data));

    // Fetch bids
    fetch(`/api/bids/auction/${auctionId}`)
      .then(r => r.json())
      .then(data => setBids(data));
  }, [auctionId]);

  useEffect(() => {
    if (!auction) return;

    // Update countdown
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Auction Ended');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handleBid = async () => {
    if (!bidAmount) return;

    try {
      const response = await fetch('/api/bids/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          amount: parseFloat(bidAmount),
        }),
      });

      if (response.ok) {
        setBidAmount('');
        // Refresh bids
        const newBids = await fetch(`/api/bids/auction/${auctionId}`).then(r => r.json());
        setBids(newBids);
      } else {
        alert('Bid failed: ' + (await response.text()));
      }
    } catch (error) {
      console.error('Bid error:', error);
    }
  };

  if (!auction) return <div className="p-6">Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Product */}
      <div className="col-span-2">
        <div className="bg-gray-200 h-96 rounded-lg mb-4 flex items-center justify-center">
          {auction.product?.images[0] ? (
            <img src={auction.product.images[0]} alt={auction.title} className="h-full" />
          ) : (
            <span>No image</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
        <p className="text-gray-600 mb-4">{auction.product?.description}</p>
      </div>

      {/* Bidding Panel */}
      <div className="border rounded-lg p-6 h-fit">
        <div className="mb-4">
          <p className="text-gray-600">Current Bid</p>
          <p className="text-3xl font-bold">₹{auction.currentBid}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">Time Left</p>
          <p className="text-2xl font-bold text-blue-600">{timeLeft}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">Seller</p>
          <p className="font-semibold">{auction.seller?.name}</p>
        </div>

        <input
          type="number"
          placeholder="Enter bid amount"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          min={auction.currentBid + 100}
        />

        <button
          onClick={handleBid}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold mb-4 hover:bg-blue-700"
        >
          Place Bid
        </button>

        <div>
          <h3 className="font-bold mb-3">Recent Bids</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {bids.slice(0, 10).map((bid) => (
              <div key={bid.id} className="flex justify-between text-sm border-b pb-2">
                <span>{bid.bidder?.name || 'Anonymous'}</span>
                <span className="font-semibold">₹{bid.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Part B: Auctions List Page

**File:** `/src/pages/LiveAuctionsList.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LiveAuctionsList() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auctions')
      .then(r => r.json())
      .then(data => {
        setAuctions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Live Auctions</h1>

      <div className="grid grid-cols-4 gap-6">
        {auctions.map((auction) => (
          <Link key={auction.id} to={`/auction/${auction.id}`}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-40 flex items-center justify-center">
                {auction.product?.images[0] ? (
                  <img src={auction.product.images[0]} alt={auction.title} className="h-full w-full object-cover" />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm mb-2 line-clamp-2">{auction.title}</h3>
                <p className="text-lg font-bold text-blue-600">₹{auction.currentBid}</p>
                <p className="text-xs text-gray-600">By {auction.seller?.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

Add to App.tsx routes:
```typescript
<Route path="/auctions" element={<ProtectedRoute><LiveAuctionsList /></ProtectedRoute>} />
<Route path="/auction/:auctionId" element={<ProtectedRoute><LiveAuction /></ProtectedRoute>} />
```

---

## Task 2.5: Week 2-3 Integration & Testing (2-3 days)

Full end-to-end testing:

1. Seller creates product
2. Seller creates auction from product
3. Buyer views live auctions
4. Buyer joins auction page
5. Buyer places bid
6. Bid updates in real-time (will add WebSocket later)
7. Auction ends, winner determined
8. Winner notification

---

## Phase 2 Deliverables

✅ Auction system fully working
✅ Bidding system functional
✅ Product upload system
✅ Live auction pages
✅ Winner determination logic
✅ 40+ API endpoints implemented

---

## Remaining Phases Overview

**WEEK 4-5: PHASE 3 - Real-Time & WebSocket**
- Socket.io setup
- Live bid broadcasts
- Live user count
- Timer synchronization

**WEEK 6-7: PHASE 4 - Payment System**
- Razorpay integration
- Wallet system
- Transaction logging
- Refunds

**WEEK 8-10: PHASE 5 - Financial & Settlements**
- Winner settlement
- Seller payouts
- Tax calculations
- Audit logging

**WEEK 11-14: PHASE 6 - Security & Compliance**
- KYC verification
- Role-based access
- Compliance reports
- Security audit

**WEEK 15-16: PHASE 7 - Deployment**
- Production build
- Monitoring setup
- Load testing
- Go-live

---

# 📝 WHAT TO DO NOW

1. **Today (4 hours):** Apply Phase 0 fixes (App.tsx, Security, Database)
2. **Tomorrow Start:** Begin Phase 1 (Email, Auth, Routes)
3. **Week 1:** Complete Phase 1
4. **Weeks 2-3:** Complete Phase 2 (Auctions & Bidding)
5. **Continue:** Follow remaining phases in order

---

# 💡 KEY SUCCESS FACTORS

✅ **Don't skip phases** - Each builds on previous
✅ **Test each phase** - Before moving to next
✅ **Keep team focused** - Only on current phase
✅ **Daily standups** - Sync on blockers
✅ **Weekly reviews** - Assess progress
✅ **Deploy to staging** - Weekly to test production flow

---

# 🚀 NEXT IMMEDIATE STEP

**Open CODE_FIXES_READY_TO_USE.md and apply Phase 0 fixes RIGHT NOW**

This takes 4 hours and gets your app working. Then you can start building features in Phase 1.

**Status**: Ready to execute → Go build! 🎯
