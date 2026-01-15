# Investor Program — Tests, QA & Rollout Checklist

## Automated tests (to implement)

- POST `/.netlify/functions/investment-create`
  - invalid payload (missing fields, negative amount) returns 400
  - valid payload returns 201 with `id` and status `pending`
  - initial `investor_ledger_entries` row created with `entry_type = 'contribution'` and `balance_after = amount`
- GET `/.netlify/functions/investment-ledger`
  - missing `investment_id` returns 400
  - valid `investment_id` returns ordered ledger entries
- Investment approval flow
  - approving a pending investment sets status to `active` and sets `lock_in_until` (via RPC or direct update)
- Ledger integrity
  - inserting payout entries adjusts `balance_after` correctly
- Revenue share math (if implemented in cron)
  - sample scenario: simulated revenue until target return is reached

## Manual QA checklist (pre-pilot)

- **Invest landing**
  - `/invest` loads from navbar and from direct URL
  - Copy clearly states non-equity, contractual returns, and KYC requirement
  - Links to investor policy and investor pitch work
- **Apply form**
  - `/invest/apply` loads from landing CTA
  - Required fields enforce validation (name, email, amount, plan type, terms checkbox)
  - Submitting with missing terms checkbox shows error
  - Successful submit redirects to `/invest/confirm?id=…`
- **Confirm page**
  - Reference ID is displayed when present
  - Next-steps copy is clear
- **Netlify functions (dev)**
  - `investment-create` reachable from Postman/cURL with sample payload
  - Row appears in `investments` and corresponding ledger entry appears in `investor_ledger_entries`
  - `investment-ledger` returns those entries
- **Admin & accounting (manual for pilot)**
  - Clear internal SOP for:
    - reviewing investor applications
    - sending agreements
    - confirming fund receipts & UTRs
    - marking investments approved/active (even if via SQL console initially)
  - Monthly statement and TDS certificate format defined (even as manual exports)

## Rollout checklist

- Legal counsel has reviewed:
  - `docs/investor-policy.md`
  - `legal/investment-agreement-draft.md`
- Supabase migration `20251119183000_investment_program.sql` applied to dev and staging
- Netlify functions deployed and reachable on staging
- Closed pilot with 2–3 friendly investors:
  - run through full flow: application → KYC → agreement → funding → payout
  - reconcile at least one payout end to end
- Risk & compliance checklist completed (lawyer + CA + banking partner)
- Monitoring set up for errors on investor functions and DB tables
