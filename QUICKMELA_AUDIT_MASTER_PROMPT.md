# ✅ QUICKMELA (QUICKBID) END-TO-END AUDIT MASTER PROMPT

🎯 **ROLE**
You are acting as a Senior QA Architect + Product Owner auditing QuickBid (QuickMela), a comprehensive multi-auction platform preparing for public launch.

Your job is to:
- Verify completeness of all auction types (Live, Timed, Tender)
- Validate all user flows across 4 roles (Buyer, Seller, Company, Admin)
- Identify missing UX / logic in real-money auction context
- Fix only what is required - no scope creep

🧭 **OBJECTIVE**
Perform a full end-to-end validation of the QuickBid application and ensure:
- All required auction types work (Live, Timed, Tender)
- All user flows work without confusion
- No broken, dead, or demo-like states
- Trust, money clarity, and safety are preserved in real-money context

🧪 **VALIDATION SCOPE (STRICT)**

🔐 **AUTH & ROLES**
Validate all 4 roles:
- **Buyer**: Browse, bid, wallet, watchlist, wins
- **Seller**: Create auctions, analytics, manage listings
- **Company**: Bulk uploads, tender auctions, verification
- **Admin**: User management, product verification, moderation

Verify:
- Demo login works for all roles (`/demo` page)
- Correct dashboard loads per role
- Session persists on refresh
- Logout works correctly
- Unauthorized routes are blocked by `ProtectedRoute` and `RoleGuard`

🛒 **BUYER FLOWS**
Validate end-to-end:

**Browse & Discovery:**
- Browse all auction types (Live, Timed, Tender)
- Advanced search and filters work
- Product detail pages load correctly
- Category navigation works

**Bidding Flows:**
- **Timed Auctions**: Place bid → confirmation → wallet deduction
- **Live Auctions**: Join live room → deposit requirement → bidding
- **Tender Auctions**: Submit sealed bid → wait for results

**Wallet & Money:**
- Wallet balance visible before bidding
- Razorpay deposit flow works (`DepositFlowModal`)
- Insufficient balance shows clear reason + recovery CTA
- Transaction history visible

**My Bids Management:**
- Bid appears in My Bids with correct status:
  - Active
  - Won
  - Lost
  - Ended
- Auction completion states visible
- No bidding possible on ended auctions

🏪 **SELLER FLOWS**
Validate end-to-end:

**Auction Creation:**
- Create auction works for all types
- Image upload works (`react-dropzone`)
- Auction status clarity (pending / live / ended)
- Preview before publishing

**Analytics & Management:**
- Seller analytics dashboard loads
- Final outcome visible:
  - Sold / Unsold
  - Final bid amount
  - Winner information
- No confusing or dead states

🏢 **COMPANY FLOWS**
Validate:
- Company registration and verification
- Bulk upload functionality
- Tender auction creation and management
- Business analytics dashboard

⚙️ **ADMIN FLOWS**
Validate:
- Admin login & route protection
- Clear section labels in admin dashboard
- User management screens work
- Product verification/approval workflow
- No destructive action without clarity

🎭 **LIVE AUCTION SPECIAL VALIDATION**
Critical flow for real-money auctions:
- `LiveAuctionPage` → `LiveAuctionRoom` loads correctly
- `useLiveAuctionSocket` connects and joins auction room
- Deposit requirement flow works:
  - `deposit-required` event → `DepositBanner` → `DepositFlowModal`
  - Razorpay integration works (`depositService.initiateDeposit`)
  - Status polling works (`/deposits/{depositId}/status`)
- Real-time bidding works via socket.io
- Live overlays and bid updates work

🧠 **UX & TRUST CHECKS (CRITICAL)**
On every screen, verify the user can answer instantly:
- Where am I? (Clear page titles, breadcrumbs)
- What happened? (Status messages, confirmations)
- What's my status? (Bid status, auction state, wallet balance)
- Where's my money? (Clear wallet display, transaction history)
- What do I do next? (Clear CTAs, next steps)

If any screen fails this → it is a bug, not polish.

🚫 **HARD CONSTRAINTS (NON-NEGOTIABLE)**

You **MUST NOT**:
- Add new features beyond QuickBid's current scope
- Add analytics, AI, notifications beyond existing implementation
- Change business logic or auction rules
- Redesign layouts or components
- Expand scope to include new auction types

You **MAY**:
- Add missing UI for existing features
- Fix broken flows and dead ends
- Add empty states where missing
- Add missing visibility/clarity
- Fix copy only for clarity and trust
- Add tests for fixed areas

🧪 **TESTING REQUIREMENTS**

**Run These Specific Tests:**
```bash
npm run test:e2e                    # Full smoke test
npm run test:buyer-flow             # Buyer journey
npm run test:seller-flow            # Seller journey  
npm run test:admin-flow             # Admin functions
npm run test:demo-login             # Demo login validation
npm run test:modern-ui              # UI consistency
npm run test:accessibility          # A11y compliance
```

**After fixes:**
- Run full smoke tests
- Run role-based flow tests
- Add tests only where gaps were found
- Ensure no regressions

📋 **OUTPUT FORMAT (MANDATORY)**

Return results in this exact structure:

```
✅ FEATURES VERIFIED
[List of features confirmed working]

❌ MISSING / BROKEN ITEMS
Feature / Flow:
Issue:
Impact:
Fix Applied:

🧪 TEST STATUS
Smoke tests: PASS / FAIL
Buyer flow: PASS / FAIL
Seller flow: PASS / FAIL
Admin flow: PASS / FAIL
Company flow: PASS / FAIL
Live auction flow: PASS / FAIL

🎯 FINAL VERDICT
Demo Ready: YES / NO
Public Ready: YES / NO
Remaining Risk Level: LOW / MEDIUM / HIGH

📊 CRITICAL ISSUES REMAINING
[List any critical issues that block public launch]
```

🏁 **SUCCESS CONDITION**

The task is complete only when:
- No missing flows remain for any auction type
- No broken states exist in money-handling flows
- No user confusion remains in critical paths
- All tests pass
- Real-money trust and safety are preserved

🔥 **HOW TO USE THIS PROMPT (IMPORTANT)**

1. Open Windsurf/Cursor/Copilot
2. Select Agent / Autopilot mode
3. Paste the full prompt above
4. Let it scan the entire codebase
5. Review the structured output
6. Fix only what it reports as missing/broken

🧠 **WHY THIS PROMPT WORKS FOR QUICKBID**

- Forces product-level thinking for real-money auctions
- Prevents scope creep beyond existing auction types
- Treats UX gaps as critical bugs (money at stake)
- Validates all 4 user roles and 3 auction types
- Ensures Razorpay integration and live auction flow work
- Aligns with investor & public trust requirements
- Converts "feels okay" → provably ready for real money

---

**QuickBid Specific Context:**
- Built with React 18, TypeScript, Vite
- Uses Supabase for database and auth
- Socket.io for real-time live auctions
- Razorpay for payment processing
- Framer Motion for animations
- TailwindCSS for styling
- Playwright for E2E testing

**Key Files to Focus On:**
- `src/App.tsx` - All route definitions
- `src/pages/LiveAuctionPage.tsx` - Live auction flow
- `src/modules/live/DepositFlowModal.tsx` - Payment flow
- `src/hooks/useLiveAuctionSocket.ts` - Real-time logic
- `tests/e2e/` - All E2E test specs
