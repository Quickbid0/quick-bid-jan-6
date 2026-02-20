# QuickMela – Complete Information Architecture Blueprint

## GLOBAL NAVIGATION RULES

✔ Each role has **separate, isolated navigation**  
✔ Maximum **7-8 sidebar items** per role  
✔ Features grouped by **user goal**, not system feature  
✔ Clear, non-technical naming  
✔ **Zero role bleed** – sellers never see buyer features  
✔ Trust signals visible in 3 seconds  

---

## 🧑‍💼 BUYER ROLE – INFORMATION ARCHITECTURE

### Sidebar Navigation (7 items)

1. **Dashboard** → Overview + recommendations
2. **Explore** → Browse auctions
3. **My Bids** → Active + inactive bids
4. **Watchlist** → Saved items
5. **Wallet** → Balance + history
6. **Disputes** → Issues + resolutions
7. **Profile** → KYC + verification
8. **Help** → FAQs + support

### Dashboard Layout – 4 Section Grid

**Top Section – Key Metrics (4 Cards)**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Wallet     │ Active     │ Won        │ Reputation │
│ Balance    │ Bids       │ Auctions   │ Score      │
│ ₹50,000    │ 3          │ 5          │ 4.8/5 ⭐   │
└────────────┴────────────┴────────────┴────────────┘
```

**Left Section – Main Content (70%)**
```
Recommended Auctions (AI-powered)
- Auction card grid (3 columns)
- Each card: Image + Price + Grade + Countdown

Ending Soon
- Sorted by time remaining
- Red countdown timer

Recently Viewed
- Carousel of past browsed items
```

**Right Section – Trust Panel (30%)**
```
┌──────────────────────┐
│ KYC Status           │
│ ✅ Verified          │
│                      │
│ Reputation Badge     │
│ 🏆 Top Buyer        │
│                      │
│ Escrow Protection    │
│ ✅ Enabled           │
│                      │
│ Wallet Security      │
│ 🔒 2FA Enabled      │
└──────────────────────┘
```

### Auction Detail Page – 3 Column Premium Layout

```
LEFT (25%)
┌─────────────────┐
│ Gallery         │
│ [Large Image]   │
│ • Thumb 1       │
│ • Thumb 2       │
│ • Thumb 3       │
└─────────────────┘

CENTER (50%)
┌─────────────────────────────┐
│ Title                       │
│ Grade: A+ | Mileage: 45K km│
│ Price ₹8,50,000            │
│ ⏱ Ends in 2 hours 23 mins   │
│                             │
│ Bid History (see all)       │
│ Last bid: ₹8,40,000 1 min   │
│                             │
│ [Tabs: History|Inspect|Docs]│
│ Inspection Report           │
│ - Photos                    │
│ - Condition report          │
└─────────────────────────────┘

RIGHT (25%)
┌─────────────────┐
│ PLACE BID       │
│ ═════════════   │
│ Your Balance    │
│ ₹50,000 ✅      │
│                 │
│ Escrow Ready    │
│ ✅ Protected    │
│                 │
│ EMI Available   │
│ 📊 48 months    │
│                 │
│ [PRIMARY CTA]   │
│ Place Bid       │
│ ₹8,55,000       │
│                 │
│ Bid History     │
│ ₹8,40,000 - 1m  │
│ ₹8,30,000 - 5m  │
└─────────────────┘
```

---

## 🏪 SELLER ROLE – INFORMATION ARCHITECTURE

### Sidebar Navigation (8 items)

1. **Dashboard** → Performance overview
2. **My Listings** → Active + sold items
3. **Create Listing** → Upload vehicle
4. **Orders** → Sold + settled
5. **Wallet** → Balance + payouts
6. **Inspections** → Report status
7. **Disputes** → Buyer claims
8. **Profile** → Business info

### Dashboard Layout

**Top Section – Key Metrics (4 Cards)**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Total      │ Active     │ Sold       │ Revenue    │
│ Listings   │ Auctions   │ This Month │ This Month │
│ 24         │ 8          │ 3          │ ₹12,50,000 │
└────────────┴────────────┴────────────┴────────────┘
```

