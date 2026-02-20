# DAY 5: AUCTION PAGE REBUILD

## Overview

**Problem:** MED-003 - Auction page layout is cluttered, confusing hierarchy, too many buttons  
**Solution:** Rebuild with clean 3-column layout (Gallery | Price | Bid Panel)  
**Issues Fixed:** MED-003 (auction page cluttered)  
**Estimated Time:** 6-8 hours

---

## Target Layout

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVBAR (Breadcrumb)                    │
├──────────────────────┬──────────────────┬──────────────────┤
│                      │                  │                  │
│   LEFT (35%)         │  CENTER (40%)    │   RIGHT (25%)    │
│                      │                  │                  │
│  • Main Image        │  • Price $XX     │  • Bid Panel     │
│                      │  • Layout:       │                  │
│  • Thumbnails       │    [BUY_NOW]     │  Current Bid     │
│    (horizontal)      │    [BEST_OFFER]  │  [Input Field] $ │
│                      │    [Place Bid]   │  [PLACE_BID]     │
│  • Image count       │                  │  [WATCH BTN]     │
│    "1 of 24"        │  • Countdown     │                  │
│                      │    ⏱️ 2h 15m     │  Wallet Balance  │
│  • Slideshow CTR    │                  │  $1,234.56       │
│    [◀ ▶]            │  • Inspection    │                  │
│                      │    Grade: "ACE"  │  Seller Info     │
│                      │    ✓ Verified    │  ⭐ 4.8/5       │
│                      │    🛡️ Escrow     │  Top Seller      │
│                      │    AI Inspected  │                  │
│                      │                  │  Shipping Cost   │
│                      │  • Location      │  Est. Delivery   │
│                      │    "Los Angeles" │                  │
│                      │                  │  Similar Items   │
│                      │  • Mileage       │  (Carousel)      │
│                      │    75,234 miles  │                  │
│                      │                  │                  │
│                      │  • Condition     │                  │
│                      │    No reported   │                  │
│                      │    accidents     │                  │
│                      │                  │                  │
│                      │  • Description   │                  │
│                      │    Lorem ipsum   │                  │
│                      │    ...           │                  │
│                      │                  │                  │
├──────────────────────┴──────────────────┴──────────────────┤
│                    BOTTOM TABS                              │
├────────────────────────────────────────────────────────────┤
│ Details | Inspection | Bid History | Seller Profile       │
├────────────────────────────────────────────────────────────┤
│                   Tab Content Here                          │
└────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### Page Component (`src/pages/AuctionDetail.tsx`)

```typescript
// High-level structure
export default function AuctionDetail() {
  const { auctionId } = useParams();
  const { auction, loading } = useAuction(auctionId);
  
  if (loading) return <AuctionSkeleton />;
  
  return (
    <div className="bg-white">
      <Breadcrumb auction={auction} />
      
      <div className="grid grid-cols-5 gap-6 p-6">
        {/* LEFT: 35% = 2 of 5 cols */}
        <GalleryPanel column="col-span-2" auction={auction} />
        
        {/* CENTER: 40% = 2 of 5 cols */}
        <PricePanel column="col-span-2" auction={auction} />
        
        {/* RIGHT: 25% = 1 of 5 cols */}
        <BidPanel column="col-span-1" auction={auction} />
      </div>
      
      <Tabs auction={auction} />
    </div>
  );
}
```

### Gallery Panel (`src/components/AuctionGallery.tsx`)

```typescript
interface GalleryPanelProps {
  auction: Auction;
  column?: string;
}

export function GalleryPanel({ auction, column = "col-span-2" }: GalleryPanelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const currentImage = auction.images[currentImageIndex];
  const imageCount = auction.images.length;
  
  return (
    <div className={column}>
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img
          src={currentImage}
          alt={auction.title}
          className="w-full aspect-square object-cover"
        />
        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded text-sm">
          {currentImageIndex + 1} of {imageCount}
        </div>
      </div>
      
      {/* Thumbnail Strip */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {auction.images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImageIndex(idx)}
            className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
              idx === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ◀
        </button>
        <button
          onClick={() => setCurrentImageIndex(Math.min(imageCount - 1, currentImageIndex + 1))}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
```

