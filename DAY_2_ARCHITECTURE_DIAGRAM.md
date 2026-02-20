# DAY 2 ARCHITECTURE DIAGRAM

## Complete Routing System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APP.tsx (Entry Point)                         │
│                                                                       │
│            <AppRouter />                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  AppRouter.tsx (BrowserRouter)                       │
│                                                                       │
│   ├─ <AuthProvider>  [Provides auth context & localStorage]         │
│   │   ├─ <BrowserRouter>                                            │
│   │   │   └─ <Routes>                                              │
│   │   │       ├─ /login (LoginPage)         [Public]               │
│   │   │       ├─ /signup (SignupPage)       [Public]               │
│   │   │       │                                                      │
│   │   │       └─ /dashboard/* (Protected)                          │
│   │   │           ├─ <ProtectedRoute>  [Checks auth]               │
│   │   │           │   └─ <RoleGuard>   [Selects layout]            │
│   │   │           │       ├─ BuyerLayout (if role='buyer')         │
│   │   │           │       ├─ SellerLayout (if role='seller')       │
│   │   │           │       ├─ DealerLayout (if role='dealer')       │
│   │   │           │       ├─ CompanyLayout (if role='company')     │
│   │   │           │       └─ AdminLayout (if role='admin')         │
│   │   │           │           │                                     │
│   │   │           │           └─ Page Component                    │
│   │   │           │               (Auctions, MyBids, etc.)         │
│   │   │           │                                                 │
│   │   │           └─ [If auth fails]                              │
│   │   │               └─ Redirect to /login                        │
│   │   │                                                             │
│   │   └─ [If role check fails]                                    │
│   │       └─ UnauthorizedScreen                                    │
│   │                                                                 │
│   └─ [Loading auth from localStorage]                             │
│       └─ LoadingScreen                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy Per Route

### Example: Seller at /dashboard/my-auctions

```
AppRouter
├── AuthProvider (provides user, token, login, logout)
│    ├── BrowserRouter
│    │    └── Routes
│    │         └── Route: /dashboard/my-auctions
│    │              └── ProtectedRoute (checks auth)
│    │                   └── RoleGuard (detects role="seller")
│    │                        └── SellerLayout
│    │                             ├── TopBar
│    │                             │    ├── Menu toggle button
│    │                             │    ├── User name display
│    │                             │    └── Logout button
│    │                             ├── Sidebar
│    │                             │    ├── "List Product"
│    │                             │    ├── "My Auctions" ← active
│    │                             │    ├── "Browse Auctions"
│    │                             │    ├── "Ratings"
│    │                             │    ├── "Settlement"
│    │                             │    ├── "Analytics"
│    │                             │    ├── "Help"
│    │                             │    └── "Settings"
│    │                             └── Main Content Area
│    │                                  └── MyAuctions Page
│    │                                       ├── List of auctions
│    │                                       ├── Search bar
│    │                                       ├── Filter options
│    │                                       └── Edit/Delete buttons
```

---

## Data Flow: Login → Dashboard

```
STEP 1: User logs in
  └─ signIn() in AuthContext
      └─ POST /api/auth/login
          └─ Returns { accessToken, refreshToken, user }
              └─ Saves to localStorage
                  ├─ localStorage.setItem('accessToken', token)
                  ├─ localStorage.setItem('refreshToken', token)
                  └─ localStorage.setItem('user', JSON.stringify(user))
                      └─ Calls setUser(userData)
                          └─ Updates React state

STEP 2: User navigates to /dashboard/my-auctions
  └─ ProtectedRoute checks auth
      ├─ Reads localStorage.getItem('authToken')
      ├─ If exists: continues
      └─ If missing: redirects to /login

STEP 3: RoleGuard detects role
  └─ Reads user.role from state
      ├─ If "seller": render SellerLayout
      ├─ If "buyer": render BuyerLayout
      ├─ If "admin": render AdminLayout
      └─ etc.

STEP 4: SellerLayout renders
  └─ TopBar with user menu and logout
  └─ Sidebar with 8 seller-specific nav items
  └─ Main content area with MyAuctions page
      └─ Users can click nav items, sidebar stays visible

STEP 5: User refreshes page (Ctrl+R)
  └─ App restarts
      └─ AuthContext checks localStorage on mount
          ├─ Reads localStorage.getItem('user')
          ├─ Reads localStorage.getItem('accessToken')
          └─ If both exist: hydrates auth state immediately
              └─ User still logged in ✅
                  └─ Layout still visible ✅
```

---

## Auth State Management

```
┌────────────────────────────────────────────────┐
│         AuthContext State                       │
│                                                 │
│  user: {                                       │
│    id: "seller-123",                          │
│    email: "seller@example.com",               │
│    name: "John Seller",                       │
│    role: "seller",  ← KEY: Used by RoleGuard │
│    wallet_balance: 50000,                     │
│    is_verified: true                          │
│  }                                             │
│                                                 │
│  token: "eyJhbGc..."  ← API authentication   │
│  isAuthenticated: true                        │
│  loading: false                               │
└────────────────────────────────────────────────┘
        │
        ├─ Persisted to localStorage
        │  ├─ localStorage['user']
        │  ├─ localStorage['accessToken']
        │  └─ localStorage['refreshToken']
        │
        └─ Used by components
           ├─ ProtectedRoute (checks existence)
           ├─ RoleGuard (reads role)
           ├─ TopBar (shows user name)
           └─ BuyerLayout (shows wallet balance as badge)
```

---

## Role-to-Layout Mapping

```
Role         → Layout Component    → Nav Items (max 8)
─────────────────────────────────────────────────────

BUYER        → BuyerLayout         ├─ Browse Auctions
                                   ├─ My Bids
                                   ├─ Watchlist
                                   ├─ Wallet
                                   ├─ Activity
                                   ├─ Help & Support
                                   └─ Settings

SELLER       → SellerLayout        ├─ List Product
                                   ├─ My Auctions
                                   ├─ Browse Auctions
                                   ├─ Ratings
                                   ├─ Settlement
                                   ├─ Analytics
                                   ├─ Help & Support
                                   └─ Settings

DEALER       → DealerLayout        ├─ Inventory
                                   ├─ Bulk List
                                   ├─ Active Auctions
                                   ├─ Insights
                                   ├─ Settlement
                                   ├─ Performance
                                   ├─ Help & Support
                                   └─ Settings

COMPANY      → CompanyLayout       ├─ Team
                                   ├─ Inventory
                                   ├─ Active Auctions
                                   ├─ Reports
                                   ├─ Settlement
                                   ├─ Compliance
                                   ├─ Help & Support
                                   └─ Settings

ADMIN        → AdminLayout         ├─ Dashboard
                                   ├─ Users
                                   ├─ Moderation
                                   ├─ Analytics
                                   ├─ Disputes
                                   ├─ System Settings
                                   ├─ Audit Log
                                   └─ Help & Support
```

---

## ProtectedRoute Decision Tree

```
User navigates to /dashboard/my-auctions
                          │
                          ▼
            ┌─────────────────────────┐
            │ ProtectedRoute mounted  │
            └────────┬────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │ Check: Auth loading?     │
         └──────┬─────────┬──────────┘
                │         │
            YES │         │ NO
                ▼         ▼
          Show         ┌─────────────┐
          Loading      │ Check: Is   │
          Screen       │ authenticated?
                       └──┬─────┬────┘
                          │     │
                      NO  │     │ YES
                          ▼     ▼
                       Redirect ┌──────┐
                       to /login│ Check│
                                │ role │
                                └─┬─┬──┘
                                  │ │
                    Has || DON'T  │ │ Has
                    require       │ │ require
                    correct       ▼ ▼
                    role    ┌────────┐
                       │    │ Render │
                       │    │ page   │
                       │    └────────┘
                       │
                       ▼
                    ┌──────────┐
                    │ Show 403 │
                    │Unauthorized
                    └──────────┘
```

---

## Mobile Responsive Behavior

```
┌────────────────────────────────────────────────┐
│          DESKTOP (> 768px width)               │
├────────────────────────────────────────────────┤
│
│  ┌─────────────  TopBar ──────────────────┐
│  │ Menu  [Spacer]  User  Logout           │
│  └────────────────────────────────────────┘
│  ┌──────────┐ ┌──────────────────────────┐
│  │ Sidebar  │ │                          │
│  │ 64px     │ │   Main Content Area      │
│  │ (open)   │ │                          │
│  │          │ │   PageComponent renders  │
│  │ [items]  │ │   here...                │
│  │          │ │                          │
│  │          │ │                          │
│  └──────────┘ └──────────────────────────┘
│
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│          MOBILE (< 768px width)                │
├────────────────────────────────────────────────┤
│
│  ┌─────────────  TopBar ──────────────────┐
│  │ ☰ Menu [Spacer]  User  Logout          │
│  └────────────────────────────────────────┘
│  ┌┐ ┌──────────────────────────────────────┐
│  ││ │                                      │
│  ││ │   Main Content Area                 │
│  ││ │                                      │
│  ││ │   PageComponent renders              │
│  ││ │   full width                         │
│  ││ │                                      │
│  ││ │                                      │
│  └┘ └──────────────────────────────────────┘
│  (When user clicks Menu, sidebar slides in)
│
└────────────────────────────────────────────────┘
```

---

## Error Handling Flows

### Case 1: Not Authenticated

```
Access /dashboard/my-auctions
            │
            ▼
ProtectedRoute
  └─ Check localStorage['accessToken']
      └─ Not found
          └─ isAuthenticated = false
              └─ Render <Navigate to="/login" />
                  └─ User redirected to login page
```

### Case 2: Wrong Role

```
Authenticated as "buyer"
  └─ Attempt to access /dashboard/users (admin page)
      └─ ProtectedRoute allows (has token)
          └─ RoleGuard checks user.role
              └─ Not "admin"
                  └─ ProtectedRoute with requiredRole="admin"
                      └─ Render UnauthorizedScreen
```

### Case 3: Session Expired

```
Token expired but not yet removed
  └─ User clicks to navigate
      └─ API call returns 401 Unauthorized
          └─ AuthContext.logout() called
              └─ localStorage cleared
              └─ user state set to null
              └─ Next page access redirects to /login
```

---

## Code vs. User Action Timeline

```
TIME    USER ACTION          SYSTEM ACTION
────────────────────────────────────────────────────

0:00    Opens app                App boots
                                  ├─ AuthProvider initializes
                                  ├─ AuthContext reads localStorage
                                  └─ Auth hydration complete

0:50    Navigates to /login      ProtectedRoute check skipped
                                  └─ LoginPage renders

0:55    Enters credentials       
1:00    Clicks "Sign In"        POST /api/auth/login
                                  └─ Returns token + user

1:05                              ├─ Save token to localStorage
                                  ├─ Save user to localStorage
                                  ├─ AuthContext updates state
                                  ├─ Navigate to /dashboard
                                  └─ Page reloads with layout

1:10    Sees SellerLayout        ✅ Sidebar visible
                                  ✅ TopBar visible
                                  ✅ Navigation working

1:20    Clicks "My Auctions"     ├─ Navigate to /dashboard/my-auctions
                                  ├─ ProtectedRoute checks (passes)
                                  ├─ RoleGuard applies SellerLayout
                                  └─ Page renders

1:30    Clicks browser refresh   App restarts
        (Ctrl+R)                  ├─ AuthProvider initializes
                                  ├─ Read token from localStorage
                                  ├─ Read user from localStorage
                                  ├─ Auth restored instantly
                                  ├─ Navigate to previous route
                                  ├─ SellerLayout renders
                                  └─ No login prompt!

1:40    Clicks Logout            ├─ signOut() called
                                  ├─ Clear localStorage
                                  ├─ Clear auth state
                                  ├─ Redirect to /login
                                  └─ Next refresh requires login

────────────────────────────────────────────────────
```

---

## Summary

**Before Day 2 Fix:** Routes rendered without layout
**After Day 2 Fix:** Layout always wraps content

```
Navigation missing ❌  →  Authentication works ✅
Sidebar disappears  ❌  →  Sidebar persists ✅
Auth lost on refresh ❌  →  Auth survives refresh ✅
Direct URLs broken ❌  →  Direct URLs work ✅
No role protection ❌  →  Roles properly guarded ✅
Single layout ❌  →  5 role-specific layouts ✅
```

---

End of Architecture Diagram
Day 2: Routing & Layout Complete ✅
