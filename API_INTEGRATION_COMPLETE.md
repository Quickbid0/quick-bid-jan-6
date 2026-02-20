# 🔌 COMPLETE API INTEGRATION GUIDE

**Status**: Production-ready code provided  
**Files Created**: 2  
**Time to Integrate**: 1-2 hours

---

## 📦 WHAT YOU NOW HAVE

### 1. **useDashboardAPIs.ts** (500+ lines)
Complete API hooks for all 4 dashboards:
- `useBuyerDashboard(userId)` - Fetch buyer data
- `useSellerDashboard(userId)` - Fetch seller data
- `useDealerDashboard(userId)` - Fetch dealer data
- `useAdminDashboard(adminId)` - Fetch admin data
- Built-in error handling, loading states, refetch
- Full TypeScript types for all API responses

### 2. **DashboardsWithAPI.tsx** (900+ lines)
Updated dashboard components:
- `BuyerDashboardWithAPI` - Uses hook instead of mock data
- `SellerDashboardWithAPI` - Uses hook instead of mock data
- `DealerDashboardWithAPI` - Uses hook instead of mock data
- `AdminDashboardWithAPI` - Uses hook instead of mock data
- Built-in loading screens and error handling
- Refresh button for manual data refresh
- Ready to connect to real APIs

---

## 🚀 QUICK START (5 MINUTES)

### Step 1: Copy Files
```bash
# File structure after copying:
src/
├── hooks/
│   └── useDashboardAPIs.ts          # New file
├── pages/
│   ├── DashboardsWithAPI.tsx        # New file
│   ├── BuyerDashboardRedesigned.tsx # Already exists
│   ├── SellerDashboardRedesigned.tsx
│   ├── DealerDashboardRedesigned.tsx
│   └── AdminDashboardRedesigned.tsx
└── ... (rest of your app)
```

### Step 2: Update Route Component
**OLD** (using mock data):
```tsx
<Route path="/dashboard/buyer" element={
  <FeatureGate flag="dashboard_buyer_v2">
    <BuyerDashboardRedesigned />
  </FeatureGate>
} />
```

**NEW** (using real API):
```tsx
import { BuyerDashboardWithAPI } from '@/pages/DashboardsWithAPI';

<Route path="/dashboard/buyer" element={
  <FeatureGate flag="dashboard_buyer_v2">
    <BuyerDashboardWithAPI userId={user.id} />
  </FeatureGate>
} />
```

### Step 3: Set API URL
```bash
# In your .env file:
REACT_APP_API_URL=http://localhost:3001/api
# (or your production API URL)
```

### Step 4: Test In Browser
```
1. Navigate to /dashboard/buyer
2. Should show loading spinner
3. Then show real data from API
4. Click refresh button to re-fetch
```

✅ **Done! Now it's using real APIs instead of mock data**

---

## 🔌 API ENDPOINTS REQUIRED

Your backend needs these endpoints:

### Buyer Dashboard
```
GET /api/buyers/{userId}/dashboard
Response:
{
  user: { id, name, walletBalance },
  activeBids: [...],
  wonAuctions: [...],
  stats: { activeCount, wonCount, winRate },
  recommendations: [...],
  spending: { thisWeek, thisMonth, thisYear, chartData }
}
```

### Seller Dashboard
```
GET /api/sellers/{userId}/dashboard
Response:
{
  seller: { id, shopName, rating, responseTime, totalSales, goldBadge },
  analytics: { monthlyRevenue, rating, responseTime, activeListings, newOrders, pendingShipments },
  products: [...],
  liveAuctions: [...],
  feedback: [...],
  performance: { chartData }
}
```

### Dealer Dashboard
```
GET /api/dealers/{userId}/dashboard
Response:
{
  dealer: { id, companyName, vehicleCount, monthlyRevenue, conversionRate },
  inventory: { totalVehicles, activeAuctions, soldThisMonth, pendingApproval },
  vehicles: [...],
  commissions: { pending, pendingCount, paid, paidCount, chartData },
  categoryPerformance: [...]
}
```