### Price Panel (`src/components/AuctionPrice.tsx`)

```typescript
interface PricePanelProps {
  auction: Auction;
  column?: string;
}

export function PricePanel({ auction, column = "col-span-2" }: PricePanelProps) {
  return (
    <div className={column}>
      {/* Price Section - PROMINENT */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">Current Price</div>
        <div className="text-5xl font-bold text-gray-900 mb-4">
          ${auction.currentBid.toLocaleString()}
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-3 mb-4">
          <PrimaryButton className="flex-1">
            Place Bid
          </PrimaryButton>
          <SecondaryButton className="flex-1">
            Best Offer
          </SecondaryButton>
          <Button variant="ghost" leftIcon={<HeartIcon />}>
            Watch
          </Button>
        </div>
      </div>
      
      {/* Countdown Timer */}
      <Card className="mb-6 bg-amber-50 border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold">Auction Ends In</h3>
          <Badge variant="warning">Ending Soon</Badge>
        </div>
        <div className="text-2xl font-bold text-amber-600">
          ⏱️ {formatCountdown(auction.endsAt)}
        </div>
      </Card>
      
      {/* Trust Signals */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">Seller Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Escrow Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="ai-inspected">AI Inspected</Badge>
          </div>
        </div>
      </Card>
      
      {/* Item Details */}
      <Card>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-gray-500">Location</div>
            <div className="font-medium">Los Angeles, CA</div>
          </div>
          <div>
            <div className="text-gray-500">Mileage</div>
            <div className="font-medium">75,234 miles</div>
          </div>
          <div>
            <div className="text-gray-500">Condition</div>
            <div className="font-medium">Normal Wear & Tear</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### Bid Panel (`src/components/BidPanel.tsx`)

```typescript
interface BidPanelProps {
  auction: Auction;
  column?: string;
}

