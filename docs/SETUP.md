# Quick Mela — Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+
- Netlify account (for hosting and serverless)
- Supabase project (Postgres + Auth + Realtime + Storage)
- Razorpay account (Test mode for dev)

## 1) Clone and install
```bash
git clone <your-repo-url>
cd quick-bid-oct
npm install
```

## 2) Local environment
Create `.env` (frontend-only public vars). Do NOT place service-role keys here for commits.

Example:
```env
VITE_SUPABASE_URL=https://<your-supabase-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SITE_URL=http://localhost:3000
VITE_SERVER_URL=wss://your-socket-server.com
```

Backend/serverless envs should be set in Netlify (for prod) or exported in your shell for seeding/dev.

## 3) Apply database migrations
In Supabase Studio → SQL editor, run these files (from supabase/migrations) in order:
1. 20251008120732_initial_schema_complete.sql
2. 20251109030500_orgs_rbac_realtime.sql
3. 20251109164600_employee_verification_and_bidding_guards.sql
4. 20251109181000_profiles_policies_and_storage.sql
5. 20251111123000_fraud_detection.sql
6. 20251111140000_ai_schema.sql
7. 20251111141500_rate_limits.sql
8. 20251113140000_support_chat.sql

Notes:
- "already exists" messages are OK; continue.
- If you used ad-hoc SQL patches during dev, standardize by applying the full set above.

## 4) Seed data (local)
Export required env in your terminal (shell), not in .env:
```bash
export SUPABASE_URL=https://<your-supabase-ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY='<your-service-role-key>'

npm run seed:users
npm run seed:products
npm run seed:seller
```
Test logins:
- superadmin@test.in / Test@12345
- admin@test.in / Test@12345
- seller1@test.in / Test@12345
- buyer1@test.in / Test@12345
- company@test.in / Test@12345

## 5) Run locally
- Static dev server (Vite): `npm run dev`
- Netlify Dev (frontend + functions proxied): `netlify dev`

## 6) Key modules
- Frontend: React + Vite (src/)
- Functions: Netlify (netlify/functions/)
  - razorpay-create-order.ts
  - razorpay-webhook.ts
  - log-fraud-signal.ts
  - risk-score-ml.ts
  - compute-risk.ts (scheduled hourly)
- Database: Supabase (SQL migrations + RLS)
- Chat: Supabase Realtime tables `support_conversations`, `support_messages`

## 7) Roles and RLS (high-level)
- Roles: super_admin, admin, seller, buyer, company in `profiles.role`
- RLS guards:
  - Users read/update their own profile/deposits
  - Admins can manage users/products/chat

## 8) Payments (dev)
- Use Razorpay Test keys locally
- Webhook endpoint for dev via Netlify Dev or a tunnel; check logs in Netlify UI or console

## 9) Troubleshooting
- Seeder column errors → ensure all migrations applied
- Missing env → export `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in shell
- Chat not updating → verify Realtime enabled and CSP allows wss

## 10) Security reminders
- Never commit service-role or secret keys
- Use Netlify environment for production secrets only