**Left Section – Performance (70%)**
```
Revenue Trend (30-day chart)

Listing Performance
- Best seller: [Item] - ₹15 Lakhs
- Avg selling time: 4.2 days
- Sell-through rate: 85%

AI Price Suggestions
- Item 1: Suggested ₹9.2L (current ₹9L)
- Item 2: Suggested ₹3.5L (current ₹3.2L)
```

**Right Section – Status Panel (30%)**
```
┌──────────────────┐
│ Deposit Status   │
│ ✅ ₹2,00,000     │
│                  │
│ Reputation       │
│ ⭐⭐⭐⭐⭐ 4.9  │
│ Top Seller       │
│                  │
│ Payout Ready     │
│ ₹50,000          │
│ [Withdraw]       │
└──────────────────┘
```

---

## 🏦 COMPANY (BANK/NBFC) ROLE – IA

### Sidebar Navigation (8 items)

1. **Dashboard** → Overview
2. **Bulk Upload** → CSV upload
3. **Inventory** → All uploaded assets
4. **Active Auctions** → Currently selling
5. **Reports** → Performance analytics
6. **Team** → Staff management
7. **Wallet** → Payments
8. **Settings** → Company config

### Dashboard Layout

**Top Cards (4)**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Total      │ Recovery % │ Sold This  │ Avg Time   │
│ Assets     │            │ Month      │ to Sale    │
│ 1,250      │ 92%        │ 45         │ 3.2 days   │
└────────────┴────────────┴────────────┴────────────┘
```

**Left – Performance (70%)**
```
Recovery Trend (30-day)
- Graph showing recovery %

Regional Breakdown (Heatmap)
- State-wise performance

Top Performing Assets
- Luxury cars → 98% recovery
- SUVs → 95% recovery
```

**Right – Alerts (30%)**
```
┌──────────────────┐
│ Risk Alerts      │
│ ⚠️ 3 items below │
│ reserve price    │
│                  │
│ AI Insights      │
│ Sedan demand     │
│ +15% this week   │
│                  │
│ Payout This Mon  │
│ ₹45,00,000       │
└──────────────────┘
```

---

## 🛠 ADMIN ROLE – INFORMATION ARCHITECTURE

### Sidebar Navigation – 4 Sections

**MARKETPLACE (5 items)**
1. Dashboard
2. Active Auctions
3. Listings
4. Bulk Uploads

**USERS & RISK (5 items)**
5. User Approvals
6. KYC Approvals
7. Disputes
8. Fraud Alerts
9. Inspection Reports

**FINANCE (5 items)**
10. Wallets
11. Escrow Holds
12. Transactions
13. Refunds
14. Payouts

**GROWTH & SYSTEM (4 items)**
15. Campaigns
16. Feature Flags
17. Analytics
18. Settings

### Admin Dashboard – Complete Overview

**Top Stats (6)**
```
Active Auctions | Pending KYCs | Disputes | Revenue Today | Users Online | Fraud Alerts
```

**Main Sections**
```
Real-time Auction Activity
- Live ticker of bids

Pending Approvals
- KYC queue
- Listing queue
- Dispute queue

Growth Metrics
- New users
- Transaction volume
- Platform health

