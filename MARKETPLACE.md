## QuickBid – Secure Auctions with End‑to‑End Encryption

### Overview
QuickBid is a modern auction platform featuring live/timed/tender auctions, real‑time bidding, wallet payments, notifications, and rich admin tooling. Sensitive user data and file uploads are encrypted client‑side (AES‑GCM 256) before leaving the device.

### Key Features
- Live, timed, and tender auctions with real‑time updates
- Buyer/seller/company dashboards and admin suite
- Wallet balance, transactions, and simulated payment flows
- Secure client‑side encryption for PII and uploads
- Notifications (encrypted payload support) and activity feeds
- AI‑assisted recommendations and analytics views
- Mobile‑friendly UI with dark mode

### Security & Privacy
- End‑to‑end encryption: profile fields and uploads are encrypted on device using WebCrypto (AES‑GCM 256) and PBKDF2‑derived keys.
- No plaintext sensitive data is stored; decryption occurs only on the client.
- Realtime and notification payloads support encrypted fields and in‑app decryption.

### Configuration
- Environment variables (Vite):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_SERVER_URL (optional, for sockets)

### Permissions
- Network access to `VITE_SUPABASE_URL` (Supabase DB, storage, auth, realtime)
- Optional websocket connection if configured

### What’s Included
- Built production bundle in `dist/`
- Source under `src/` with security modules in `src/security/`
- Netlify configuration (`netlify.toml`) for easy deploy

### Assets
- Icons and artwork in `assets/marketplace/` (SVG, scalable). Replace with your brand if desired.



