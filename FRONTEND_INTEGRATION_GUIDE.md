# Frontend Integration Guide - 28 Critical Fixes

## Overview

This guide shows exactly where and how to integrate all frontend hooks, components, and utilities created as part of the 28 critical fixes. The frontend uses **React 18 + React Router v6 + Zustand + Vite + Tailwind CSS**.

---

## Part 1: Global Setup (Required First)

### Step 1: Update `/src/main.tsx`

Add global interceptors and providers (✅ Already done in previous updates):

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupAxiosInterceptors } from './utils/axiosInterceptor.ts'
import { ConfirmDialogProvider } from './hooks/useConfirmDialog.tsx'

// ✅ Set up global axios interceptor for 401 token refresh
setupAxiosInterceptors()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ✅ Wrap all routes with ConfirmDialog provider */}
    <ConfirmDialogProvider>
      <App />
    </ConfirmDialogProvider>
  </React.StrictMode>,
)
```

**Status:** ✅ Already implemented

---

### Step 2: Update `/src/App.tsx`

Add role-based route protection and 404 handling (✅ Already done):

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterFixed />} />

        {/* Seller-only routes */}
        <Route
          path="/add-auction"
          element={
            <ProtectedRoute 
              allowedRoles={['seller', 'admin']}
              requiredRole="seller"
            >
              <AddAuctionPage />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute 
              allowedRoles={['admin', 'superadmin']}
              adminRequired={true}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Buyer routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
```

**Status:** ✅ Already implemented

---

## Part 2: Authentication & Authorization

### Integration Point: Login Flow

**File:** `/src/pages/Login.tsx` (or similar)

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore.ts'
import axios from 'axios'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Call backend login - JWT will be in httpOnly cookie
      const response = await axios.post('/api/auth/login', 
        { email, password }, 
        { withCredentials: true }  // ✅ FIX S-02: Send cookies
      )

      // Backend didn't send token in body (it's in httpOnly cookie)
      // Just store user info from response
      login(response.data.user)

      // Navigate based on role (✅ FIX R-02)
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (response.data.user.role === 'seller') {
        navigate('/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      // ✅ FIX S-04: 401 triggers global interceptor for refresh
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form UI */}
    </form>
  )
}
```

**Status:** ⏳ Needs role-based navigation logic

---

## Part 3: Pages & Component Integration

### Integration Point 1: Dashboard Page

**File:** `/src/pages/Dashboard.tsx` (or similar)

```typescript
import { useEffect, useState } from 'react'
import { useDashboardRealTime } from '../hooks/useDashboardRealTime.ts'
import { SkeletonLoaders } from '../components/SkeletonLoaders.tsx'
import axios from 'axios'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ✅ FIX ST-03: Real-time widget updates via WebSocket
  const { totalBids, totalViews } = useDashboardRealTime()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/dashboard/stats')
      setStats(response.data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    // ✅ FIX 24: Show skeleton loaders instead of blank page
    return <SkeletonLoaders.DashboardSkeleton />
  }

  return (
    <div className="p-4">
      <h1>Dashboard</h1>
      
      {/* Stat cards with real-time updates */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          title="Total Auctions" 
          value={stats?.auctionCount}
          loading={loading}
        />
        <StatCard 
          title="Total Bids" 
          value={totalBids}  {/* ✅ Real-time from WebSocket */}
        />
        <StatCard 
          title="Total Views" 
          value={totalViews}  {/* ✅ Real-time from WebSocket */}
        />
      </div>

      {/* Active auctions table */}
      <AuctionsTable auctions={stats?.auctions} />
    </div>
  )
}

