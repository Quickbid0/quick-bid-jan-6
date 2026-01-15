# QuickBid - Multi-Auction Platform

A comprehensive auction platform featuring Live, Timed, and Tender auctions with real-time bidding, AI recommendations, and advanced features.

## 🚀 Features

### Auction Types
- **Live Auctions**: Real-time bidding with live streaming
- **Timed Auctions**: Traditional time-based auctions
- **Tender Auctions**: Sealed bid tenders for bulk/commercial items

### Core Features
- ✅ Multi-role authentication (Buyer, Seller, Company, Admin)
- ✅ Real-time bidding system
- ✅ Digital wallet integration
- ✅ AI-powered recommendations
- ✅ Live streaming support
- ✅ Advanced search & filters
- ✅ Watchlist & notifications
- ✅ Seller analytics dashboard
- ✅ Admin moderation panel
- ✅ Mobile responsive design

## 🎯 Live Auction → Deposit → Bid Flow

1. **User lands on `/live-auction/:id`** → `LiveAuctionPage` lazily renders `LiveAuctionRoom` alongside the socket hook (`useLiveAuctionSocket`). The hook joins the auction room via `socket.emit('join-auction', …)` and starts listening for overlays, bid status, deposit requirements, and auction end (`@src/hooks/useLiveAuctionSocket.ts#19-121`).
2. **Server publishes `deposit-required`** when the bidder lacks the minimum verified deposit. The hook stores that payload and renders `DepositBanner` (`@src/modules/live/DepositBanner.tsx#1-42`) which either directs the user to the deposit modal or lets them dismiss the notice.
3. **User opens deposit modal** → `DepositFlowModal` (mock flow) calculates the required amount, calls `depositService.initiateDeposit` (`/deposits/initiate`), and polls `depositService.getDepositStatus` (`/deposits/{depositId}/status`) until Supabase/Netlify backend marks it `verified` or timeout occurs (`@src/modules/live/DepositFlowModal.tsx#11-143`).
4. **Once verified**, the hook clears `depositRequired`, `DepositBanner` disappears, and bidding controls stay enabled. The `placeBid` helper emits `place-bid` with idempotency metadata and the backend broadcasts overlays (`bid-overlay`, `new-bid`, etc.).

```
LiveAuctionPage → LiveAuctionRoom
 └─ useLiveAuctionSocket (join-auction, deposit-required, overlays)
      ├─ deposit-required → DepositBanner → DepositFlowModal
      │     ├─ depositService.initiateDeposit → POST /deposits/initiate
      │     └─ Poll /deposits/{depositId}/status -> on "verified" → clearDepositRequired
      └─ placeBid → socket.emit('place-bid') → backend confirms → overlays/new-bid events
```

### Razorpay deposit wiring (implemented)
- **Backend**: `/api/deposits/initiate` now inserts a `public.deposits` row, creates a Razorpay order via `backend/controllers/depositController.ts`, and returns `{ depositId, order, key_id }`. `/api/deposits/:id/status` surfaces the deposit status plus `amountCents`, and `/webhooks/razorpay` verifies signatures (HMAC-SHA256), updates the deposit to `paid` when Razorpay reports `payment.captured`, and emits the existing `events-raw` marketing job for downstream listeners.
- **Frontend**: `DepositFlowModal` (`@src/modules/live/DepositFlowModal.tsx#23-115`) fetches the order details, loads the Razorpay SDK, and opens the checkout window. It now polls `getDepositStatus` with exponential backoff (max 5s delay, 30s cap) once the payment handler runs. UI errors surface Razorpay load failures, payment cancellations, or verification timeouts.
- **Env vars**: Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `LIVE_BACKEND_PORT`, and `DATABASE_URL` in `backend/.env` (or production host). Webhooks must point to `/webhooks/razorpay` and expect raw body capture for signature validation.
- **Next steps**: Ensure webhooks are registered with Razorpay (with live signature secret), monitor `events-raw` job failures, and extend `DepositFlowModal` to surface Razorpay error metadata if needed.

