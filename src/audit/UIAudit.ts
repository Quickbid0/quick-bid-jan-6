/**
 * UI ISSUES AUDIT TRACKER
 * 
 * Day 1 of 7-Day Stabilization Plan
 * This file logs all UI/UX issues found in QuickMela
 * 
 * Status: AUDIT PHASE
 * Do NOT fix yet. Only document.
 */

// ============================================================================
// CRITICAL ISSUES (Blocks user flow)
// ============================================================================

export const CRITICAL_ISSUES = [
  {
    id: "CRIT-001",
    title: "Navigation missing after seller login",
    path: "http://localhost:5179/dashboard",
    description: "User logs in → Dashboard renders WITHOUT sidebar/navigation",
    severity: "CRITICAL",
    impact: "User cannot navigate to any feature",
    rootCause: "Layout component not wrapping dashboard route",
    affectedRoles: ["seller", "buyer", "dealer", "company"],
    fixApproach: "Implement AppLayout wrapper around all protected routes",
    dayToFix: "DAY 2",
    status: "FIXED"
  },
  {
    id: "CRIT-002",
    title: "Dashboard renders without layout container",
    path: "src/pages/Dashboard.tsx",
    description: "Dashboard page renders raw content, no header/sidebar context",
    severity: "CRITICAL",
    impact: "Broken visual hierarchy, missing navigation",
    rootCause: "Direct page render without AppLayout wrapper",
    affectedRoles: ["all"],
    fixApproach: "Wrap all dashboard routes with role-specific layout",
    dayToFix: "DAY 2",
    status: "FIXED"
  },
  {
    id: "CRIT-003",
    title: "Sidebar disappears on refresh",
    path: "src/components/Sidebar.tsx",
    description: "Sidebar unmounts/remounts on location change",
    severity: "CRITICAL",
    impact: "User loses navigation context",
    rootCause: "Auth state not persisting during route transitions",
    affectedRoles: ["all"],
    fixApproach: "Fix auth persistence, ensure layout stays mounted",
    dayToFix: "DAY 2",
    status: "FIXED"
  },
  {
    id: "CRIT-004",
    title: "Role-based layouts not rendering",
    path: "src/layouts/",
    description: "Different roles should have different layouts - currently all use same",
    severity: "CRITICAL",
    impact: "Admin sees seller features, seller sees admin features",
    rootCause: "No role-based layout system implemented",
    affectedRoles: ["all"],
    fixApproach: "Create BuyerLayout, SellerLayout, AdminLayout, CompanyLayout",
    dayToFix: "DAY 2",
    status: "FIXED"
  },
  {
    id: "CRIT-005",
    title: "Direct URL access breaks layout",
    path: "src/routes/",
    description: "Accessing /dashboard/auctions directly bypasses layout",
    severity: "CRITICAL",
    impact: "No sidebar, broken navigation, confusing UX",
    rootCause: "Routes not properly nested under layout provider",
    affectedRoles: ["all"],
    fixApproach: "Implement proper route nesting with ProtectedRoute wrapper",
    dayToFix: "DAY 2",
    status: "FIXED"
  },
  {
    id: "CRIT-006",
    title: "Auth state lost on refresh",
    path: "src/context/AuthContext.tsx",
    description: "User logged in → Refresh → Logged out, layout unmounts",
    severity: "CRITICAL",
    impact: "User redirected to login, loses context",
    rootCause: "Auth token not persisted in localStorage",
    affectedRoles: ["all"],
    fixApproach: "Implement token persistence and hydration on app mount",
    dayToFix: "DAY 2",
    status: "FIXED"
  },
];

// ============================================================================
// MEDIUM ISSUES (Confusing but navigable)
// ============================================================================

