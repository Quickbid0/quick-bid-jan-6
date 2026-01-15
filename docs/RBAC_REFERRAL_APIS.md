# RBAC & Referral APIs Overview

This document summarizes the new RBAC and referral APIs, Netlify wallet functions, and key frontend flows.

---

## 1. RBAC (Mongo / Express)

Base path (backend service): `/api/rbac`

### 1.1 Models

- `Role` – system and business roles (e.g. `super_admin`, `admin`, `finance_manager`, `ai_fraud_officer`).
- `Permission` – granular permission keys (e.g. `rbac.roles.manage`, `referral.settings.manage`).
- `RolePermission` – mapping of roles to permissions.
- `UserRole` – assigns roles to Supabase users with optional scope.
- `ActivityLog` – audit log for future use.

### 1.2 Key Endpoints

- `GET /api/rbac/roles`
  - List all roles.

- `POST /api/rbac/roles` *(requires `rbac.roles.manage`)*
  - Create new role.

- `PUT /api/rbac/roles/:id` *(requires `rbac.roles.manage`)*
  - Update role.

- `DELETE /api/rbac/roles/:id` *(requires `rbac.roles.manage`)*
  - Delete role.

- `GET /api/rbac/permissions`
  - List all permissions.

- `POST /api/rbac/roles/:roleId/permissions` *(requires `rbac.permissions.manage`)*
  - Assign permissions to role.

- `DELETE /api/rbac/roles/:roleId/permissions/:permissionId` *(requires `rbac.permissions.manage`)*
  - Remove permission from role.

- `GET /api/rbac/users/:userId/roles` *(requires `rbac.user_roles.manage`)*
  - Get roles for a user.

- `POST /api/rbac/users/:userId/roles` *(requires `rbac.user_roles.manage`)*
  - Assign a role to a user (with optional scope fields).

- `PUT /api/rbac/users/:userId/roles/:userRoleId` *(requires `rbac.user_roles.manage`)*
  - Update a user-role mapping.

- `DELETE /api/rbac/users/:userId/roles/:userRoleId` *(requires `rbac.user_roles.manage`)*
  - Remove a user-role mapping.

- `GET /api/rbac/roles/matrix`
  - Returns `{ roles, permissions, rolePermissions }` for building a matrix UI.

### 1.3 Seeding

From `quickbid-backend/`:

```bash
npm run seed:rbac
```

Seeds:

- Roles: `super_admin`, `admin`, `finance_manager`, `ai_fraud_officer`.
- Permissions: RBAC + referral + wallet-referral view.
- Mappings matching intended responsibilities.

---

## 2. Referral System (Mongo / Express)

Base path: `/api/referral` for user-facing, `/api/admin/referral` for admin.

### 2.1 Supabase linkage

Supabase `profiles` table has:

- `referrer_user_id uuid references profiles(id)`
- `referrer_agent_id uuid references profiles(id)`

Backend uses these via `getReferrerForUser(userId)` to determine:

- `source: 'user' | 'agent'`
- `referrerUserId`.

### 2.2 User-Facing Referral APIs

- `POST /api/referral/apply-first-deposit-bonus`
  - Body:
    ```json
    {
      "userId": "<supabase-user-id>",
      "depositAmount": 1000,
      "walletTransactionId": "wallet_topup_...",
      "deviceId": "optional",
      "ipAddress": "optional"
    }
    ```
  - Behavior:
    - Ensures first deposit via `FirstDepositTracking`.
    - Looks up referrer (user or agent).
    - Applies `ReferralBonusRule` for `first_deposit` or `agent_first_deposit`.
    - Creates `ReferralBonusHistory` row when eligible.
    - If `autoCredit = true` and not flagged as fraud, calls `wallet-credit` Netlify function and marks status `credited` on success.

- `POST /api/referral/apply-first-bid-bonus`
  - Body:
    ```json
    {
      "userId": "<supabase-user-id>",
      "bidId": "<bid-row-id>",
      "deviceId": "optional",
      "ipAddress": "optional"
    }
    ```
  - Similar behavior for `first_bid` / `agent_first_bid` rules.

- `GET /api/referral/bonus/history?userId=<referrerId>`
  - Returns all `ReferralBonusHistory` rows where `referrerUserId = userId`, sorted newest first.

### 2.3 Admin Referral APIs (RBAC-protected)

All under `/api/admin/referral` and require RBAC permissions:

- `GET /api/admin/referral/bonus/history`
  - Permissions: `referral.history.view_all`.
  - Query params:
    - `status` – `pending|approved|rejected|frozen|credited`.
    - `source` – `user|agent`.
    - `eventType` – `first_deposit|first_bid`.
    - `referrerUserId` – exact match.
    - `referredUserId` – exact match.
    - `from`, `to` – ISO datetimes; applied to `createdAt` range.
    - `searchTerm` – case-insensitive regex across `referrerUserId` and `referredUserId`.
    - `limit`, `offset` – pagination (limit max 200).
  - Response:
    ```json
    { "items": [ ...ReferralBonusHistory... ], "total": 123 }
    ```

- `PATCH /api/admin/referral/bonus/:id/status`
  - Permissions: `referral.payout.approve`.
  - Body:
    ```json
    { "status": "approved" | "rejected" | "credited", "reason": "optional" }
    ```
  - Sets `status`, optional `reason`, and `approvedBy` (for approved/credited).

