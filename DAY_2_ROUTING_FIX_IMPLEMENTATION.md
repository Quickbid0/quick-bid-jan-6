# DAY 2 ROUTING FIX - IMPLEMENTATION GUIDE

## Problem Diagnosis

**Navigation is missing after seller login at http://localhost:5179/dashboard**

Root causes identified in UIAudit.ts:
- Dashboard renders without layout wrapper (CRIT-002)
- Routes not properly nested under layout provider (CRIT-001)
- Auth state lost on refresh (CRIT-006)
- Sidebar disappears on page refresh (CRIT-003)

---

## Solution Overview

This guide provides 4 core components to fix navigation:

| File | Purpose | Status |
|------|---------|--------|
| **ProtectedRoute.tsx** | Auth guard + layout enforcer | ✅ Created |
| **RoleGuard.tsx** | Role detector + layout selector | ✅ Created |
| **AuthContext.tsx** | Auth state persistence | ✅ Exists (enhanced) |
| **BuyerLayout.tsx** through **AdminLayout.tsx** | Role-specific layouts | ✅ Created |
| **AppRouter.tsx** | Complete routing config | ✅ Created |

---

## Installation Steps

### Step 1: Update Your Main App Entry Point

Find your main `App.tsx` or `main.tsx` file and replace the current router setup:

**BEFORE (Current - BROKEN):**
```tsx
// App.tsx - Current broken structure
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />  // ❌ No layout!
        <Route path="/dashboard/auctions" element={<Auctions />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**AFTER (Fixed - WORKING):**
```tsx
// App.tsx - Fixed structure with layouts
import AppRouter from '@/routes/AppRouter';

export default function App() {
  return <AppRouter />;
}
```

### Step 2: Verify File Structure

Ensure these files exist in your project:

```
src/
├── routes/
│   ├── ProtectedRoute.tsx        ✅ Created
│   ├── RoleGuard.tsx             ✅ Created
│   └── AppRouter.tsx             ✅ Created
├── layouts/
│   ├── BuyerLayout.tsx           ✅ Created
│   ├── SellerLayout.tsx          ✅ Created
│   ├── DealerLayout.tsx          ✅ Created
│   ├── CompanyLayout.tsx         ✅ Created
│   ├── AdminLayout.tsx           ✅ Created
│   ├── TopBar.tsx                ⏳ Create these
│   └── Sidebar.tsx               ⏳ Create these
└── context/
    └── AuthContext.tsx           ✅ Exists
```

### Step 3: Create TopBar Component

**File:** `src/components/layout/TopBar.tsx`

```tsx
interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ sidebarOpen, onToggleSidebar }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 flex items-center px-6 z-40">
      <button
        onClick={onToggleSidebar}
        className="text-gray-600 hover:text-gray-900"
      >
        Menu
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.name}</span>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
```

### Step 4: Create Sidebar Component

**File:** `src/components/layout/Sidebar.tsx`

```tsx
import { Link } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  active: boolean;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  items: NavItem[];
  onClose: () => void;
  title: string;
}

