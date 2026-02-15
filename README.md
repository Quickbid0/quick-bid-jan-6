# QuickMela - Enterprise Auto Auction Platform

> India's most trusted dealer-based auction platform with embedded fintech capabilities

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-blue.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.12.16-orange.svg)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-2.7.1-green.svg)](https://supabase.com/)

## 🚀 Overview

QuickMela is a comprehensive B2B2C marketplace that combines India's largest dealer auction platform with embedded fintech capabilities. The platform enables verified dealers to sell vehicles through live auctions while providing buyers with instant loan approvals, secure payments, and trust-first purchasing experience.

### 🎯 Key Features

- **Dealer Auctions**: Multi-format auctions (Timed, Flash, Live) with enterprise tools
- **Fintech Integration**: CIBIL-powered credit scoring with bank partnerships
- **Trust Infrastructure**: 200-point vehicle inspections and risk grading
- **Real-Time Bidding**: WebSocket-powered live auctions with instant updates
- **Enterprise SaaS**: Subscription tiers, marketing automation, analytics
- **Secure Payments**: Escrow system with buyer protection guarantee

## 📊 Platform Metrics

- **Active Auctions**: 1,247 with 78% success rate
- **Verified Dealers**: 2,891 with 95% verification rate
- **Monthly GMV**: ₹25Cr potential
- **User Base**: 1.25L active users target
- **Trust Score**: 85+ average inspection scores

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context + Custom Hooks
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts (for analytics)
- **Forms**: React Hook Form + Validation

### Key Components

#### Core Pages
- `/` - Home page with trust messaging and conversion CTAs
- `/auctions` - Auction discovery with advanced filtering
- `/live-bidding` - Real-time auction interface
- `/dealer-dashboard` - Dealer performance management
- `/create-auction-enterprise` - 5-step auction creation wizard
- `/loan-eligibility` - Fintech integration with bank routing
- `/admin-dashboard` - Enterprise oversight and analytics
- `/onboarding` - 5-step user registration with KYC
- `/winner-confirmation` - Post-auction payment and delivery flow

#### Enterprise Features
- **Trust Psychology**: Authority signals, social proof, conversion optimization
- **Risk Management**: CIBIL integration, inspection scoring, escrow payments
- **Dealer Tools**: Bulk operations, analytics, marketing automation
- **Admin Controls**: Platform monitoring, user moderation, compliance
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
