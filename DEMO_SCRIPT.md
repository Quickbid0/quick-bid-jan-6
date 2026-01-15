# Investor / Stakeholder Demo Script (5-7 Minutes)

## **Goal:** 
Showcase QuickMela as a **Trust-First**, **AI-Powered** Auction Platform that solves the core problem of online auction fraud and scales efficiently.

---

## **Part 1: The Trust Problem (1 Minute)**
**Screen:** `Landing Page` -> `Product Detail Page (e.g., iPhone 15)`

*   **Narrative:** "Online auctions are plagued by trust issues—fake products, shill bidding, and hidden fees. QuickMela solves this with a 'Verification First' architecture."
*   **Action:**
    *   Open a product page.
    *   Hover over the **"Verified Seller"** badge.
    *   Show the **"AI Authenticity Score"** (if visible) or the **"Ownership Verified"** tag.
    *   *Highlight:* "Every item is vetted before a single bid is placed."

## **Part 2: The Seller Experience & AI Verification (2 Minutes)**
**Screen:** `Seller Dashboard` -> `Add Product` -> `Admin Verification Review`

*   **Narrative:** "Let's see how we enforce this trust at scale without hiring an army of moderators. We use AI."
*   **Action:**
    *   Briefly show the clean **Seller Dashboard**.
    *   Switch to **Admin Verification Review** (`/admin/verify-products`).
    *   *Highlight:* The **"AI Risk Score"** and **"Risk Flags"**.
    *   **Click:** "Approve" on a pending item.
    *   *Explain:* "Our AI pre-screens listings for fake images, price anomalies, and stolen descriptions. Humans only review the flagged 10%."

## **Part 3: The Live Auction Adrenaline (2 Minutes)**
**Screen:** `Live Auction Page` (Mobile View if possible, or Desktop with narrow window)

*   **Narrative:** "Once verified, the magic happens. Our real-time bidding engine is built for speed and mobile engagement."
*   **Action:**
    *   Navigate to a **Live Auction**.
    *   Show the **Real-Time Bidding** interface.
    *   **Click:** Place a bid.
    *   *Highlight:* The sticky **"Bid Now"** button (thumb-reachable on mobile).
    *   Mention: "This uses Supabase Realtime for sub-second latency. It scales to thousands of concurrent users."

## **Part 4: Admin Control & Compliance (1 Minute)**
**Screen:** `Admin Dashboard` -> `Product Detail (Admin View)`

*   **Narrative:** "For investors, control and compliance are key. We have granular permission systems built-in."
*   **Action:**
    *   Go to **Admin Product Detail** (`/admin/products/:id`).
    *   Hover over the **"Save Status & Verification"** button.
    *   *Showcase:* The tooltip **"Only Super Admins can change verification status"**.
    *   *Explain:* "We prevent internal fraud with role-based access control (RBAC). Staff can view, but only Super Admins can override critical verification statuses."

## **Part 5: Closing (30 Seconds)**
**Screen:** `Admin Dashboard` (Overview)

*   **Narrative:** "QuickMela isn't just an auction site. It's a trust engine. We've automated safety, optimized for mobile, and built a scalable foundation for high-value transactions."
*   **Call to Action:** "Ready to scale trust?"

---

## **Technical Highlights for Q&A**
*   **Tech Stack:** React, Supabase, Tailwind CSS.
*   **AI:** Custom risk scoring engine (simulated for demo).
*   **Real-time:** WebSockets for instant bid updates.
*   **Security:** Row Level Security (RLS) & Role-Based Access Control (RBAC).