export function Sidebar({ isOpen, items, title }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      <nav className="p-4 space-y-2">
        {items.map(item => (
          <Link
            key={item.id}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              item.active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs font-semibold text-gray-600">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

---

## How It Works - The Fix

### Before (Broken - No Layout)
```
Route: /dashboard/auctions
  Components:
    <Dashboard>
      <Auctions />  ← Renders directly, no sidebar!
    </Dashboard>

Result: Missing navigation, sidebar doesn't exist
```

### After (Fixed - With Layout)
```
Route: /dashboard/auctions
  Components:
    <ProtectedRoute> ← Checks auth
      <RoleGuard> ← Detects role = "seller"
        <SellerLayout> ← Renders sidebar + topbar
          <Auctions /> ← Page content
        </SellerLayout>
      </RoleGuard>
    </ProtectedRoute>

Result: Navigation always visible, sidebar stable
```

---

## Key Fixes Provided

### 1. Layout Always Wraps Content
- Previously: Dashboard rendered alone
- Now: Every page wrapped in role-specific layout
- Effect: Sidebar and topbar always visible

### 2. Auth Persists on Refresh
- Previously: Auth state lost on refresh → user logged out
- Now: AuthContext reads token from localStorage on mount
- Effect: User stays logged in after refresh

### 3. Role-Based Navigation
- Previously: All users see same navigation
- Now: Each role gets 8 nav items tailored to their needs
- Effect: Sellers don't see buyer-only features

### 4. Direct URL Access Works
- Previously: `/dashboard/auctions` broken layout
- Now: Any route still gets proper layout
- Effect: Bookmarked links work correctly

### 5. Sidebar Survives Refresh
- Previously: Sidebar disappears on refresh
- Now: Sidebar state managed by layout component
- Effect: Navigation context preserved

---

## Testing the Fix

### Test 1: Login and Browse
```
1. Go to http://localhost:5179/login
2. Login as seller
3. Should see SellerLayout with sidebar
4. Click on "My Auctions"
5. Sidebar should stay visible ✅
```

### Test 2: Direct URL Access
```
1. Paste http://localhost:5179/dashboard/my-auctions directly in address bar
2. Should still see SellerLayout with sidebar ✅
3. Should NOT see buyer-only pages ✅
```

### Test 3: Refresh Doesn't Logout
```
1. Login as buyer
2. Go to http://localhost:5179/dashboard/my-bids
3. Press Ctrl+R (refresh)
4. Should still be logged in ✅
5. Sidebar should still be visible ✅
```

### Test 4: Role Isolation
```
1. Login as seller
2. Try to access buyer page: /dashboard (should redirect to /dashboard/my-auctions)
3. Try to manually access admin path: /dashboard/admin → should get 403 Unauthorized ✅
```

---

## Migration Checklist

Before next phase (Day 3: Information Architecture), verify:

- [ ] All 5 layout files created
- [ ] ProtectedRoute.tsx guards authentication
- [ ] RoleGuard.tsx applies correct layout
- [ ] AppRouter.tsx is the main router
- [ ] TopBar.tsx and Sidebar.tsx created
- [ ] App.tsx imports AppRouter instead of BrowserRouter
- [ ] Test login → sidebar visible
- [ ] Test refresh → stays logged in
- [ ] Test direct URL → layout preserved
- [ ] Test role isolation → can't access other roles

---

## Next Steps (Day 3)

Once this routing fix is confirmed working:

**Priority**: Information Architecture
- Reduce navigation to max 8 items per role
- Rename "Escrow Transactions" → "Settlement"
- Group related features together
- Hide advanced features from new users

**Files to create**: 
- Navigation configuration files
- Info architecture documentation

---

## Debugging Tips

### Issue: "Navigation missing after login"
**Check**: Is ProtectedRoute wrapping your routes?
```tsx
<ProtectedRoute>
  <RoleGuard>
    <YourPage />
  </RoleGuard>
</ProtectedRoute>
```

### Issue: "Sidebar disappears on refresh"
**Check**: Is AuthContext hydrating from localStorage?
```tsx
const { isLoading } = useAuth();
// Should be false after initial load
```

### Issue: "Can access pages without logging in"
**Check**: Is `/dashboard/*` wrapped in ProtectedRoute?
```tsx
<Route
  path="/dashboard/auctions"
  element={
    <ProtectedRoute>  ← Missing this?
      <Page />
    </ProtectedRoute>
  }
/>
```

### Issue: "All users see same navigation"
**Check**: Is RoleGuard wrapping content?
```tsx
<ProtectedRoute>
  <RoleGuard>  ← If missing, all see same layout
    <Page />
  </RoleGuard>
</ProtectedRoute>
```

---

## File Sizes (For Reference)

| File | Lines | Purpose |
|------|-------|---------|
| ProtectedRoute.tsx | 95 | Auth guard |
| RoleGuard.tsx | 120 | Layout selector |
| BuyerLayout.tsx | 80 | Buyer UI |
| SellerLayout.tsx | 100 | Seller UI |
| DealerLayout.tsx | 90 | Dealer UI |
| CompanyLayout.tsx | 100 | Company UI |
| AdminLayout.tsx | 100 | Admin UI |
| AppRouter.tsx | 350 | Complete routes |
| **Total** | **~1,035 lines** | **Full routing system** |

---

## Success Criteria

✅ **Navigation visible after login**
✅ **Sidebar persists on page refresh**
✅ **Role-based pages properly guarded**
✅ **Direct URL access shows correct layout**
✅ **Auth state survives page reload**
✅ **Logout clears all state**

**When all checks pass: Day 2 complete, ready for Day 3**

---

Generated: Day 2 of 7-Day UI Stabilization Plan
Status: Implementation guide for routing fix
Next Phase: Information Architecture (Day 3)
