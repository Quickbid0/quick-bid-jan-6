# QUICKMELA — INCIDENT RESPONSE PLAYBOOK (PRODUCTION)

## 🎯 PURPOSE
Provide a clear, calm, repeatable process to detect, triage, mitigate, and resolve incidents without:
- Financial loss
- User panic
- Internal confusion
- Rash decisions

## 🧑‍🚒 INCIDENT ROLES & RESPONSIBILITIES

| Role | Responsibility |
|------|----------------|
| **Incident Commander (IC)** | Owns decisions, timeline, communication |
| **Admin Operator** | Executes kill switches, admin actions |
| **Support Lead** | Handles user communication & tickets |
| **Engineer on Call** | Fixes root cause |
| **Observer / Scribe** | Logs timeline & decisions |

⚠️ **One Incident Commander only.** No parallel decision-makers.

## 🚦 INCIDENT SEVERITY LEVELS

| Level | Description | Example |
|-------|-------------|---------|
| **SEV-1** | Money, auctions, or security at risk | Double refunds, wrong winner |
| **SEV-2** | Core feature degraded | Live auction lag |
| **SEV-3** | Partial feature failure | AI recommendations down |
| **SEV-4** | Cosmetic / minor UX | Tooltip missing |

---

## 🟥 SEV-1 PLAYBOOK (CRITICAL)

### 🔴 INCIDENT: Auction Winner Incorrect / Ambiguous

**Detect**
- User complaint
- Admin alert
- Audit log mismatch

**Immediate Action (0–2 min)**
1. **Admin**
   - Disable:
     - `ENABLE_LIVE_WEBCAST` (`enable_live_webcast`)
     - `ENABLE_AUTO_BIDDING` (`enable_auto_bidding`)
   - Freeze state
   - **Do NOT** replay winner
   - **Do NOT** retry settlement

2. **Communicate**
   - **Buyer:** "Auction under review. Your funds are safe."
   - **Seller:** "Settlement paused pending verification."

**Resolve**
1. **Engineer checks:**
   - Auction finalization logs
   - Bid timestamps
2. **Admin:**
   - Manually confirm winner
   - Resume payouts

**Post-Incident**
- Write audit note
- Add guard if missing

### 🔴 INCIDENT: Refund Executed Incorrectly

**Detect**
- Payment mismatch
- User ticket
- Reconciliation error

**Immediate Action**
1. Disable `ENABLE_AUTO_REFUNDS` (`auto_refund_enabled`)
2. Stop any retry jobs
3. Lock affected transaction IDs

**Communicate**
- **Buyer:** "Refund delayed due to system verification."
- **Seller:** "Settlement temporarily paused."

**Resolve**
1. Verify escrow state
2. Manual correction
3. Resume refunds only after confirmation

---

## 🟧 SEV-2 PLAYBOOK (MAJOR DEGRADATION)

### 🟠 INCIDENT: Live Auction Lag / Disconnect

**Immediate Action**
1. Admin disables:
   - `ENABLE_LIVE_WEBCAST` (`enable_live_webcast`)
2. Allow bidding only if safe

**UX Expected**
- **Buyer sees:** "Live webcast unavailable"
- Auction still viewable (read-only if needed)

**Resolve**
1. **Engineer checks:**
   - WebSocket health
   - Event queue backlog
2. **Resume:**
   - Re-enable webcast
   - Monitor for 5 minutes

### 🟠 INCIDENT: AI Fraud False Positives Spike

**Immediate Action**
1. Disable:
   - `ENABLE_AI_FRAUD_ACTIONS` (`enable_ai_fraud_actions`)
2. Switch to manual review

**Communicate**
- **Sellers:** "AI review paused. No penalties applied."

**Resolve**
1. Inspect AI signals
2. Adjust thresholds
3. Resume AI actions cautiously

---

## 🟨 SEV-3 PLAYBOOK (NON-BLOCKING)

### 🟡 INCIDENT: AI Recommendations Down

**Action**
1. Disable `ENABLE_AI_RECOMMENDATIONS` (`enable_ai_recommendations`)

**UI shows:**
- "Suggestions temporarily unavailable"

**Resolution**
- No user impact
- Fix async

### 🟡 INCIDENT: Sales Dashboard Metrics Incorrect

**Action**
1. Mark dashboard as "Updating"
2. Do not block core workflows

---

## 🟦 SEV-4 PLAYBOOK (MINOR)

### 🔵 INCIDENT: UI Glitch / Missing Tooltip

**Action**
1. Log issue
2. Fix in next deploy
3. No announcement needed

---

## 📣 COMMUNICATION GUIDELINES (VERY IMPORTANT)

**What to Say**
- Clear
- Calm
- Reassuring
- Time-bound

**What NOT to Say**
- "Bug"
- "Error"
- "Our fault"
- "System crashed"

**Example Template**
> "We’re reviewing a system issue. Your funds and data are safe. We’ll update you shortly."

---

## 🧠 DECISION RULES (MEMORIZE THESE)

1. **Money > UX > Speed**
2. **Disable first, fix second**
3. **Explain always**
4. **Never retry blindly**
5. **One owner per incident**

---

## 🧾 INCIDENT LOG TEMPLATE

```text
Incident ID:
Start Time:
Detected By:
Severity:
Features Disabled:
Users Impacted:
Resolution:
Root Cause:
Preventive Action:
```

---

## 🛡️ PRE-LAUNCH CHECK (DAILY)

Before peak usage:
- [ ] Feature flags verified
- [ ] Admin access working
- [ ] Refund toggle ON
- [ ] Live auction tested
- [ ] Support contacts visible
