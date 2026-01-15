# Quick Mela — MVP Brief for Lenders

## Problem
Used-vehicle transactions in India are fragmented and risky. Buyers and sellers face fraud, poor inspection visibility, and manual/WhatsApp deals.

## Solution
Quick Mela is a secure, online auction marketplace for vehicles with KYC, deposits, fraud-risk scoring, and realtime support.

## Product (MVP)
- Role-based web app (Super Admin, Admin, Seller, Buyer, Company)
- Vehicle listings with verification and live/timed auctions
- Token/deposit flows, visit booking, bidding, and payments via Razorpay
- Realtime support chat (Supabase Realtime)
- Admin consoles for verification and live setup

## Why now
- Rapid growth in digital used-vehicle market
- Mature payment rails (UPI/Razorpay) and managed cloud (Supabase/Netlify)

## Business model
- Take rate on successful auctions (1.5–4%)
- Token/listing fees
- Seller premium tools (priority listings, analytics)

## Differentiation
- AI-driven fraud signals and anomaly alerts (roadmap includes explainability)
- Compliance-first approach (RLS, CSP, grievance officer)
- India-first flows (UPI, GST)

## Tech stack
- React + Vite (frontend)
- Netlify Functions (backend)
- Supabase (Postgres, Auth, Realtime, Storage)
- Razorpay (payments)
- Scheduled jobs for risk computation

## Current status (MVP)
- Schema and RLS in place; seed data for all roles
- Admin views, seller dashboard, and support chat functional
- Payments integration ready (Test → Live switch via env)

## Roadmap (3–6 months)
- Personalized recommendations v2 + A/B testing
- Semantic search with hybrid ranking
- Price band heuristic for vehicles
- Image quality/damage heuristics
- Explainable risk and admin review UI
- Anomaly alerts for payments/logins
- In-app AI helper for onboarding FAQs

## Risks and mitigations
- Fraud → scoring + manual review + anomaly alerts
- Payments reconciliation → webhook idempotency + audit logs
- Regulatory → clear T&C, grievance officer, GST compliance

## Funding use
- Go-to-market and seller onboarding
- AI/ML enhancements
- Support and operations
- Compliance readiness and integrations

## Milestones
- 500 listings and 100 successful auctions within 3–4 months of launch
- Partner onboarding (banks/NBFCs) and city expansion
