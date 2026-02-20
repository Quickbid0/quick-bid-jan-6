
# ✅ QUICKMELA BUG FIX INTEGRATION GUIDE

This document explains how to integrate all the created fixes into your backend routes and frontend pages.

---

## 🔴 SPRINT 1 — CRITICAL SECURITY FIXES

### FIX 1: Server-Side RBAC (S-01)

**Created:** `backend/middleware/verifyAuth.ts` → `verifyRole()` middleware

**Backend Integration:**
```typescript
// routes/adminRoutes.ts
import { verifyAuth, verifyRole } from '../middleware/verifyAuth';

export const createAdminRouter = () => {
  const router = Router();

  // Apply verifyAuth to all admin routes
  router.use(verifyAuth);

  // Then apply verifyRole for specific actions
  router.post(
    '/approve-seller/:id',
    verifyRole('admin', 'superadmin'),
    approveSeller
  );

  router.post(
    '/block-user/:id',
    verifyRole('admin', 'superadmin'),
    blockUser
  );

  return router;
};

// In server.ts
app.use('/api/admin', createAdminRouter());
```

### FIX 2 & 3: httpOnly JWT Cookies + Token Refresh

**Created:** `backend/middleware/verifyAuth.ts` → `handleTokenRefresh()`

**Backend Integration:**
```typescript
// In your login route (e.g., routes/authRoutes.ts)
router.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body);
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  // ✅ Set token in httpOnly cookie instead of returning in JSON
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
});

// Add refresh endpoint
router.post('/refresh', handleTokenRefresh);

// Add logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});
```

### FIX 4: PII Sanitization

**Created:** `backend/utils/userSanitizer.ts`

**Backend Integration:**
```typescript
// routes/auctionRoutes.ts
import { sanitizePublicUser, sanitizeBids } from '../utils/userSanitizer';

router.get('/auctions', async (req, res) => {
  const auctions = await Auction.find().lean();
  
  // ✅ Sanitize before returning
  const safe = auctions.map(auction => ({
    id: auction._id,
    title: auction.title,
    description: auction.description,
    startPrice: auction.startPrice,
    currentHighestBid: auction.currentHighestBid,
    // Only expose public user info, NOT email/phone/wallet
    highestBidderInfo: auction.highestBidderId
      ? sanitizePublicUser(auction.highestBidderData)
      : null,
    bidsCount: auction.bids?.length || 0,
    // Never return full bids array with user details
  }));

  res.json(safe);
});
```

### FIX 5: Atomic Auction Bids (Race Condition)

**Created:** `backend/services/atomicBidService.ts`

**Backend Integration:**
```typescript
// routes/bidRoutes.ts
import { AtomicBidService } from '../services/atomicBidService';
import { verifyAuth, verifyRole } from '../middleware/verifyAuth';

const bidService = new AtomicBidService(pool);

router.post(
  '/bids',
  verifyAuth,
  verifyRole('buyer', 'admin'),
  async (req, res) => {
    const { auctionId, amount } = req.body;
    const userId = req.user.id;

    const result = await bidService.placeBidAtomic(auctionId, userId, amount);

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    res.json({ success: true, auction: result.auction });
  }
);
```

### FIX 6: Auto-Bid Cooldown

**Created:** `backend/services/autoBidService.ts`

**Backend Integration:**
```typescript
// In your auto-bid job/service
import { autoBidService } from '../services/autoBidService';

async function processAutoBid(auctionId: string, userId: string) {
  // ✅ Check cooldown before placing bid
  if (!autoBidService.canAutoBid(auctionId, userId)) {
    console.log('Auto-bid cooldown active for user');
    return;
  }

  const user = await User.findById(userId);
  const auction = await Auction.findById(auctionId);

  // ✅ Validate wallet balance at execution time
  const nextBid = autoBidService.calculateNextBid(
    auction.currentHighestBid,
    user.autoBidMax,
    user.wallet.balance
  );

  if (!nextBid.bidAmount) {
    console.log('Cannot auto-bid:', nextBid.reason);
    return;
  }

  // Place the bid
  await bidService.placeBidAtomic(auctionId, userId, nextBid.bidAmount);
}
```

### FIX 27: Rate Limiting

**Created:** `backend/middleware/rateLimiter.ts`