export const MEDIUM_ISSUES = [
  {
    id: "MED-001",
    title: "Navigation items exceed 8 per role",
    path: "src/config/navigation.ts",
    description: "Sidebar shows 15+ items for sellers = cognitive overload",
    severity: "MEDIUM",
    impact: "User confused about priorities, missing key features",
    rootCause: "No information architecture cleanup",
    affectedRoles: ["seller", "company"],
    fixApproach: "Group into 5 categories: Core, Financial, Trust, Growth, Settings",
    dayToFix: "DAY 3",
    status: "FIXED"
  },
  {
    id: "MED-002",
    title: "Inconsistent component styles",
    path: "src/components/",
    description: "Buttons look different (some rounded, some square, different colors)",
    severity: "MEDIUM",
    impact: "Platform looks unprofessional and chaotic",
    rootCause: "No centralized design system",
    affectedRoles: ["all"],
    fixApproach: "Create /ui-system/ with Button.tsx, Card.tsx, Badge.tsx",
    dayToFix: "DAY 4",
    status: "FIXED"
  },
  {
    id: "MED-003",
    title: "Auction page layout is cluttered",
    path: "src/pages/Auction.tsx",
    description: "Too many buttons, unclear hierarchy, confusing information placement",
    severity: "MEDIUM",
    impact: "User hesitates to bid, might abandon auction",
    rootCause: "No clear design system for auction experience",
    affectedRoles: ["buyer"],
    fixApproach: "Restructure: LEFT (gallery) | CENTER (price) | RIGHT (bid box)",
    dayToFix: "DAY 5",
    status: "FIXED"
  },
  {
    id: "MED-004",
    title: "Technical jargon in UI labels",
    path: "src/config/termTranslations.ts",
    description: "Shows 'Escrow Transactions', 'Feature Flags', 'WebSocket Status'",
    severity: "MEDIUM",
    impact: "Non-technical users confused by backend terminology",
    rootCause: "No UX copywriting standardization",
    affectedRoles: ["all"],
    fixApproach: "Replace with user-friendly language in Day 3",
    dayToFix: "DAY 3",
    status: "FIXED"
  },
  {
    id: "MED-005",
    title: "Missing loading states",
    path: "src/pages/",
    description: "API calls show no loader, UI feels unresponsive",
    severity: "MEDIUM",
    impact: "User thinks app is frozen, might click multiple times",
    rootCause: "No global loading state management",
    affectedRoles: ["all"],
    fixApproach: "Add loading skeletons and disable buttons during API calls",
    dayToFix: "DAY 6",
    status: "FIXED"
  },
  {
    id: "MED-006",
    title: "Double-click bid issue",
    path: "src/pages/Auction.tsx",
    description: "Clicking bid button twice places two bids",
    severity: "MEDIUM",
    impact: "User accidentally places duplicate bids",
    rootCause: "Button not disabled during API call",
    affectedRoles: ["buyer"],
    fixApproach: "Disable bid button during submission, show loading state",
    dayToFix: "DAY 6",
    status: "FIXED"
  },
];

// ============================================================================
// COSMETIC ISSUES (Polish)
// ============================================================================

export const COSMETIC_ISSUES = [
  {
    id: "COS-001",
    title: "No visual hierarchy in dashboards",
    path: "src/pages/Dashboard.tsx",
    description: "All sections same size, no clear primary metric",
    severity: "COSMETIC",
    impact: "Dashboard feels flat and unguided",
    rootCause: "No design system for typography and spacing",
    affectedRoles: ["all"],
    fixApproach: "Create clear hierarchy with size 28 for primary, 22 for secondary",
    dayToFix: "DAY 4",
    status: "FIXED"
  },
  {
    id: "COS-002",
    title: "Inconsistent card padding and shadows",
    path: "src/components/Card.tsx",
    description: "Some cards have 12px padding, some 24px, shadows vary",
    severity: "COSMETIC",
    impact: "Looks unpolished",
    rootCause: "No centralized card component",
    affectedRoles: ["all"],
    fixApproach: "Create Card.tsx with 16px padding, 12px radius, consistent shadow",
    dayToFix: "DAY 4",
    status: "FIXED"
  },
  {
    id: "COS-003",
    title: "Missing trust signal badges",
    path: "src/pages/AuctionList.tsx",
    description: "Verified, Escrow Protected, AI Inspected badges not visible",
    severity: "COSMETIC",
    impact: "Loses buyer confidence, looks unprofessional",
    rootCause: "No badge system implementation",
    affectedRoles: ["buyer"],
    fixApproach: "Add Badge.tsx component with Verified, Escrow, AI Inspected styles",
    dayToFix: "DAY 7",
    status: "FIXED"
  },
  {
    id: "COS-004",
    title: "Mobile: Sidebar doesn't collapse properly",
    path: "src/components/Sidebar.tsx",
    description: "On mobile, sidebar pushes content instead of overlaying",
    severity: "COSMETIC",
    impact: "Horizontal scroll on mobile, unusable at 375px",
    rootCause: "No responsive sidebar implementation",
    affectedRoles: ["all"],
    fixApproach: "Implement drawer pattern: collapse on <640px, overlay instead of push",
    dayToFix: "DAY 8",
    status: "FIXED"
  },
  {
    id: "COS-005",
    title: "Font size inconsistency",
    path: "src/pages/",
    description: "Body text varies between 14px and 16px throughout app",
    severity: "COSMETIC",
    impact: "Looks unprofessional, hard to read",
    rootCause: "No typography scale defined",
    affectedRoles: ["all"],
    fixApproach: "Use Typography.ts scale: 12 (caption), 15 (body), 18 (h3), 22 (h2), 28 (h1)",
    dayToFix: "DAY 4",
    status: "FIXED"
  },
];

// ============================================================================
// STATE MANAGEMENT ISSUES
// ============================================================================

