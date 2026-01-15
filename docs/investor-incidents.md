# QuickMela Investor Program — Incident Runbook

This runbook helps operators debug and resolve issues related to the Investor Program (investors, investments, payouts, and notifications).

---

## 1. Components in scope

- **Supabase tables**
  - `public.investors`
  - `public.investments`
  - `public.investor_ledger_entries`

- **Netlify functions**
  - Core:
    - `investor-create`
    - `investment-create`
    - `investment-approve`
    - `investment-ledger`
    - `investment-payout`
  - Email:
    - `investment-application-email`
    - `investment-payout-email`

- **Frontend routes**
  - Investor:
    - `/invest`
    - `/invest/apply`
    - `/invest/confirm`
    - `/invest/dashboard`
  - Admin:
    - `/admin/investments`

---

## 2. Common issues & how to debug

### 2.1 Investor cannot see their investment on `/invest/dashboard`

**Symptoms**
- User reports: "I applied but dashboard shows no investments".

**Checks**
1. In Supabase, check `investors`:
   - `select * from investors where email = '<user-email>';`
   - Confirm there is exactly one row.
2. Check `investments`:
   - `select * from investments where investor_id = '<investor-id>';`
   - Confirm an investment row exists.
3. Check ledger:
   - `select * from investor_ledger_entries where investment_id = '<investment-id>' order by created_at;`
   - Confirm initial `contribution` entry exists.
4. Netlify logs:
   - Look at `investment-create` logs around the time of application for any errors.

**Fixes**
- If investor row missing:
  - Manually insert investor or re-run `investor-create` with correct details.
- If investment row missing:
  - Manually insert based on application data or re-run `investment-create`.
- If ledger missing:
  - Manually insert a `contribution` entry with correct `amount` and `balance_after`.

---

### 2.2 Admin cannot approve investment or approval fails

**Symptoms**
- Approve button on `/admin/investments` shows error toast.
- Netlify log shows errors from `investment-approve`.

**Checks**
1. Netlify logs for `investment-approve`:
   - Look for errors related to Supabase credentials or missing investment.
2. Supabase:
   - `select * from investments where id = '<investment-id>';`
   - Check `status`, `tenure_months`.

**Fixes**
- If investment not found, confirm ID is correct.
- If `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing or wrong in Netlify, fix env vars and redeploy.
- As a last resort, manually update:
  - `update investments set status = 'active', lock_in_until = now() where id = '<investment-id>';`

---

### 2.3 Payout recorded incorrectly or failing

**Symptoms**
- Payout modal saves with error.
- Ledger balances look wrong.

**Checks**
1. Netlify logs for `investment-payout`.
2. Supabase:
   - Last ledger entries:
     - `select * from investor_ledger_entries where investment_id = '<investment-id>' order by created_at desc limit 5;`
   - Confirm `amount` and `balance_after` values.

**Fixes**
- If function fails due to Supabase env, fix `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` on Netlify.
- For incorrect amounts:
  - Insert a correcting `adjustment` entry in ledger with appropriate `amount` and `balance_after`.

> Note: This function **does not** perform real bank transfers; those must be handled by your payout provider.

---

### 2.4 Emails not sending (application or payout)

**Symptoms**
- Investor does not receive application or payout email.

**Checks**
1. Env vars on Netlify:
   - `SENDGRID_API_KEY`
   - `INVESTOR_FROM_EMAIL`
   - `INVESTOR_EMAILS_ENABLED` (should be `true` in environments where you want emails).
2. Netlify logs for:
   - `investment-application-email`
   - `investment-payout-email`
   - and the calling functions:
     - `investment-create` (for application email)
     - `investment-payout` (for payout email)
3. SendGrid dashboard:
   - Check for bounces or blocked addresses.

**Fixes**
- Set or correct env vars and redeploy.
- Ensure `INVESTOR_FROM_EMAIL` is a verified sender in SendGrid.
- For test/staging, add your own email as the recipient for verification.

---

## 3. Monitoring & alerts

### 3.1 Netlify

- Enable function log streaming or set up log drains if available.
- Watch for repeated errors in:
  - `investment-create`
  - `investment-approve`
  - `investment-payout`

### 3.2 Supabase

- Use Supabase logs to monitor:
  - Insert/update failures on `investors`, `investments`, `investor_ledger_entries`.
- Optional: create simple dashboards / saved queries:
  - Investments by `status`.
  - Ledger entries per day.

### 3.3 Business KPIs (manual or BI tool)

- Number of active investments.
- Total investor pool size (`sum(amount)` of active investments).
- Payouts vs expected returns.

---

## 4. Escalation & safety procedures

If an incident affects **money movement or balances**:

1. **Pause new investments**
   - Temporarily disable `/invest/apply` CTA or gate via feature flag.
2. **Pause non-critical payouts**
   - Do not initiate new payouts until ledger issues are understood.
3. **Communicate internally**
   - Notify finance and operations of:
     - Scope of affected investors.
     - Approximate financial impact.
4. **Investigate & fix root cause**
   - Use the checks above (functions, Supabase logs, SendGrid).
   - Write a short post-mortem once resolved.
5. **Resume operations**
   - Re-enable `/invest/apply` and payouts once verified.

---

## 5. Change management

- Any schema or function changes to investor tables / functions should:
  - Be tested in staging with at least one full E2E flow.
  - Be documented in release notes.
  - Include a simple rollback plan (e.g., revert migration or redeploy previous Netlify functions).