### Categories
- Vehicles (Cars, Motorcycles, Commercial)
- Art & Paintings
- Jewelry & Watches
- Industrial Equipment
- Handmade & Creative items
- Antiques & Collectibles

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime, Socket.io
- **Charts**: Chart.js, Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd quickbid
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SOCKET_URL=wss://your-socket-server.com
VITE_SENDGRID_API_KEY=your-sendgrid-api-key
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-token
VITE_TWILIO_PHONE_NUMBER=your-twilio-phone
```

4. **Database Setup**

Run the migrations in order:
```bash
# Navigate to supabase/migrations/ and run each SQL file
```

Optional: Load seed data for testing:
```bash
# Run seed-data.sql in your Supabase SQL editor
```

5. **Development Server**
```bash
npm run dev
```

6. **Build for Production**
```bash
npm run build
```

## 🔐 User Roles

### Buyer
- Browse and search auctions
- Place bids
- Manage wallet
- View bidding history
- Add items to watchlist

### Seller
- List products for auction
- View analytics
- Manage listings
- Track sales

### Company
- Bulk uploads
- Tender auctions
- Company verification
- Business analytics

### Admin
- User management
- Product verification
- Content moderation
- System settings
- Analytics dashboard

## 📱 Demo Users

You can use the demo login feature to test different user roles:
- Navigate to `/demo` page
- Select a user role (Buyer, Seller, Company, Admin)
- Explore features without registration

## 🌐 Deployment

### Netlify (Recommended)

1. **Connect Repository**
   - Sign up on Netlify
   - Connect your Git repository
   - Select the branch to deploy

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Environment Variables**
   - Add all environment variables from `.env`
   - Ensure VITE_ prefix for Vite variables

4. **Deploy**
   - Netlify will automatically build and deploy
   - Your site will be live at `<your-site>.netlify.app`

### Manual Deploy (Any Static Host)

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to your hosting provider

3. Configure SPA redirects (for React Router):
   - All routes should redirect to `index.html`

## 📊 Database Schema

The application uses a comprehensive schema with:
- User profiles with role-based access
- Products with multiple auction types
- Real-time bidding system
- Wallet & transactions
- Notifications
- AI recommendations
- Analytics & reporting

See `supabase/migrations/` for complete schema.

## 🎨 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Encrypted sensitive data
- Rate limiting
- Input validation
- XSS protection

## 🧪 Testing

Run type checking:
```bash
npm run typecheck
```

Run linter:
```bash
npm run lint
```

## 📄 API Integration

The platform can integrate with:
- Payment gateways (Razorpay, Stripe)
- SMS providers (Twilio)
- Email services (SendGrid)
- Live streaming (custom or third-party)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For support, email support@quickbid.com or join our Slack channel.

## 🚀 Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Payment gateway integration
- [ ] Advanced AI recommendations
- [ ] Video KYC verification
- [ ] Multi-language support
- [ ] Cryptocurrency payments
- [ ] NFT auctions
- [ ] API for third-party integrations

## 📞 Contact

- Website: https://quickbid.com
- Email: info@quickbid.com
- Twitter: @quickbid
- LinkedIn: QuickBid Platform

---

**Built with ❤️ by the QuickBid Team**

## End-to-End Encryption (Client-Side)

- Sensitive profile fields and uploaded files are encrypted on the client using WebCrypto (AES-GCM 256) before storage.
- Keys are derived locally via PBKDF2 and stored wrapped in localStorage per user.

### Environment
Create `.env` with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SERVER_URL=http://localhost:3001
```

### Key Management
- Code: `src/security/crypto.ts`, `src/security/keyring.ts`, `src/security/secureFields.ts`.
- Access helper: `src/security/keyAccess.ts`.

### Notes
- Titles/messages in notifications are decrypted on-device when possible.
- Encrypted blobs carry IV via URL fragment `#iv=...`.