### Admin Dashboard
```
GET /api/admin/{adminId}/dashboard
Response:
{
  alerts: [...],
  systemHealth: { apiStatus, dbStatus, paymentStatus, storageStatus, lastChecked },
  businessMetrics: { gmvToday, activeAuctions, completedToday, totalUsers, chartData },
  pendingApprovals: [...],
  disputes: [...]
}
```

See `UI_UX_REDESIGN_IMPLEMENTATION_GUIDE.md` for full API specifications.

---

## 🧠 HOW IT WORKS

### Hook Pattern
```typescript
// In your component
const { data, loading, error, refetch } = useBuyerDashboard(userId);

// Automatically handles:
// ✓ Loading state (spinner shown while fetching)
// ✓ Error state (error shown with retry button)
// ✓ Data fetching (calls API on mount)
// ✓ Refetching (refetch() function to manually refresh)
```

### Data Flow
```
User navigates to /dashboard/buyer
         ↓
Component mounts (BuyerDashboardWithAPI)
         ↓
Hook runs (useBuyerDashboard)
         ↓
API call made to /api/buyers/{userId}/dashboard
         ↓
Loading state shown (spinner)
         ↓
API response received
         ↓
Data state updated
         ↓
Component re-renders with real data
```

### Error Handling
```typescript
// If API fails:
const { error } = useBuyerDashboard(userId);

if (error) {
  // Show error state with retry button
  return <ErrorState error={error} onRetry={refetch} />;
}
```

### Refetching
```typescript
// User clicks refresh button
<button onClick={refetch}>Refresh</button>

// Automatically:
// 1. Sets loading = true (shows spinner)
// 2. Calls API again
// 3. Updates data
// 4. Sets loading = false (hides spinner)
```

---

## 🔄 API CLIENT FEATURES

### 1. Automatic Timeout
```typescript
// Requests timeout after 10 seconds by default
const response = apiClient.get('/endpoint');
// If API doesn't respond in 10s, request aborted
```

### 2. Error Handling
```typescript
// Any API error is caught and shown to user
try {
  await apiClient.get('/endpoint');
} catch (error) {
  // Network error, server error, timeout, etc.
  // All handled gracefully
}
```

### 3. Type Safety
```typescript
// Full TypeScript support
const data = await apiClient.get<BuyerDashboardData>('/endpoint');
// TypeScript knows data has all BuyerDashboardData properties
```

### 4. Retry Mechanism
```typescript
// User sees error with retry button
<button onClick={refetch}>Try Again</button>

// When clicked, API is called again automatically
```

---

## ⚙️ CUSTOMIZATION

### Change API Base URL
```typescript
// In useDashboardAPIs.ts
const apiClient = new APIClient(
  'https://your-api.com/api', // Change this
  10000 // timeout in ms
);
```