function StatCard({ title, value, loading }) {
  if (loading) {
    return <SkeletonLoaders.StatCardSkeleton />
  }
  return (
    <div className="p-4 border rounded">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
```

**Status:** ⏳ Needs real-time integration

---

### Integration Point 2: Auction Detail Page

**File:** `/src/pages/AuctionDetail.tsx` (or similar)

```typescript
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCountdown } from '../hooks/useServerSyncedCountdown.tsx'
import axios from 'axios'

export function AuctionDetail() {
  const { auctionId } = useParams()
  const [auction, setAuction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuction()
  }, [auctionId])

  const fetchAuction = async () => {
    try {
      const response = await axios.get(`/api/auctions/${auctionId}`)
      setAuction(response.data)
    } catch (err: any) {
      // ✅ FIX R-08: 404 errors handled in App.tsx routing
      if (err.response?.status === 404) {
        // Let ProtectedRoute handle invalid auction ID
        // Redirect to 404 page
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <SkeletonLoaders.AuctionCardSkeleton />
  }

  if (!auction) {
    return <NotFoundPage />
  }

  return (
    <div className="p-4">
      <h1>{auction.title}</h1>
      
      {/* ✅ FIX RT-02: Server-synced countdown timer */}
      <CountdownDisplay endTime={auction.endTime} />

      {/* Bid form */}
      <BidForm auctionId={auctionId} />
    </div>
  )
}

// ✅ Import the countdown display component
import { CountdownDisplay } from '../hooks/useServerSyncedCountdown.tsx'
```

**Status:** ⏳ Needs countdown integration

---

### Integration Point 3: Bid Form

**File:** `/src/components/BidForm.tsx` (new or enhanced)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBidSchema } from '../schemas/formValidation.ts'
import { useWalletStore } from '../stores/walletStore.ts'
import axios from 'axios'

export function BidForm({ auctionId, currentHighest, wallet }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createBidSchema(currentHighest, wallet))
  })

  const onSubmit = async (data) => {
    try {
      await axios.post(`/api/auctions/${auctionId}/bid`, {
        amountCents: data.bidAmount * 100
      }, {
        withCredentials: true  // ✅ FIX S-02: Include httpOnly cookie
      })
      
      // Success message
      toast.success('Bid placed successfully!')
    } catch (err: any) {
      if (err.response?.status === 409) {
        // ✅ FIX RT-01: Race condition - show "Your bid was outbid" message
        toast.error('Your bid was outbid. Please refresh and try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="number"
        placeholder="Enter bid amount"
        {...register('bidAmount')}
      />
      {errors.bidAmount && <p className="text-red-500">{errors.bidAmount.message}</p>}
      
      <button type="submit">Place Bid</button>
    </form>
  )
}
```

**Status:** ⏳ Needs Zod validation integration

---

### Integration Point 4: Auto-Bid Settings

**File:** `/src/components/AutoBidSettings.tsx` (✅ Already created)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { autoBidConfigSchema } from '../schemas/formValidation.ts'
import { useConfirmDialog } from '../hooks/useConfirmDialog.tsx'

export function AutoBidSettings({ auctionId, wallet, currentBid }) {
  const { confirm } = useConfirmDialog()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(autoBidConfigSchema(currentBid, wallet))
  })

  const onSubmit = async (data) => {
    // ✅ FIX F-05: Show confirmation with max bid validation
    const confirmed = await confirm({
      title: 'Enable Auto-Bid',
      message: `Max bid: ₹${data.maxBid}. We'll automatically bid on your behalf up to this amount.`,
      confirmLabel: 'Enable Auto-Bid',
      variant: 'warning'
    })

    if (!confirmed) return

    try {
      await axios.post(`/api/auctions/${auctionId}/auto-bid`, {
        maxBidCents: data.maxBid * 100
      }, {
        withCredentials: true
      })

      toast.success('Auto-bid enabled!')
    } catch (err) {
      // ✅ FIX RT-05: Show rate limit error if too many bids
      if (err.response?.status === 429) {
        toast.error('Rate limit exceeded. Try again in a moment.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border p-4 rounded">
      <h3>Auto-Bid Settings</h3>
      
      <label>
        Max Bid Amount:
        <input
          type="number"
          step="1"
          {...register('maxBid')}
        />
      </label>
      {errors.maxBid && <p className="text-red-500">{errors.maxBid.message}</p>}

      <p className="text-sm text-gray-600 mt-2">
        Current highest: ₹{currentBid}
        <br />
        Your wallet: ₹{wallet}
      </p>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Enable Auto-Bid
      </button>
    </form>
  )
}
```

**Status:** ✅ Already created

---

### Integration Point 5: Add Money Modal

**File:** `/src/components/AddMoneyModal.tsx` (or `/src/pages/AddMoney.tsx`)

```typescript
import { useState } from 'react'
import { useAddMoney } from '../hooks/useAddMoney.ts'
import { useWalletStore } from '../stores/walletStore.ts'
import axios from 'axios'

export function AddMoneyModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('')
  const { addMoney, loading } = useAddMoney()
  const { balance } = useWalletStore()

  const handleAddMoney = async () => {
    try {
      // ✅ FIX F-07/ST-01: Optimistic update
      const result = await addMoney(parseFloat(amount))
      
      if (result.success) {
        setAmount('')
        onClose()
        toast.success(`Successfully added ₹${amount}!`)
      }
    } catch (err) {
      toast.error('Failed to add money')
    }
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded max-w-sm mx-auto mt-20">
        <h2>Add Money to Wallet</h2>
        
        {/* Current balance - will update immediately */}
        <p className="text-lg font-semibold mb-4">
          Current Balance: ₹{balance}
        </p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleAddMoney}
          disabled={loading || !amount}
          className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Add Money'}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 border p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
```

**Status:** ⏳ Needs hook integration

---

### Integration Point 6: Profile Update

**File:** `/src/pages/Profile.tsx` (or similar)

```typescript
import { useProfileUpdate } from '../hooks/useProfileUpdate.ts'
import { useAuthStore } from '../stores/authStore.ts'

export function ProfilePage() {
  const { updateProfile, loading } = useProfileUpdate()
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')

  const handleUpdate = async () => {
    try {
      // ✅ FIX ST-04: Profile name updates immediately in sidebar
      const updated = await updateProfile({ name })
      
      // Update auth store immediately (no page reload needed)
      updateUser(updated)
      
      toast.success('Profile updated!')
    } catch (err) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="p-4">
      <h1>My Profile</h1>
      
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
      />

      <button onClick={handleUpdate} disabled={loading}>
        Update Profile
      </button>
    </div>
  )
}
```

**Status:** ⏳ Needs hook integration

---

### Integration Point 7: Delete Auction

**File:** `/src/components/AuctionManagement.tsx` (or similar)

```typescript
import { useAuctionDelete } from '../hooks/useAuctionDelete.ts'
import { useConfirmDialog } from '../hooks/useConfirmDialog.tsx'

export function AuctionManagement({ auction }) {
  const { deleteAuction, loading } = useAuctionDelete()
  const { confirm } = useConfirmDialog()

  const handleDelete = async () => {
    try {
      // ✅ FIX F-04: Show confirmation with bid count
      const confirmed = await confirm({
        title: 'Delete Auction',
        message: `This auction has ${auction.bidsCount} bids. All bidders will be refunded.`,
        confirmLabel: 'Delete & Refund',
        cancelLabel: 'Cancel',
        variant: 'danger'
      })

      if (!confirmed) return

      const result = await deleteAuction(auction.id)
      
      toast.success(`Auction deleted. ${result.refundedCount} bidders refunded.`)
      // Navigate to dashboard
    } catch (err) {
      toast.error('Failed to delete auction')
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Delete Auction
    </button>
  )
}
```

**Status:** ✅ Hook created and ready

---

### Integration Point 8: Image Upload

**File:** `/src/components/ImageUploadHandler.tsx` (✅ Already created)

Usage in any form:

```typescript
import { ImageUploadHandler, ImagePreview } from '../components/ImageUploadHandler.tsx'

export function CreateAuctionForm() {
  const [image, setImage] = useState(null)

  return (
    <form>
      {/* ✅ FIX V-08/V-09: Image validation before upload */}
      <ImageUploadHandler onImageSelect={setImage} />
      
      {image && (
        <ImagePreview 
          src={image.preview}
          onRemove={() => setImage(null)}
        />
      )}

      <button type="submit">Create Auction</button>
    </form>
  )
}
```

**Status:** ✅ Already created

---

### Integration Point 9: Responsive Table

**File:** Any page with tables

```typescript
import { ResponsiveTable } from '../components/ResponsiveTable.tsx'

export function MyAuctionsPage() {
  const [auctions, setAuctions] = useState([])

  return (
    <div>
      {/* ✅ FIX 23: Mobile-friendly table with horizontal scroll */}
      <ResponsiveTable>
        <table className="w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Current Bid</th>
              <th>Ends In</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map(auction => (
              <tr key={auction.id}>
                <td>{auction.title}</td>
                <td>₹{auction.currentBid}</td>
                <td>{formatTimeLeft(auction.endTime)}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>
    </div>
  )
}
```

**Status:** ✅ Already created

---

### Integration Point 10: Mobile Sidebar

**File:** `/src/layouts/Layout.tsx` (or main layout component)

```typescript
import { MobileSidebar, useMobileSidebar } from '../components/MobileSidebar.tsx'

export function MainLayout({ children }) {
  const { isOpen, close } = useMobileSidebar()

  return (
    <div className="flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-gray-900 text-white">
        <SidebarContent />
      </aside>

      {/* ✅ FIX 22: Mobile sidebar with backdrop */}
      <MobileSidebar isOpen={isOpen} onClose={close}>
        <SidebarContent />
      </MobileSidebar>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
```

**Status:** ✅ Already created

---

### Integration Point 11: Countdown Timer

**File:** Any component showing auction time

```typescript
import { useServerSyncedCountdown, CountdownDisplay } from '../hooks/useServerSyncedCountdown.tsx'

export function AuctionCard({ auction }) {
  return (
    <div className="border p-4">
      <h3>{auction.title}</h3>
      
      {/* ✅ FIX RT-02: Never drifts, even if tab inactive */}
      <CountdownDisplay endTime={auction.endTime} />
      
      <p>Current bid: ₹{auction.currentBid}</p>
    </div>
  )
}
```

**Status:** ✅ Already created

---

## Part 4: Global Validation Setup

### Zod Schemas

**File:** `/src/schemas/formValidation.ts` (✅ Already created)

Import and use in any form:

```typescript
import { bidFormSchema, autoBidConfigSchema, auctionFormSchema } from '../schemas/formValidation.ts'

// In a form component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(bidFormSchema)
})
```

**Status:** ✅ Already created

---

## Part 5: Confirmation Dialogs

**File:** Any destructive action

```typescript
import { useConfirmDialog } from '../hooks/useConfirmDialog.tsx'

function MyComponent() {
  const { confirm } = useConfirmDialog()

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger'  // 'default', 'warning', or 'danger'
    })

    if (confirmed) {
      await deleteItem()
    }
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

**Status:** ✅ Already created

---

## Integration Checklist

### Phase 1: Global Setup (Already Done)
- [x] Update main.tsx with axiosInterceptor and ConfirmDialogProvider
- [x] Update App.tsx with role-based routing and 404 handling
- [x] Verify build passes

### Phase 2: Dashboard & Real-Time (Priority 1)
- [ ] Add useDashboardRealTime hook to Dashboard page
- [ ] Add CountdownDisplay component to auction cards
- [ ] Add SkeletonLoaders while data loading
- [ ] Test WebSocket connection and real-time updates

### Phase 3: User Actions (Priority 2)
- [ ] Add useAuctionDelete hook to auction management
- [ ] Add useProfileUpdate hook to profile page  
- [ ] Add useAddMoney hook to wallet/deposit page
- [ ] Add BidForm with Zod validation

### Phase 4: Forms & Validation (Priority 3)
- [ ] Import formValidation schemas in all forms
- [ ] Add ImageUploadHandler to product creation
- [ ] Add AutoBidSettings component
- [ ] Test form validation messages

### Phase 5: Mobile & UX (Priority 4)
- [ ] Add MobileSidebar to main layout
- [ ] Wrap tables with ResponsiveTable component
- [ ] Test at 320px width
- [ ] Verify no overflow on mobile

### Phase 6: Testing & Polish (Priority 5)
- [ ] Test 401 refresh flow (remove token cookie, refresh page)
- [ ] Test race conditions (two simultaneous bids)
- [ ] Test rate limiting (place 10 bids quickly)
- [ ] Test profile updates sync to sidebar
- [ ] Test logout clears state

---

## Import Reference

Quick copy-paste for all hooks and components:

```typescript
// Hooks
import { useConfirmDialog } from '../hooks/useConfirmDialog.tsx'
import { useDashboardRealTime } from '../hooks/useDashboardRealTime.ts'
import { useServerSyncedCountdown, CountdownDisplay } from '../hooks/useServerSyncedCountdown.tsx'
import { useProfileUpdate } from '../hooks/useProfileUpdate.ts'
import { useAddMoney } from '../hooks/useAddMoney.ts'
import { useAuctionDelete } from '../hooks/useAuctionDelete.ts'

// Components
import { SkeletonLoaders } from '../components/SkeletonLoaders.tsx'
import { MobileSidebar, useMobileSidebar } from '../components/MobileSidebar.tsx'
import { ResponsiveTable } from '../components/ResponsiveTable.tsx'
import { ImageUploadHandler, ImagePreview } from '../components/ImageUploadHandler.tsx'
import ProtectedRoute from '../components/ProtectedRoute'
import NotFoundPage from '../pages/NotFoundPage'

// Stores
import { useAuthStore } from '../stores/authStore.ts'
import { useWalletStore } from '../stores/walletStore.ts'

// Utils
import { setupAxiosInterceptors } from '../utils/axiosInterceptor.ts'
import { AuctionSocketManager } from '../utils/auctionSocket.ts'

// Schemas
import { 
  bidFormSchema, 
  autoBidConfigSchema, 
  auctionFormSchema, 
  imageValidationSchema 
} from '../schemas/formValidation.ts'

// Providers (in main.tsx)
import { ConfirmDialogProvider } from '../hooks/useConfirmDialog.tsx'
```

---

## Common Integration Patterns

### Pattern 1: Form with Validation + Confirmation + API Call

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { autoBidConfigSchema } from '../schemas/formValidation.ts'
import { useConfirmDialog } from '../hooks/useConfirmDialog.tsx'
import axios from 'axios'

export function AutoBidForm({ auction, wallet }) {
  const { confirm } = useConfirmDialog()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(autoBidConfigSchema(auction.currentBid, wallet))
  })

  const onSubmit = async (data) => {
    // 1. Validate (Zod schema already did this)
    // 2. Show confirmation
    const ok = await confirm({
      title: 'Enable Auto-Bid',
      message: `Max bid: ₹${data.maxBid}`,
      variant: 'warning'
    })
    
    if (!ok) return

    // 3. Call API
    try {
      await axios.post(`/api/auto-bids`, data)
      // 4. Update UI
      toast.success('Auto-bid enabled!')
    } catch (err) {
      // 5. Error handling
      if (err.response?.status === 429) {
        toast.error('Rate limited')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('maxBid')} />
      {errors.maxBid && <p>{errors.maxBid.message}</p>}
      <button type="submit">Enable</button>
    </form>
  )
}
```

### Pattern 2: Real-Time Updates + Skeleton Loader

```typescript
import { useEffect, useState } from 'react'
import { useDashboardRealTime } from '../hooks/useDashboardRealTime.ts'
import { SkeletonLoaders } from '../components/SkeletonLoaders.tsx'
import axios from 'axios'

export function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { totalBids } = useDashboardRealTime()  // Real-time

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/dashboard')
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <SkeletonLoaders.DashboardSkeleton />

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Bids: {totalBids}</p> {/* Updates live */}
    </div>
  )
}
```

---

## Testing Checklist

- [ ] Login works, token in httpOnly cookie (check DevTools > Application > Cookies)
- [ ] Logout clears cookies and state
- [ ] 401 response triggers automatic refresh (DevTools > Network)
- [ ] Real-time bid updates appear on dashboard
- [ ] Countdown timer syncs with server time (never drifts)
- [ ] Mobile sidebar shows at 320px
- [ ] Form validation messages appear instantly
- [ ] Delete confirmation dialog shows bid count
- [ ] Wallet balance updates immediately after deposit
- [ ] Profile name updates in sidebar without reload
- [ ] 404 page shows for invalid auction IDs
- [ ] Image upload rejects non-image files
- [ ] Rate limit shows "Please try again" after 5 bids
- [ ] Tab inactive for 10 minutes → countdown still correct

---

## Troubleshooting

**Problem:** Countdown always shows 0:00
- Check: Is `endTime` a valid ISO string from backend?
- Fix: Ensure backend returns `endTime` as ISO string

**Problem:** Real-time updates not showing
- Check: Is WebSocket connected? (DevTools > Network > WS)
- Fix: Verify `useDashboardRealTime()` subscription exists

**Problem:** 401 redirect loop
- Check: Is refresh token valid?
- Fix: Clear cookies and re-login

**Problem:** Rate limit not working
- Check: Is bidRateLimiter middleware applied in backend?
- Fix: Verify middleware is imported and used

**Problem:** Mobile sidebar not showing
- Check: Is viewport at 320px? Resize DevTools
- Fix: Ensure `@media (max-width: 640px)` styling exists

