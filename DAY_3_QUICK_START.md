# DAY 3 QUICK START GUIDE

## 3 Files Created

| File | Lines | Purpose |
|------|-------|---------|
| **navigationConfig.ts** | 400 | Centralized navigation (max 8 items per role) |
| **termTranslations.ts** | 350 | Terminology mapping (Escrow → Protected Payment) |
| **featureVisibility.ts** | 200 | Feature access control (for new users) |

---

## Problem → Solution

### MED-001: "Navigation items exceed 8 per role"
```
Before: 15+ items cluttering sidebar
After:  navigationConfig.ts with exactly 8 items per role
```

### MED-004: "Technical jargon in UI labels"
```
Before: "Escrow Transaction", "KYC Status", "AML Check"
After:  "Protected Payment", "Verification Status", "Fraud Check"
```

### Feature Creep: "Advanced features exposed to new users"
```
Before: All features visible to new users (overwhelming)
After:  featureVisibility.ts hides advanced features until:
        - Account is 7+ days old
        - User is verified
```

---

## 30-Second Implementation

### 1. Copy Files
```bash
cp src/config/navigationConfig.ts /your/project/
cp src/config/termTranslations.ts /your/project/
cp src/config/featureVisibility.ts /your/project/
```

### 2. Update Layouts (Example: BuyerLayout.tsx)
```tsx
import { getNavigationForRole, filterNavigationItems } from '@/config/navigationConfig';

export function BuyerLayout({ children }) {
  const { user } = useAuth();
  const navConfig = getNavigationForRole(user.role);
  const visibleItems = filterNavigationItems(navConfig.items, user.verified);
  
  return (
    <>
      <TopBar />
      <Sidebar items={visibleItems} />
      <main>{children}</main>
    </>
  );
}
```

### 3. Use Translations (Example: Components)
```tsx
import { translate } from '@/config/termTranslations';

// Replace all technical terms
<h1>{translate('KYC Status')}</h1>          // Shows "Verification Status"
<p>{translate('Escrow Transaction')}</p>    // Shows "Protected Payment"
<label>{translate('Settlement')}</label>    // Shows "Payment Processing"
```

### 4. Add Feature Gates (Example: Optional)
```tsx
import { canAccessFeature, getFeatureStatus } from '@/config/featureVisibility';

const BulkOperationsButton = () => {
  if (!canAccessFeature('BULK_OPERATIONS', user)) {
    const status = getFeatureStatus('BULK_OPERATIONS', user);
    return <DisabledButton title={status.reason} />;
  }
  return <ActiveButton />;
};
```

---

## Key Functions

### Navigation
```typescript
// Get navigation for role
const navConfig = getNavigationForRole('seller');

// Filter items based on verification
const visibleItems = filterNavigationItems(items, isVerified);

// Group by category
const grouped = groupNavigationByCategory(items);
// Returns: { browsing: [...], payments: [...], support: [...] }
```

### Translations
```typescript
// Simple translation
translate('KYC')  // → "Identity Verification"

// Context-aware
translateWithContext('Settlement', 'seller')  // → "When You Get Paid"

// Error messages
translateError('INSUFFICIENT_BALANCE')  // → "You don't have enough funds"

// Batch translate object
const friendlyData = translateObject(apiResponse);
```

### Feature Visibility
```typescript
// Check if user can access feature
const canBulk = canAccessFeature('BULK_OPERATIONS', user);

// Get unlock status
const status = getFeatureStatus('PROTECTED_PAYMENTS', user);
// Returns: { available: false, reason: 'Verify identity...', daysUntil: 5 }
```

---

## Navigation Per Role (Exactly 8 Items)

### BUYER (7 items)
1. Browse Auctions
2. My Bids
3. Watchlist
4. Wallet
5. Activity
6. Help & Support
7. Settings

### SELLER (8 items)
1. List Product
2. My Auctions
3. Performance
4. Ratings & Reviews
5. Settlement
6. Help & Support
7. Settings
8. (Plus Protected Sales if verified)

### DEALER (8 items)
1. Inventory
2. Bulk Operations
3. Active Auctions
4. Insights
5. Performance
6. Settlement
7. Help & Support
8. Settings

### COMPANY (8 items)
1. Team
2. Inventory
3. Active Auctions
4. Reports
5. Settlement
6. Compliance
7. Help & Support
8. Settings

### ADMIN (8 items)
1. Dashboard
2. Users
3. Moderation
4. Analytics
5. Disputes
6. Audit Log
7. System Settings
8. Help & Support

---

## Term Mapping Examples

| Old (Technical) | New (User-Friendly) |
|-----------------|-------------------|
| Escrow | Protected Payment |
| Escrow Transaction | Protected Payment |
| KYC | Identity Verification |
| KYC Status | Verification Status |
| AML | Fraud Check |
| Compliance Check | Security Check |
| Reserve Price | Minimum Starting Price |
| Lot Number | Item Number |
| Retract Bid | Cancel Bid |
| Bid Increment | Minimum Bid Increase |
| Hammer Price | Final Bid Amount |
| DSR | Rating Score |
| Defect Rate | Problem Rate |
| Settlement | Payment Processing |
| Direct Deposit | Bank Transfer |

---

## Feature Unlock Timeline

### Day 0 (New User)
✅ Core features: Browse, Bid, Profile
❌ Bulk Operations (needs 7 days)
❌ Premium Tools (needs 30 days + verified)

### Day 7 (After 1 Week)
✅ Bulk Operations unlocked (if dealer)
❌ Premium Tools (needs 30 days + verified)

### Day 30 (After 1 Month) + Verified
✅ Premium Tools unlocked
✅ Protected Payments unlocked
✅ All features available

---

## Testing Each Part

### 1. Test Navigation (5 min)
```bash
# Login as each role and verify:
- Buyer: 7 items visible
- Seller: 8 items visible  
- Admin: 8 items visible
- No cross-role items visible
```

### 2. Test Translations (5 min)
```bash
# Search codebase for old terms:
grep -r "Escrow" src/  # Should be 0 results
grep -r "KYC" src/     # Should be 0 results
grep -r "AML" src/     # Should be 0 results
```

### 3. Test Features (5 min)
```bash
# New account (<7 days): Bulk Ops hidden
# Old account (>7 days): Bulk Ops visible
# Unverified: Protected Payments hidden
# Verified: Protected Payments visible
```

---

## Files Modified

**No existing files modified**

Just add these 3 new files:
- src/config/navigationConfig.ts ✅
- src/config/termTranslations.ts ✅
- src/config/featureVisibility.ts ✅

---

## Status: Day 3 Complete ✅

**Issues Fixed:**
- ✅ MED-001: Navigation items exceed 8 per role
- ✅ MED-004: Technical jargon in UI labels  
- ✅ New: Feature visibility for gradual onboarding

**Next:** Day 4 - Design System (Button, Card, Badge components + Colors/Typography)

---

Generated: Quick Start for Day 3
Copy the 3 files and update your layouts - takes ~15 minutes
