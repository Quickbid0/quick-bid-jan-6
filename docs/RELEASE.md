# Quick Mela — Release Guide

## 1) Netlify configuration
- Build: configured via `netlify.toml`
- Publish directory: `dist` (Vite)
- Functions directory: `netlify/functions`

## 2) Production environment variables
Set in Netlify Site settings → Build & deploy → Environment.

Functions (backend):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- RAZORPAY_KEY_ID (Live)
- RAZORPAY_KEY_SECRET (Live)
- RAZORPAY_WEBHOOK_SECRET (Live)

Frontend (Vite public):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SITE_URL=https://www.quickbid.com
- VITE_SERVER_URL=wss://<your-socket-server> (if used)

## 3) Security headers & CSP
`netlify.toml` sets strict CSP. Confirm these origins match prod:
- Supabase API + Storage
- wss: for Supabase Realtime
- Razorpay CDN and APIs
- Images (Unsplash/Supabase storage) if used
- https://www.quickbid.com

## 4) Razorpay webhook (Live)
- URL: `https://www.quickbid.com/.netlify/functions/razorpay-webhook`
- Secret: must equal `RAZORPAY_WEBHOOK_SECRET`
- Events: payment.captured, payment.failed, refund.processed
- Verify: check Netlify Functions logs and DB updates in `deposits`/`webhook_events`

## 5) Scheduled job
- `compute-risk` scheduled hourly (Netlify Scheduled Functions)
- Verify in Netlify dashboard logs

## 6) Final smoke in production
- Login as admin/seller/buyer
- Admin → Users, Verify Products, Live Setup render data
- Seller Dashboard shows bids and wallet txns
- Support chat user↔admin realtime
- Payment test (if in Test mode): create order, see webhook processed

## 7) Observability & operations
- Netlify Functions logs for serverless
- Supabase logs and SQL migrations history
- Backups: Supabase automated; export snapshots before large changes

## 8) Compliance (India)
- Grievance page present; contacts updated
- UPI-first (Razorpay) supported
- GST invoices: integrate with Razorpay/ERP provider as needed

## 9) Post-release checklist
- Rotate any test keys
- Lock CSP/CORS to production domain
- Create admin accounts for support staff
- Monitor anomaly/risk logs after first week

## 10) Rollback
- Netlify allows instant rollback to previous deploy
- DB: restore from Supabase backup if required