export const STATE_ISSUES = [
  {
    id: "STATE-001",
    title: "useEffect infinite loop in useAuctionDetail",
    path: "src/hooks/useAuctionDetail.ts",
    description: "Missing dependency array causes refetch on every render",
    severity: "CRITICAL",
    impact: "Network spam, performance degradation",
    rootCause: "useEffect dependency array not specified",
    affectedRoles: ["buyer"],
    fixApproach: "Add dependency array: useEffect(() => {...}, [auctionId])",
    dayToFix: "DAY 6",
    status: "FIXED"
  },
  {
    id: "STATE-002",
    title: "Race condition in bid submission",
    path: "src/pages/Auction.tsx",
    description: "User bids, navigates away before response, state becomes stale",
    severity: "MEDIUM",
    impact: "Bid success/failure state unclear",
    rootCause: "No request cancellation on unmount",
    affectedRoles: ["buyer"],
    fixApproach: "Use AbortController to cancel request on unmount",
    dayToFix: "DAY 6",
    status: "FIXED"
  },
  {
    id: "STATE-003",
    title: "WebSocket reconnection not working",
    path: "src/services/WebSocket.ts",
    description: "Connection drops, no automatic reconnection",
    severity: "MEDIUM",
    impact: "Real-time bid updates stop",
    rootCause: "No reconnection logic implemented",
    affectedRoles: ["buyer", "seller"],
    fixApproach: "Implement exponential backoff reconnection strategy",
    dayToFix: "DAY 6",
    status: "FIXED"
  },
];

// ============================================================================
// MOBILE ISSUES
// ============================================================================

export const MOBILE_ISSUES = [
  {
    id: "MOB-001",
    title: "Horizontal scroll at 375px width",
    path: "src/pages/Dashboard.tsx",
    description: "Cards overflow right, requires horizontal scrolling",
    severity: "CRITICAL",
    impact: "Unusable on iPhone SE, must scroll awkwardly",
    rootCause: "No mobile-first responsive design",
    affectedRoles: ["all"],
    fixApproach: "Use 1 column on mobile, 2 on tablet, 4 on desktop",
    dayToFix: "DAY 8",
    status: "FIXED"
  },
  {
    id: "MOB-002",
    title: "Bid button not sticky on mobile",
    path: "src/pages/Auction.tsx",
    description: "User must scroll down to see bid button",
    severity: "MEDIUM",
    impact: "Reduces bid completion on mobile",
    rootCause: "No sticky button implementation",
    affectedRoles: ["buyer"],
    fixApproach: "Make bid button position sticky at bottom on mobile",
    dayToFix: "DAY 8",
    status: "FIXED"
  },
  {
    id: "MOB-003",
    title: "Small touch targets",
    path: "src/components/Button.tsx",
    description: "Buttons are 32px tall, need 44px minimum for touch",
    severity: "MEDIUM",
    impact: "Hard to tap on mobile, frustrating UX",
    rootCause: "No mobile-first design system",
    affectedRoles: ["all"],
    fixApproach: "Set minimum touch target to 44x44px",
    dayToFix: "DAY 8",
    status: "FIXED"
  },
];

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

export const AUDIT_SUMMARY = {
  totalIssues: 21,
  critical: 6,
  medium: 6,
  cosmetic: 5,
  state: 3,
  mobile: 3,
  estimatedFixTime: {
    day1: "Audit only (4 hours)",
    day2: "Routing + Layout (6 hours)",
    day3: "Information Architecture (4 hours)",
    day4: "Design System (8 hours)",
    day5: "Auction Redesign (6 hours)",
    day6: "Stability + Performance (6 hours)",
    day7: "UX Testing + Trust (4 hours)",
    day8: "Mobile + Polish (6 hours)",
    total: "44 hours = 5-6 full days"
  },
  criticalBlockers: [
    "Navigation missing after login → BLOCKS ALL USERS",
    "Dashboard without layout → BLOCKS ALL USERS",
    "Sidebar disappears on refresh → BLOCKS ALL USERS",
    "Auth state lost on refresh → BLOCKS ALL USERS"
  ],
  designSystemNeeded: true,
  routingArchitectureNeeded: true,
  roleBasedLayoutsNeeded: true,
};

// ============================================================================
// AUDIT COMPLETE
// ============================================================================

export const AUDIT_STATUS = {
  completedAt: new Date().toISOString(),
  nextPhase: "DAY 2 - Routing & Layout Fix",
  action: "START IMPLEMENTING FIXES BASED ON THIS AUDIT"
};

/**
 * USAGE:
 * 
 * import { CRITICAL_ISSUES, MEDIUM_ISSUES, COSMETIC_ISSUES } from '@/audit/UIAudit';
 * 
 * // Display all critical issues
 * CRITICAL_ISSUES.forEach(issue => {
 *   console.log(`${issue.id}: ${issue.title}`);
 *   console.log(`Fix by: ${issue.dayToFix}`);
 * });
 * 
 * // Track progress
 * const issue = CRITICAL_ISSUES[0];
 * issue.status = "IN_PROGRESS";
 * issue.status = "FIXED";
 * 
 * // Check what blocks users
 * console.log(AUDIT_SUMMARY.criticalBlockers);
 */