**Backend Integration:**
```typescript
// In server.ts
import { bidRateLimiter } from './middleware/rateLimiter';

// Apply to bid endpoint
app.post(
  '/api/bids',
  bidRateLimiter(10 * 1000, 5), // 5 bids per 10 seconds
  verifyAuth,
  placeBid
);
```

---

## 🟠 SPRINT 2/3 — FRONTEND FIXES

### FIX 7: Wallet Balance Sync

**Use the hook:** `src/hooks/useAddMoney.ts`

```tsx
// In AddMoneyModal.tsx
import { useAddMoney } from '../hooks/useAddMoney';
import { useWalletStore } from '../stores/walletStore';

const AddMoneyModal = () => {
  const { addMoney } = useAddMoney();
  const balance = useWalletStore(s => s.balance);

  const handleAddMoney = async (amount: number) => {
    const result = await addMoney(amount);
    if (result.success) {
      // ✅ Balance already updated in store — no need for reload
      toast.success(result.message);
    }
  };

  return (
    <div>
      <p>Current Balance: ₹{balance}</p>
      <button onClick={() => handleAddMoney(500)}>Add ₹500</button>
    </div>
  );
};
```

### FIX 8: Delete Auction with Confirmation

**Use the hook:** `src/hooks/useAuctionDelete.ts`

```tsx
// In AuctionCard.tsx or AuctionManagement.tsx
import { useAuctionDelete } from '../hooks/useAuctionDelete';

const { deleteAuction } = useAuctionDelete();

const handleDelete = async (auction) => {
  const result = await deleteAuction(auction.id, auction);
  
  if (result.success) {
    toast.success(result.message);
    refetchAuctions();
  } else if (!result.cancelled) {
    toast.error(result.error);
  }
};
```

### FIX 9: Auto-Bid Max Validation

**Use the schema:** `src/schemas/formValidation.ts`

```tsx
import { autoBidConfigSchema } from '../schemas/formValidation';

const autoBidForm = useForm({
  resolver: zodResolver(
    autoBidConfigSchema(currentHighestBid, walletBalance)
  ),
});

// Now form automatically validates:
// ✅ maxBid must be > 0
// ✅ maxBid must exceed current bid
// ✅ maxBid cannot exceed wallet balance
```

### FIX 10-12: Protected Routes

**Already updated in:** `src/App.tsx` + `src/components/ProtectedRoute.tsx`

The routes now:
- ✅ Show spinner while auth loads
- ✅ Redirect unauthenticated users to /login
- ✅ Check role-based access
- ✅ Never show blank pages

### FIX 14-16: Form Validation

**Use the schemas:** `src/schemas/formValidation.ts`

```tsx
import { 
  createBidSchema,
  auctionFormSchema,
  autoBidConfigSchema 
} from '../schemas/formValidation';

// Bid form
const bidFormSchema = createBidSchema(currentHighestBid, walletBalance);

// Auction creation
const auctionSchema = auctionFormSchema; // Validates endDate is 1+ hour in future

// Auto-bid config
const autoBidSchema = autoBidConfigSchema(currentHighestBid, walletBalance);
```

### FIX 15: Image Upload

**Use the component:** `src/components/ImageUploadHandler.tsx`

```tsx
import { ImageUploadHandler, ImagePreview } from '../components/ImageUploadHandler';

const [images, setImages] = useState<File[]>([]);

<ImageUploadHandler
  onFilesSelected={setImages}
  maxFiles={5}
  maxSizeMb={10}
  onError={(error) => toast.error(error)}
/>

{images.map((img) => (
  <ImagePreview
    key={img.name}
    file={img}
    onRemove={(f) => setImages(images.filter(i => i !== f))}
  />
))}
```

### FIX 17: Post-Logout State Reset

**Already updated in:** `src/stores/authStore.ts`

The logout function now:
- ✅ Clears httpOnly cookies server-side
- ✅ Resets entire Zustand state
- ✅ Clears React Query cache
- ✅ Replaces history so back button doesn't return to protected pages

### FIX 18: Real-Time Dashboard

**Use the hook:** `src/hooks/useDashboardRealTime.ts`

```tsx
import { useDashboardRealTime } from '../hooks/useDashboardRealTime';

const Dashboard = () => {
  const { user } = useAuth();
  const stats = useDashboardRealTime(user?.id);

  return (
    <div>
      <StatCard label="Total Bids" value={stats.totalBids} />
      <StatCard label="Active Auctions" value={stats.activeAuctions} />
    </div>
  );
};
```