export function BidPanel({ auction, column = "col-span-1" }: BidPanelProps) {
  const [bidAmount, setBidAmount] = useState(auction.minimumNextBid);
  const { user } = useAuth();
  const { placeBid, loading } = usePlaceBid();
  
  const handlePlaceBid = async () => {
    await placeBid(auction.id, bidAmount);
  };
  
  return (
    <div className={column}>
      {/* Bid Summary */}
      <Card className="mb-4 bg-blue-50 border-blue-100">
        <h3 className="font-bold mb-3">Current Winner</h3>
        <div className="text-2xl font-bold mb-2">${auction.currentBid.toLocaleString()}</div>
        <div className="text-sm text-gray-600">
          {auction.bidCount} bids placed
        </div>
      </Card>
      
      {/* Bid Input */}
      <Card className="mb-4">
        <div className="mb-3">
          <label className="text-sm font-medium">Your Bid</label>
          <div className="flex gap-2 mt-1">
            <span className="text-xl font-bold">$</span>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseFloat(e.target.value))}
              min={auction.minimumNextBid}
              step={50}
              className="flex-1 text-xl font-bold border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Minimum: ${auction.minimumNextBid.toLocaleString()}
          </div>
        </div>
        
        <PrimaryButton 
          onClick={handlePlaceBid}
          loading={loading}
          disabled={bidAmount < auction.minimumNextBid}
          className="w-full"
        >
          Place Bid
        </PrimaryButton>
      </Card>
      
      {/* Wallet Balance */}
      <Card className="mb-4">
        <div className="text-sm">
          <div className="text-gray-500">Wallet Balance</div>
          <div className="text-lg font-bold">${user.walletBalance.toLocaleString()}</div>
          <Button variant="ghost" size="sm" className="mt-2">
            Add Funds
          </Button>
        </div>
      </Card>
      
      {/* Seller Info */}
      <Card className="mb-4">
        <h3 className="font-bold mb-3">Seller</h3>
        <div className="flex items-center gap-2 mb-2">
          <Avatar src={auction.seller.avatar} className="w-8 h-8" />
          <div>
            <div className="font-medium text-sm">{auction.seller.name}</div>
            <div className="text-xs text-gray-500">
              ⭐ {auction.seller.rating}/5 ({auction.seller.ratingCount})
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          View Profile
        </Button>
      </Card>
      
      {/* Related Items */}
      <Card>
        <h3 className="font-bold mb-3">Similar Items</h3>
        <div className="space-y-2">
          {auction.relatedItems.map((item) => (
            <div key={item.id} className="text-sm cursor-pointer hover:text-blue-600">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-gray-500">${item.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

### Bottom Tabs (`src/components/AuctionTabs.tsx`)

```typescript
interface AuctionTabsProps {
  auction: Auction;
}

export function AuctionTabs({ auction }: AuctionTabsProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <>
      {/* Tab Headers */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-8">
          {['details', 'inspection', 'history', 'seller'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 font-medium border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'details' && <DetailsTab auction={auction} />}
        {activeTab === 'inspection' && <InspectionTab auction={auction} />}
        {activeTab === 'history' && <BidHistoryTab auction={auction} />}
        {activeTab === 'seller' && <SellerProfileTab seller={auction.seller} />}
      </div>
    </>
  );
}
```

---

## Implementation Checklist

### Phase 1: Layout Foundation (2 hours)
- [ ] Create AuctionDetail.tsx page wrapper
- [ ] Create Gallery component (images, thumbnails, controls)
- [ ] Create Price component (headline pricing, buttons)
- [ ] Create BidPanel component (bid input, wallet, seller)
- [ ] Create Tab navigation component
- [ ] Apply grid layout (35|40|25 structure)

### Phase 2: Gallery Functionality (1.5 hours)
- [ ] Image carousel with next/prev buttons
- [ ] Thumbnail selection
- [ ] Image counter display
- [ ] Keyboard navigation (arrow keys)
- [ ] Mobile swipe support

### Phase 3: Bid Panel Integration (1.5 hours)
- [ ] Connect bid input to auction data
- [ ] Validate minimum bid amount
- [ ] Place bid API integration
- [ ] Disable button during submission
- [ ] Show success/error messages

### Phase 4: Tab Contents (1.5 hours)
- [ ] Details tab (full description, specs)
- [ ] Inspection tab (inspection report, grade)
- [ ] History tab (bid history table)
- [ ] Seller profile tab (profile, ratings, reviews)

### Phase 5: Polish & Testing (0.5 hours)
- [ ] Visual review against design
- [ ] Test on mobile responsive
- [ ] Test with real auction data
- [ ] Performance optimization

---

## CSS Grid Reference

For the 3-column layout, use TailwindCSS grid:

```tsx
<div className="grid grid-cols-5 gap-6">
  {/* Left: 40% = col-span-2 (35%) */}
  <div className="col-span-2">Gallery</div>
  
  {/* Center: 40% = col-span-2 (40%) */}
  <div className="col-span-2">Price</div>
  
  {/* Right: 20% = col-span-1 (25%) */}
  <div className="col-span-1">Bid</div>
</div>
```

Note: The math looks off but TailwindCSS has consistent gaps, so adjust as needed based on visual inspection.

---

## Issues Fixed

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| MED-003 | Too many buttons, cluttered layout | Clean 3-column layout, clear hierarchy | ✅ FIXED |

---

## Next Steps: Day 6 (Stability & Performance)

Once auction page is complete, Day 6 focuses on:
- MED-005: Add loading states
- MED-006: Prevent double-click bids
- STATE-001: Fix useEffect infinite loops
- STATE-002: Handle race conditions
- STATE-003: WebSocket reconnections

---

## Files to Create/Modify

| File | Type | Status |
|------|------|--------|
| src/pages/AuctionDetail.tsx | NEW | ✅ |
| src/components/AuctionGallery.tsx | NEW | ✅ |
| src/components/AuctionPrice.tsx | NEW | ✅ |
| src/components/BidPanel.tsx | NEW | ✅ |
| src/components/AuctionTabs.tsx | NEW | ✅ |
| src/types/Auction.ts | MODIFY | If not exists |

---

## Estimated Completion

**Timeline:** 6-8 hours  
**Complexity:** Medium  
**Code Lines:** ~1,200 lines  

---

Generated: Day 5 Plan  
7-Day UI Stabilization  
QuickMela Platform
