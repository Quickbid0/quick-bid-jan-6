# Live Bidding UX Specification: Enterprise Trust Mode

**Version:** 1.0.0  
**Status:** Live / Reference-Grade  
**Scope:** Real-Time Bidding Interface (`RealTimeBidding.tsx`)

---

## 1. Core Philosophy

The QuickBid Live Bidding interface is designed for high-stakes, real-money environments where trust and speed are paramount. The system prioritizes **state determinism** over engagement tricks.

### Key Tenets
1.  **Truth over Hype:** The interface always reflects the confirmed server state. It never predicts or simulates success.
2.  **Latency Transparency:** Delays and errors are explicitly communicated.
3.  **Cognitive Calm:** Safety signals are non-blocking; critical status changes are high-contrast but stable.
4.  **Identity Stability:** Competitors are persistent entities, not random noise.

---

## 2. State Management & Persistence

### 2.1 Initialization (The "Refresh Problem")
To guarantee continuity across page refreshes, tab switches, or connectivity drops, the component initializes by reconstructing the auction reality from the ledger.

-   **Action:** On mount, fetch the last 10 accepted bids.
-   **Derivations:**
    -   **Current Price:** Derived from the latest bid (or auction start price).
    -   **User Status:** 
        -   If the latest bid is yours → **WINNING** (Green).
        -   If a previous bid was yours but a newer one exists → **OUTBID** (Red).
        -   Otherwise → Neutral.
    -   **Traffic Context:** Historical velocity (bids in last 30s) determines the initial "High Competition" state.

### 2.2 Time Since Last Bid
-   **Definition:** The time elapsed since the most recent accepted bid.
-   **Implementation:** Client-side interval updating every second.
-   **Reference:** Calculated against `new Date()` relative to the bid's server timestamp.
-   **Purpose:** Provides "staleness" context. A bid 2 seconds ago implies heat; a bid 5 minutes ago implies stagnation.

---

## 3. Safety & Situational Awareness

### 3.1 High Competition Mode
-   **Trigger:** $\ge$ 3 bids within a rolling 30-second window.
-   **Visual:** Inline, pulsing amber badge: "High Competition".
-   **Behavior:** Purely informational. Does **not** block bidding or introduce friction.
-   **Why:** Prevents "ambush" feelings when entering a hot auction.

### 3.2 Identity Stability
-   **Format:** `Bidder #{last4_of_uuid}` (e.g., "Bidder #a1b2").
-   **Consistency:** The same user always appears as the same alias to others.
-   **Privacy:** No PII revealed, but allows for competitive modeling (identifying aggressive vs. passive actors).

---

## 4. Feedback Loops & Confirmation

### 4.1 The "Bid Accepted" Signal
-   **Trigger:** HTTP 200 OK response from the bid submission endpoint.
-   **Visual:** Explicit "Bid Accepted" toast.
-   **Role:** Bridges the gap between the HTTP response and the WebSocket update. Confirms the server has processed the order.

### 4.2 Error Handling
-   **Principle:** Explainable Rejection.
-   **Scenarios:**
    -   **Insufficient Funds/Deposit:** "Security deposit required to bid higher."
    -   **Outbid During Submit:** "Bid must be higher than current price."
    -   **Connection Failure:** "Connection error. Retrying..."

---

## 5. Mobile & Responsive Design

### 5.1 Sticky Controls
-   **Behavior:** On mobile viewports, the "Place Bid" and "Custom Amount" controls are fixed to the bottom of the screen (`z-index: 50`).
-   **Safe Area:** Respects iOS bottom safe area (`pb-safe`).
-   **Interaction:** Designed for one-thumb usage.

---

## 6. Invariants (Guarantees)

1.  **No Ghost Bids:** A user is never shown as "Winning" unless the server has confirmed their bid is the latest.
2.  **No Blocking Without Cause:** The UI never disables the bid button unless a request is in flight (`isSubmitting`).
3.  **State Recovery:** A hard refresh **must** restore the exact same visual state (winning/losing/price) as the live session.

---

## 7. Future Considerations (Post-V1)

-   **Latency Metrics:** Measure time-to-confirmation (click to toast).
-   **Reconnection Logic:** Auto-retry strategies for spotty cellular networks.
-   **Audit Logs:** Client-side logging of bid attempts for dispute resolution.