### Add Authentication Token
```typescript
// In APIClient.request(), add headers:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`, // Add this
  ...options.headers,
}
```

### Add Request Interceptor
```typescript
// Before API call
private async request<T>(endpoint: string, options: RequestInit = {}) {
  // Add custom logic here
  console.log('Calling API:', endpoint);
  
  const response = await fetch(url, ...);
  
  // Add custom logic after
  console.log('API response:', response);
}
```

---

## 🧪 TESTING THE INTEGRATION

### Test 1: Component Loads
```bash
1. Navigate to /dashboard/buyer
2. See loading spinner for 1-2 seconds
3. Real data appears
```

### Test 2: Error Handling
```bash
1. Stop backend API server
2. Navigate to /dashboard/buyer
3. Should show error state
4. Click "Try Again" button
5. Retry should work (when API is back)
```

### Test 3: Refetch Works
```bash
1. Dashboard loaded with data
2. Click refresh button (🔄)
3. See loading spinner briefly
4. Data updates
```

### Test 4: Real Data Shows
```bash
1. Check browser Network tab
2. Verify API calls to /api/buyers/{userId}/dashboard
3. Verify response has expected structure
4. Verify data matches what's displayed
```

---

## 🚨 COMMON ISSUES

### Issue 1: "Failed to load dashboard - Network Error"
**Cause**: Backend API not running or wrong URL  
**Solution**:
```bash
# Check REACT_APP_API_URL in .env
# Verify backend is running
# Test API manually: curl http://localhost:3001/api/buyers/{id}/dashboard
```

### Issue 2: "API error: 401 Unauthorized"
**Cause**: Authentication not working  
**Solution**:
```typescript
// Add bearer token to APIClient.request():
headers: {
  'Authorization': `Bearer ${authToken}`,
  ...
}
```

### Issue 3: "Timeout waiting for API response"
**Cause**: Backend taking too long  
**Solution**:
```typescript
// Increase timeout in APIClient constructor:
new APIClient(baseURL, 30000) // 30 seconds
```

### Issue 4: Endless loading spinner
**Cause**: API response doesn't match expected type  
**Solution**:
```typescript
// Check API response matches BuyerDashboardData type
// Use browser DevTools Network tab to see response
// Make sure all required fields are present
```

---

## 📊 MONITORING & LOGGING

### Enable Debug Logging
```typescript
// In APIClient.request()
console.log('Calling:', endpoint);
const response = await fetch(...);
console.log('Response:', response);
return await response.json();
```

### Track API Calls
```typescript
// In each hook, add analytics tracking:
const fetchData = useCallback(async () => {
  analytics.track('api_call', { endpoint: '/buyers/{userId}/dashboard' });
  ...
}, []);
```

### Monitor Performance
```typescript
// Measure API response time:
const startTime = Date.now();
const data = await apiClient.get(...);
const duration = Date.now() - startTime;
console.log('API took', duration, 'ms');
```

---

## 🔄 MIGRATION PATH

### Day 1: Integration
- [ ] Copy useDashboardAPIs.ts to src/hooks/
- [ ] Copy DashboardsWithAPI.tsx to src/pages/
- [ ] Update routes to use new components
- [ ] Test in staging environment

### Day 2: Validation
- [ ] Verify API endpoints respond with correct data
- [ ] Test error scenarios (API down, slow network)
- [ ] Test on different devices/browsers
- [ ] Performance testing (page load time)

### Day 3: Deployment
- [ ] Deploy to production
- [ ] Enable feature flag at 5% rollout
- [ ] Monitor error rates and performance
- [ ] Scale up rollout week by week

---

## 📝 FILE CHECKLIST

```
✓ src/hooks/useDashboardAPIs.ts
  └─ Contains: API client, 4 hooks, types, mutations

✓ src/pages/DashboardsWithAPI.tsx
  └─ Contains: 4 dashboard components with API integration
  └─ Contains: LoadingSpinner, ErrorState components

✓ .env or .env.local
  └─ Contains: REACT_APP_API_URL

✓ App.tsx or Routes.tsx
  └─ Updated routes to use new components
  └─ Wrapped with FeatureFlagsProvider
  └─ Uses FeatureGate for each dashboard
```

---

## 🎯 NEXT STEPS

1. **Copy the 2 files** to your project
2. **Update your .env** with API URL
3. **Update your routes** to use new components
4. **Build your backend** endpoints per specs
5. **Test in staging** (Day 1-2)
6. **Deploy to production** (Day 3+)
7. **Enable feature flags** at 5% rollout
8. **Monitor metrics** and scale up per FEATURE_FLAG_DEPLOYMENT_GUIDE.md

---

## ❓ QUESTIONS?

**Q: What if my API returns data in different format?**  
A: Update the TypeScript types in useDashboardAPIs.ts to match your API response.

**Q: Can I use my existing API client?**  
A: Yes, replace APIClient with your own client, no other changes needed.

**Q: How do I add pagination?**  
A: Add offset/limit params to API endpoint, update types, refetch with new params.

**Q: How do I add real-time updates?**  
A: Use WebSocket in useEffect to listen for changes, call refetch when data updates.

**Q: How do I cache API responses?**  
A: Add cache map in APIClient, check cache before calling fetch.

---

**You're all set! 🚀**

The dashboards now work with real data. Start with Day 1 of the INTEGRATION_CHECKLIST and deploy to staging today.