- `PATCH /api/admin/referral/bonus/:id/freeze`
  - Permissions: `referral.bonus.freeze`.
  - Body:
    ```json
    { "frozen": true | false, "fraudNotes": "optional" }
    ```
  - Sets:
    - If `frozen = true`: `status = 'frozen'`, `flaggedFraud = true`, `frozenBy = current user`.
    - If `frozen = false`: `status = 'pending'`, `flaggedFraud = false`.

- `PUT /api/admin/referral/bonus/settings`
  - Permissions: `referral.settings.manage`.
  - Upserts `ReferralBonusRule` per `type`.

### 2.4 Fraud & Abuse Rules

Implemented in `referral.service.ts`:

- **Device/IP heuristic** (`detectReferralFraud`):
  - Looks at `ReferralBonusHistory` in the last 24 hours (`createdAt >= now - 24h`).
  - If there are **≥ 2** entries with the same `deviceId` or `ipAddress`:
    - New bonus is created with:
      - `status = 'frozen'`
      - `approvalMode = 'manual'`
      - `flaggedFraud = true`
      - `fraudNotes` and `reason` describing the device/IP.
    - No auto-credit is attempted.

- **Per-referrer daily cap** (`referrerDailyCapExceeded`):
  - Counts bonus rows for `referrerUserId` with `createdAt >= startOfDay`.
  - If **≥ 10** in the current day:
    - No `ReferralBonusHistory` is created.
    - `FirstDepositTracking` / `FirstBidTracking` is marked `usedForBonus: true`.
    - Functions return `{ applied: false, reason: 'referrer_daily_cap' }`.

### 2.5 Reason Codes

Representative `reason` values returned from referral service functions:

- `already_used`
- `no_referrer`
- `no_rule`
- `below_min_deposit`
- `zero_bonus`
- `referrer_daily_cap`
- Device/IP fraud message like:
  - `High referral bonus volume from deviceId ... / ip ...`

These are visible in `ReferralBonusHistory.reason` and now displayed in admin UIs.

---

## 3. Netlify Wallet Functions

All under `/.netlify/functions/...`:

- `wallet-deposit-webhook`
  - Body:
    ```json
    {
      "userId": "<supabase-user-id>",
      "amountCents": 100000,
      "paymentRef": "payment_intent_...",
      "metadata": {"source": "wallet_page_topup"}
    }
    ```
  - Creates/updates `wallet_accounts` and writes a `DEPOSIT` entry in `wallet_ledger`.

- `wallet-balance?userId=...`
  - Returns `{ walletId?, balanceCents, currency? }`.

- `wallet-ledger?userId=...&limit=&offset=`
  - Returns `{ entries, total }` from `wallet_ledger` for the user’s wallet.

- `wallet-credit`
  - Used by referral auto-credit.
  - Body:
    ```json
    {
      "userId": "<referrer-user-id>",
      "amountCents": 5000,
      "currency": "INR",
      "refType": "referral_bonus" | "agent_referral_bonus",
      "refId": "<ReferralBonusHistory _id>",
      "meta": { "eventType": "first_deposit" | "first_bid", "source": "user" | "agent" }
    }
    ```
  - Writes a `CREDIT` ledger entry and updates `wallet_accounts.current_balance_cents`.

---

## 4. Frontend Integration Points

### 4.1 First Deposit Flow (Wallet Page)

- **Component**: `src/pages/WalletPage.tsx`
- `handleAddMoney`:
  - Validates amount and session.
  - Calls `wallet-deposit-webhook` Netlify function.
  - Refreshes UI using `wallet-balance`.
  - Fire-and-forget:
    - `POST /api/referral/apply-first-deposit-bonus` with `{ userId, depositAmount, walletTransactionId }`.

### 4.2 First Bid Flow (Auction Service)

- **File**: `src/services/auctionService.ts`
- After a successful bid insert and notifications:
  - Fire-and-forget:
    - `POST /api/referral/apply-first-bid-bonus` with `{ userId, bidId }`.

### 4.3 Wallet UI – Referral Bonuses

- **File**: `src/pages/WalletPage.tsx`
- On load (for logged-in user):
  - Calls `GET /api/referral/bonus/history?userId=<currentUserId>`.
  - Maps entries to show:
    - Amount.
    - Status (`pending|approved|credited|frozen|rejected`).
    - Event type (`first_deposit` vs `first_bid`).
    - Source (`user` vs `agent`).
    - Created timestamp.
    - (After latest changes) fraud flags and reasons.

### 4.4 Admin UI – Referral Bonuses

- **File**: `src/pages/admin/AdminReferralBonuses.tsx`
- Route: `/admin/referrals` (behind `ProtectedRoute` with `adminRequired`).
- Features:
  - Filters:
    - Status, event type, source.
    - Date range (`from`, `to`).
    - Search term (search on referrer and referred user IDs).
  - Table columns:
    - Event (type, source, approvalMode).
    - Amount.
    - Users (referrer / referred IDs).
    - Status (with badges), fraud flag, and `reason` text.
    - Created timestamp.
    - Actions: Approve, Reject, Mark Credited, Freeze/Unfreeze.

This doc should give developers and ops a concise overview of how RBAC and the referral system are wired end-to-end.
