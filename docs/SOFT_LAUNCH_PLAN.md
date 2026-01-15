# QuickMela – Soft Launch Execution Plan

**Phase:** V1 Market Entry
**Duration:** 30 Days
**Objective:** Validate platform stability, user behavior, and trust signals in a controlled environment.

---

## 🚀 Execution Roadmap

### 🔹 Week 1: Closed Alpha (Days 1-7)
**Target:** 50–100 Users (Invite Only)
**Scope:** Known sellers, known buyers, low-value real auctions.

*   **Operational Rules:**
    *   Admin **MUST** be online during all auction windows.
    *   Monitor `AdminFraudReview` and `AdminDashboard` in real-time.
*   **Goals:**
    1.  Validate real user behavior paths.
    2.  Observe points of UX confusion.
    3.  Measure initial trust signals (deposit conversion).

### 🔹 Week 2–3: Private Beta (Days 8-21)
**Target:** 200–500 Users
**Scope:** Expanded invites, broader category mix.

*   **Operational Rules:**
    *   Enable **Auto Refunds** (monitor closely via `auctionService` logs).
    *   Enable **AI Suggestions** (assistive mode only, not auto-action).
    *   **Kill Switches:** Keep ON standby in `SystemSettings`.
*   **Goals:**
    1.  Analyze volume patterns and load.
    2.  Track support ticket trends.
    3.  Measure seller retention and listing rates.

### 🔹 Week 4: Stability Review (Days 22-30)
**Scope:** System-wide audit before public scaling.

*   **Key Questions:**
    *   Are there repeated support issues?
    *   Is there any confusion around wallet/money flows?
    *   Are AI false positives blocking legitimate users?
*   **Decision Gate:** Only after passing this review should mass scaling be considered.

---

## 📊 Key Success Metrics (KPIs)

Do not focus on vanity metrics. Track these 5 signals of health:

1.  **Auction Completion Rate:** % of scheduled auctions that result in a successful sale and payment.
2.  **Refund Turnaround Time:** Time from "Auction End" to "Wallet Credit" for losing bidders.
3.  **Seller Payout Satisfaction:** Speed and accuracy of settlement.
4.  **Support Tickets per Auction:** Ratio of issues to transaction volume.
5.  **Kill Switch Usage:** Frequency of emergency interventions (should be near zero).

---

## 🚦 Operational Checklist

- [ ] **Day 0:** Verify all Kill Switches are visible in Admin Dashboard.
- [ ] **Day 0:** Confirm `auto_refund_enabled` flag is set correctly for Week 1 (likely `true` but monitored).
- [ ] **Ongoing:** Review `docs/INCIDENT_RESPONSE.md` with the operations team.
- [ ] **Ongoing:** Monitor `fraud_signals` table for false positives.

---

**Note:** This plan prioritizes **learning** over scaling. The architecture allows for turning features on/off and manual intervention—use these capabilities to ensure a safe and smooth V1.