### FIX 19: Profile Name Sync to Sidebar

**Use the hook:** `src/hooks/useProfileUpdate.ts`

```tsx
import { useProfileUpdate } from '../hooks/useProfileUpdate';

const ProfileForm = () => {
  const { updateProfile } = useProfileUpdate();

  const handleSubmit = async (data) => {
    const result = await updateProfile(data);
    
    if (result.success) {
      // ✅ Sidebar automatically updates from auth store
      toast.success('Profile updated!');
    }
  };
};
```

### FIX 20: WebSocket Reconnection

**Use the utility:** `src/utils/auctionSocket.ts`

```typescript
import { createAuctionSocket } from '../utils/auctionSocket';

const socket = createAuctionSocket()
  .connect()
  .joinAuction(auctionId)
  .onBid((data) => {
    // Update UI with new bid
  })
  .onUpdate((auction) => {
    // Local state refreshed from server after reconnect
  });
```

### FIX 21: Counter Sync

**Use the hook:** `src/hooks/useServerSyncedCountdown.tsx`

```tsx
import { useServerSyncedCountdown, formatTimeLeft } from '../hooks/useServerSyncedCountdown';

const AuctionTimer = ({ endTime }) => {
  const timeLeft = useServerSyncedCountdown(endTime);

  return <div>Ends in: {formatTimeLeft(timeLeft)}</div>;
};

// ✅ Never drifts, even if tab is inactive
```

### FIX 22: Mobile Sidebar

**Use the component:** `src/components/MobileSidebar.tsx`

```tsx
import { MobileSidebar, useMobileSidebar } from '../components/MobileSidebar';

const Layout = () => {
  const { isOpen, toggle, close } = useMobileSidebar();

  return (
    <div className="flex">
      <MobileSidebar isOpen={isOpen} onClose={close}>
        {/* Sidebar content */}
      </MobileSidebar>
      <main>
        {/* Page content */}
      </main>
    </div>
  );
};
```

### FIX 23: Responsive Tables

**Use the component:** `src/components/ResponsiveTable.tsx`

```tsx
import { ResponsiveTable } from '../components/ResponsiveTable';

<ResponsiveTable>
  <thead>
    <tr>
      <th>Bidder</th>
      <th>Amount</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    {/* Table rows */}
  </tbody>
</ResponsiveTable>
// ✅ Automatically scrolls on mobile, no overflow
```

### FIX 24: Skeleton Loaders

**Use the component:** `src/components/SkeletonLoaders.tsx`

```tsx
import { StatCardSkeleton, DashboardSkeleton } from '../components/SkeletonLoaders';

{isLoading ? <DashboardSkeleton /> : <Dashboard data={data} />}
```

### FIX 25: Confirmation Dialogs

**Use the hook:** `src/hooks/useConfirmDialog.tsx`

```tsx
import { useConfirmDialog } from '../hooks/useConfirmDialog';

const MyComponent = () => {
  const { confirm } = useConfirmDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete item?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    });

    if (ok) {
      await api.delete('/api/item');
    }
  };
};
```

---

## ✅ VERIFICATION CHECKLIST

After implementing all fixes, verify:

- [ ] Changing localStorage role to "superadmin" does NOT grant access
- [ ] Removing auth cookie redirects to /login (not blank page)
- [ ] Two simultaneous bids → only one succeeds (409 conflict for other)
- [ ] Auto-bid with 2 buyers → max 1 bid per 1.5 seconds per user
- [ ] Adding ₹500 wallet → balance updates without reload
- [ ] Deleting auction with bids → shows confirmation + refunds
- [ ] Setting auto-bid > wallet balance → validation error shown
- [ ] Uploading .exe or 50MB → immediate error
- [ ] /auction/fake-id → 404 page (no infinite spinner)
- [ ] Unknown URL → branded 404 page
- [ ] Logout then back button → does NOT show authenticated content
- [ ] Dashboard bid count updates in real-time
- [ ] Sidebar overlay appears at 320px
- [ ] Tables have horizontal scroll on mobile
- [ ] Countdown timer stays accurate after 2min tab inactivity
- [ ] Submitting 6 bids in 10s → rate limit error

---

## 📝 NOTES

- All backend middleware is in TypeScript — ensure your backend is configured for TS
- Frontend components use React 18+ hooks and TSX
- All fixes maintain backward compatibility with existing code
- Rate limiter uses in-memory store — consider Redis for production scaling