Risk Dashboard
- Fraud indicator
- Escrow holds
- Dispute rate
```

---

## 🎨 DESIGN SYSTEM – TOKENS

### Color Palette

**Primary**
```
Navy Blue: #0F2557
Accent Navy: #1A3A7A
Light Navy: #E8EDF5
```

**Semantic**
```
Success (Trust Green): #10B981
Warning (Amber): #F59E0B
Danger (Soft Red): #EF4444
Info (Sky Blue): #3B82F6
```

**Neutral**
```
Dark Gray: #1F2937
Medium Gray: #6B7280
Light Gray: #F3F4F6
White: #FFFFFF
```

### Typography Scale

```
Heading 1: 32px, Bold, Line-height 1.2
Heading 2: 24px, Bold, Line-height 1.3
Heading 3: 18px, Semi-bold, Line-height 1.4
Body: 15px, Regular, Line-height 1.6
Small: 13px, Regular, Line-height 1.5
Caption: 11px, Regular, Line-height 1.4
```

### Spacing System (8px base)

```
xs: 4px (2px scale)
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Shadow System

```
Subtle: 0 1px 3px rgba(0, 0, 0, 0.1)
Small: 0 4px 6px rgba(0, 0, 0, 0.1)
Medium: 0 10px 15px rgba(0, 0, 0, 0.1)
Large: 0 20px 25px rgba(0, 0, 0, 0.15)
```

### Border Radius

```
sm: 4px
md: 8px
lg: 12px
xl: 16px
full: 9999px
```

---

## 🏷 COMPONENT DESIGN STANDARDS

### Card Component
```
- Padding: 20px
- Border-radius: 12px
- Shadow: box-shadow (medium)
- Border: 1px solid #E5E7EB
- Background: White
- Hover: Shadow increase + subtle scale
```

### Badge Component
```
- Verified: Navy background, white text
- Escrow Protected: Green background
- AI Inspected: Blue background
- Top Buyer/Seller: Gold background
- Consistent: 8px padding, 20px border-radius, small font
```

### Button Component
```
Primary (CTA):
- Navy background
- White text
- 12px padding vertical, 24px horizontal
- 8px border-radius
- No shadow on default

Secondary:
- White background
- Navy text
- Navy border (2px)
- Same padding

Disabled:
- Gray background
- Gray text
- No cursor
```

### Input Component
```
- Border: 1px #D1D5DB
- Padding: 12px 16px
- Border-radius: 8px
- Focus: Navy border + subtle blue outline
- Label: 13px, semi-bold, gray
- Error: Red border + red helper text
```

---

## 📱 MOBILE-FIRST BREAKPOINTS

```
Mobile: 375px - 414px
Tablet: 768px - 1024px
Desktop: 1200px+
```

### Mobile Auction Layout
```
FULL WIDTH STACKED:
[Gallery - full width]
[Price + Countdown - full width]
[Bid Panel - sticky bottom]
[Bid History - scrollable]

Bid Button: Sticky at bottom, full width
Wallet Balance: Always visible in bid panel
```

---

## ✅ TRUST VISIBILITY CHECKLIST

Within 3 seconds of landing on auction:
- ✅ Escrow protection label visible
- ✅ Inspection grade visible
- ✅ Seller verification badge visible
- ✅ Wallet balance visible
- ✅ EMI eligibility visible
- ✅ Countdown timer visible

Trust must be <em>peripheral</em>, not in-your-face.

---

## 🎯 IMPLEMENTATION PRIORITY

**Phase 1 (Week 1):** Design system + Buyer navigation  
**Phase 2 (Week 2):** Buyer dashboard + auction page  
**Phase 3 (Week 3):** Seller dashboard  
**Phase 4 (Week 4):** Admin panel  
**Phase 5 (Week 5):** Mobile optimization + stability  

---

## 📋 VALIDATION CHECKLIST

- [ ] No role sees another role's features
- [ ] Maximum 8 sidebar items per role
- [ ] All 7-8 dashboard cards visible on 1200px
- [ ] No horizontal scrolling on 375px
- [ ] All CTAs are singular and clear
- [ ] Trust signals visible within 3 seconds
- [ ] No technical jargon in UI
- [ ] Consistent spacing (8px grid)
- [ ] All colors from palette
- [ ] All fonts from scale
- [ ] No console warnings
- [ ] Loading states for all API calls
- [ ] Error boundaries on all sections
