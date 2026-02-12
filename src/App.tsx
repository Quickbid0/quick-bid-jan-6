import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UnifiedAuthProvider } from './context/UnifiedAuthContext';

// i18n setup
import './i18n';

// Analytics and Error Tracking
import { initAnalytics } from './utils/analytics';
// import * as Sentry from "@sentry/react";

// Production utilities
import { registerServiceWorker, setupErrorReporting, setupAnalytics } from './utils/productionUtils';

// Layout Components
import GlobalLayout from './components/layout/GlobalLayout';
import BuyerLayout from './components/BuyerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/error/RouteErrorBoundary';
import CookieConsent from './components/CookieConsent';
import RoleGuard from './components/RoleGuard';
import SalesProtectedRoute from './components/SalesProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/RegisterFixed'));
const ProductDetail = lazy(() => import('./pages/ProductDetailFixed'));
const Products = lazy(() => import('./pages/ProductsFixed'));
const About = lazy(() => import('./pages/About'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DemoLogin = lazy(() => import('./pages/DemoLogin'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Additional Pages
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Refunds = lazy(() => import('./pages/Refunds'));
const Help = lazy(() => import('./pages/Help'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SeizedVehicles = lazy(() => import('./pages/SeizedVehicles'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const MarketingPage = lazy(() => import('./pages/MarketingPage'));
const SalesLogin = lazy(() => import('./pages/SalesLogin'));
const SalesDashboardPage = lazy(() => import('./pages/SalesDashboardPage'));
const CampaignCreatePage = lazy(() => import('./pages/CampaignCreatePage'));
const CampaignLaunchPage = lazy(() => import('./pages/CampaignLaunchPage'));
const SupportSales = lazy(() => import('./pages/SupportSales'));

// Protected User Pages
const Dashboard = lazy(() => import('./pages/DashboardFixed'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MyWins = lazy(() => import('./pages/MyWins'));
const MyWonAuctions = lazy(() => import('./pages/MyWonAuctions'));
const SavedSearches = lazy(() => import('./pages/SavedSearches'));
const DeliveryPreferences = lazy(() => import('./pages/DeliveryPreferences'));
const WinInvoice = lazy(() => import('./pages/WinInvoice'));
const MyIssueDetail = lazy(() => import('./pages/MyIssueDetail'));
const MyInspections = lazy(() => import('./pages/MyInspections'));
// const AddProduct = lazy(() => import('./pages/AddProductFixed'));
const AuctionPreview = lazy(() => import('./pages/AuctionPreview'));
const ProfilePage = lazy(() => import('./pages/ProfileFixed'));
const VerifySeller = lazy(() => import('./pages/VerifySeller'));
const SellerAnalytics = lazy(() => import('./pages/SellerAnalytics'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboardFixed'));
const SellerMembership = lazy(() => import('./pages/SellerMembership'));
const WinnerConfirmation = lazy(() => import('./pages/WinnerConfirmation'));
const PayForWin = lazy(() => import('./pages/PayForWin'));
const InspectionReport = lazy(() => import('./pages/InspectionReport'));
const ShareVerificationBadge = lazy(() => import('./pages/ShareVerificationBadge'));
const LoanApplyPage = lazy(() => import('./pages/finance/LoanApplyPage'));
const ApplicationStatusPage = lazy(() => import('./pages/finance/ApplicationStatusPage'));
const InsuranceApplyPage = lazy(() => import('./pages/finance/InsuranceApplyPage'));
const InsuranceStatusPage = lazy(() => import('./pages/finance/InsuranceStatusPage'));
const InsuranceDashboard = lazy(() => import('./pages/finance/InsuranceDashboard'));
const InsuranceClaimPage = lazy(() => import('./pages/finance/InsuranceClaimPage'));
const InsuranceClaims = lazy(() => import('./pages/InsuranceClaims'));
const TestPage = lazy(() => import('./pages/TestPage'));

// Company Pages
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const BulkUpload = lazy(() => import('./pages/BulkUploadFixed'));
const CompanyRegistration = lazy(() => import('./pages/CompanyRegistration'));
const CompanyVerificationPending = lazy(() => import('./pages/CompanyVerificationPending'));
const LiveStreamControl = lazy(() => import('./pages/LiveStreamControl'));
const AdminModerationDashboard = lazy(() => import('./components/admin/AdminModerationDashboard'));
// Creative & AI Pages
const CreativeVerification = lazy(() => import('./pages/CreativeVerification'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));

// Auction Type Pages
const TimedAuctionPage = lazy(() => import('./pages/TimedAuctionPage'));
const TenderAuctionPage = lazy(() => import('./pages/TenderAuctionPage'));
// Explicitly resolve to the TypeScript implementation to avoid using the legacy JSX mock
const LiveAuctionPage = lazy(() => import('./pages/LiveAuctionPage.tsx'));
const LiveBidding = lazy(() => import('./pages/LiveBidding'));
const AuctionCalendar = lazy(() => import('./pages/AuctionCalendar'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const BiddingHistory = lazy(() => import('./pages/BiddingHistory'));
const SellerCenter = lazy(() => import('./pages/SellerCenter'));
const TrustSafety = lazy(() => import('./pages/TrustSafety'));
const BusinessSolutions = lazy(() => import('./pages/BusinessSolutions'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const SupportTicketDetail = lazy(() => import('./pages/SupportTicketDetail'));
const AIDashboard = lazy(() => import('./pages/AIDashboard'));

// Public Events Page
const EventsPage = lazy(() => import('./pages/EventsPage'));

// Investor Program Pages
const InvestLanding = lazy(() => import('./pages/InvestLanding'));
const InvestApply = lazy(() => import('./pages/InvestApply'));
const InvestConfirm = lazy(() => import('./pages/InvestConfirm'));
const InvestorDashboard = lazy(() => import('./pages/InvestorDashboard'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));

// Super Admin Pages
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const VerifyEmployee = lazy(() => import('./pages/VerifyEmployee'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const AdminEmployees = lazy(() => import('./pages/admin/AdminEmployees'));
const AdminDepositPolicies = lazy(() => import('./pages/admin/AdminDepositPolicies'));
const PhoneVerification = lazy(() => import('./pages/PhoneVerification'));
const Verification = lazy(() => import('./pages/Verification'));
const TokenCheckout = lazy(() => import('./pages/TokenCheckout'));
const DepositCheckout = lazy(() => import('./pages/DepositCheckout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const VisitBooking = lazy(() => import('./pages/VisitBooking'));
const AdminWinners = lazy(() => import('./pages/admin/AdminWinners'));
const AdminSellerEarnings = lazy(() => import('./pages/admin/AdminSellerEarnings'));
const AdminWinPayments = lazy(() => import('./pages/admin/AdminWinPayments'));
const AdminSellerPayouts = lazy(() => import('./pages/admin/AdminSellerPayouts'));
const AdminPayouts = lazy(() => import('./pages/admin/AdminPayouts'));
const AdminDeliverySlip = lazy(() => import('./pages/admin/AdminDeliverySlip'));
const AdminDepartments = lazy(() => import('./pages/admin/AdminDepartments'));
const AdminBranches = lazy(() => import('./pages/admin/AdminBranches'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'));
const InspectorInspectionsList = lazy(() => import('./pages/inspector/InspectionsList'));
const InspectorInspectionReview = lazy(() => import('./pages/inspector/InspectionReview'));

const CampaignLanding = lazy(() => import('./pages/CampaignLanding'));

// Legal Pages
const GrievanceOfficer = lazy(() => import('./pages/GrievanceOfficer'));
const SocialLinks = lazy(() => import('./pages/SocialLinks'));
const ComplianceTracking = lazy(() => import('./pages/ComplianceTracking'));

// Additional Components
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const MarketAnalytics = lazy(() => import('./pages/MarketAnalytics'));
const PaymentGateway = lazy(() => import('./pages/PaymentGateway'));
const SecurityCenter = lazy(() => import('./pages/SecurityCenter'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));
const MobileApp = lazy(() => import('./pages/MobileApp'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const Careers = lazy(() => import('./pages/Careers'));
const Partnerships = lazy(() => import('./pages/Partnerships'));
const InvestorRelations = lazy(() => import('./pages/InvestorRelations'));
const InvestorMarketplace = lazy(() => import('./pages/InvestorMarketplace'));
const InvestorPitch = lazy(() => import('./pages/InvestorPitch'));

// Scroll to Top on Route Change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Production Readiness Hook
const useProductionEnhancements = () => {
  useEffect(() => {
    // Initialize analytics
    initAnalytics();

    // Initialize Sentry error tracking
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      // Sentry.init({
      //   dsn: import.meta.env.VITE_SENTRY_DSN,
      //   environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',
      //   integrations: [
      //     new Sentry.BrowserTracing({
      //       tracePropagationTargets: [
      //         /^https:\/\/api\.quickbid\.com/,
      //         /^https:\/\/.*\.quickbid\.com/,
      //       ],
      //     }),
      //     new Sentry.Replay({
      //       maskAllText: true,
      //       blockAllMedia: true,
      //     }),
      //   ],
      //   tracesSampleRate: 0.1,
      //   replaysSessionSampleRate: 0.1,
      //   replaysOnErrorSampleRate: 1.0,
      //   beforeSend(event) {
      //     // Filter out non-production errors in production
      //     if (import.meta.env.PROD && event.exception) {
      //       return event;
      //     }
      //     return event;
      //   },
      // });

      console.log('✅ Sentry error tracking temporarily disabled - package not installed');
    }

    // Initialize production utilities
    if (import.meta.env.PROD) {
      registerServiceWorker();
      setupErrorReporting();
      // Setup analytics
      setupAnalytics();

      // Performance monitoring
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log performance metrics in production
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          } else if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        console.log('Performance monitoring not supported');
      }

      // Security: Prevent right-click in production
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Security: Prevent certain keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent F12, Ctrl+Shift+I, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      // Production-specific console warnings
      console.log('%c🚀 QuickMela Production Mode', 'color: #2563eb; font-size: 16px; font-weight: bold;');
      console.log('%cThis is a production build. Some features may be restricted for security.', 'color: #64748b;');

      // Cleanup
      return () => {
        observer.disconnect();
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);
};

const App: React.FC = () => {
  // Initialize production enhancements
  useProductionEnhancements();
  return (
    <UnifiedAuthProvider>
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-indigo-600 focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to main content</a>
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalLayout>
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
              <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<RouteErrorBoundary routeName="Landing"><LandingPage /></RouteErrorBoundary>} />
                  <Route path="/login" element={<RouteErrorBoundary routeName="Login"><Login /></RouteErrorBoundary>} />
                  <Route path="/register" element={<RouteErrorBoundary routeName="Register"><Register /></RouteErrorBoundary>} />
                  <Route path="/demo" element={<RouteErrorBoundary routeName="Demo Login"><DemoLogin /></RouteErrorBoundary>} />
                  <Route path="/unauthorized" element={<RouteErrorBoundary routeName="Unauthorized"><Unauthorized /></RouteErrorBoundary>} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/product/:id" element={<RouteErrorBoundary routeName="Product Detail"><ProductDetail /></RouteErrorBoundary>} />
                  <Route path="/seller/:id" element={<RouteErrorBoundary routeName="Seller Profile"><SellerProfile /></RouteErrorBoundary>} />
                  <Route path="/about" element={<RouteErrorBoundary routeName="About"><About /></RouteErrorBoundary>} />
                  <Route path="/faq" element={<RouteErrorBoundary routeName="FAQ"><FAQ /></RouteErrorBoundary>} />
                  <Route path="/contactus" element={<RouteErrorBoundary routeName="Contact Us"><ContactUs /></RouteErrorBoundary>} />
                  <Route path="/terms" element={<RouteErrorBoundary routeName="Terms"><Terms /></RouteErrorBoundary>} />
                  <Route path="/privacy" element={<RouteErrorBoundary routeName="Privacy"><Privacy /></RouteErrorBoundary>} />
                  <Route path="/shipping" element={<RouteErrorBoundary routeName="Shipping"><Shipping /></RouteErrorBoundary>} />
                  <Route path="/refunds" element={<RouteErrorBoundary routeName="Refunds"><Refunds /></RouteErrorBoundary>} />
                  <Route path="/grievance" element={<RouteErrorBoundary routeName="Grievance Officer"><GrievanceOfficer /></RouteErrorBoundary>} />
                  <Route path="/help" element={<RouteErrorBoundary routeName="Help"><Help /></RouteErrorBoundary>} />
                  <Route path="/campaigns" element={<RouteErrorBoundary routeName="Campaigns"><CampaignsPage /></RouteErrorBoundary>} />
                  <Route path="/campaigns/new" element={<RouteErrorBoundary routeName="Campaign Create"><CampaignCreatePage /></RouteErrorBoundary>} />
                  <Route path="/campaigns/launch" element={<RouteErrorBoundary routeName="Campaign Launch"><CampaignLaunchPage /></RouteErrorBoundary>} />
                  <Route path="/sales" element={<RouteErrorBoundary routeName="Sales"><SalesPage /></RouteErrorBoundary>} />
                  <Route path="/sales/login" element={<RouteErrorBoundary routeName="Sales Login"><SalesLogin /></RouteErrorBoundary>} />
                  <Route path="/sales/dashboard" element={<RouteErrorBoundary routeName="Sales Dashboard"><SalesProtectedRoute><SalesDashboardPage /></SalesProtectedRoute></RouteErrorBoundary>} />
                  <Route path="/top-sellers" element={<RouteErrorBoundary routeName="Seller Center"><SellerCenter /></RouteErrorBoundary>} />
                  <Route path="/marketing" element={<RouteErrorBoundary routeName="Marketing"><MarketingPage /></RouteErrorBoundary>} />
                  {/* Legal Routes */}
                  <Route path="/campaign/:source?" element={<CampaignLanding />} />
                  <Route path="/links" element={<SocialLinks />} />
                  <Route path="/seized-vehicles" element={<SeizedVehicles />} />
                  <Route path="/vehicle/:id" element={<VehicleDetail />} />
                  <Route path="/verify/employee/:token" element={<VerifyEmployee />} />
                  <Route path="/scan" element={<QRScanner />} />
                  <Route path="/inspection-report/:inspectionId" element={<InspectionReport />} />
                  <Route path="/share/verification/:inspectionId" element={<ShareVerificationBadge />} />
                  <Route path="/verify-phone" element={<ProtectedRoute><PhoneVerification /></ProtectedRoute>} />
                  <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
                  <Route path="/checkout/token" element={<ProtectedRoute><TokenCheckout /></ProtectedRoute>} />
                  <Route path="/checkout/deposit/:productId" element={<ProtectedRoute><DepositCheckout /></ProtectedRoute>} />
                  <Route path="/visit/:productId?" element={<ProtectedRoute><VisitBooking /></ProtectedRoute>} />
                  <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                  <Route path="/payment/failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
                  <Route path="/delivery-preferences/:auctionId" element={<ProtectedRoute><DeliveryPreferences /></ProtectedRoute>} />
                  <Route path="/invoice/:auctionId" element={<ProtectedRoute><WinInvoice /></ProtectedRoute>} />
                  <Route path="/finance/loans/apply" element={<ProtectedRoute><LoanApplyPage /></ProtectedRoute>} />
                  <Route path="/finance/loans/:id" element={<ProtectedRoute><ApplicationStatusPage /></ProtectedRoute>} />
                  <Route path="/finance/insurance/apply" element={<ProtectedRoute><InsuranceApplyPage /></ProtectedRoute>} />
                  <Route path="/finance/insurance/:id" element={<ProtectedRoute><InsuranceStatusPage /></ProtectedRoute>} />
                  <Route path="/finance/insurance/dashboard" element={<ProtectedRoute><InsuranceDashboard /></ProtectedRoute>} />
                  <Route path="/finance/insurance/claim" element={<ProtectedRoute><InsuranceClaims /></ProtectedRoute>} />
                  <Route path="/finance/insurance/claim/:policyId" element={<ProtectedRoute><InsuranceClaimPage /></ProtectedRoute>} />
 

              {/* Protected User Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <AIDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/buyer/dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <BuyerLayout>
                      <Dashboard />
                    </BuyerLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/buyer/auctions" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <BuyerLayout>
                      <Products />
                    </BuyerLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/buyer/watchlist" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <BuyerLayout>
                      <WatchlistPage />
                    </BuyerLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/buyer/saved-searches" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <BuyerLayout>
                      <SavedSearches />
                    </BuyerLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/buyer/orders" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                    <BuyerLayout>
                      <MyOrders />
                    </BuyerLayout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/my/won-auctions" element={<ProtectedRoute><MyWonAuctions /></ProtectedRoute>} />
              <Route path="/my/issues/:issueId" element={<ProtectedRoute><MyIssueDetail /></ProtectedRoute>} />
              <Route path="/seller/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/membership" element={<ProtectedRoute><SellerMembership /></ProtectedRoute>} />
              <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
              <Route path="/company/register" element={<CompanyRegistration />} />
              <Route path="/company/verification-pending" element={<ProtectedRoute><CompanyVerificationPending /></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><ComplianceTracking /></ProtectedRoute>} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/my-bids" element={<ProtectedRoute><BiddingHistory /></ProtectedRoute>} />
              <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
              <Route path="/my/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/my/inspections" element={<ProtectedRoute><MyInspections /></ProtectedRoute>} />
              <Route
                path="/inspector"
                element={
                  <ProtectedRoute>
                    <RoleGuard allow={['inspector', 'admin']}>
                      <InspectorInspectionsList />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspector/inspections/:inspectionId"
                element={
                  <ProtectedRoute>
                    <RoleGuard allow={['inspector', 'admin']}>
                      <InspectorInspectionReview />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route path="/my/wins" element={<ProtectedRoute><MyWins /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
              {/* <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} /> */}
              <Route path="/bulk-upload" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />
              <Route path="/verify-seller" element={<ProtectedRoute><VerifySeller /></ProtectedRoute>} />
              <Route path="/seller/analytics" element={<ProtectedRoute><SellerAnalytics /></ProtectedRoute>} />
              <Route path="/creative-verification" element={<ProtectedRoute><CreativeVerification /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
              <Route path="/support/:id" element={<ProtectedRoute><SupportTicketDetail /></ProtectedRoute>} />
              <Route path="/support/sales" element={<SupportSales />} />
              <Route path="/order-tracking/:orderId?" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/winner/:auctionId" element={<ProtectedRoute><WinnerConfirmation /></ProtectedRoute>} />
              <Route path="/pay/:auctionId" element={<ProtectedRoute><PayForWin /></ProtectedRoute>} />
              <Route path="/market-analytics" element={<ProtectedRoute><MarketAnalytics /></ProtectedRoute>} />
              <Route path="/payment-gateway" element={<ProtectedRoute><PaymentGateway /></ProtectedRoute>} />
              <Route path="/security-center" element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsAnalytics /></ProtectedRoute>} />

              {/* Auction Pages */}
              <Route path="/auction-preview" element={<ProtectedRoute><AuctionPreview /></ProtectedRoute>} />
              <Route path="/live-auction/:id?" element={<ProtectedRoute><LiveAuctionPage /></ProtectedRoute>} />
              <Route path="/timed-auction/:id?" element={<ProtectedRoute><TimedAuctionPage /></ProtectedRoute>} />
              <Route path="/tender-auction/:id?" element={<ProtectedRoute><TenderAuctionPage /></ProtectedRoute>} />
              <Route path="/live-bidding/:id?" element={<ProtectedRoute><LiveBidding /></ProtectedRoute>} />
              <Route path="/auction-calendar" element={<ProtectedRoute><AuctionCalendar /></ProtectedRoute>} />
              <Route path="/events" element={<RouteErrorBoundary routeName="Events"><EventsPage /></RouteErrorBoundary>} />
              <Route path="/catalog" element={<RouteErrorBoundary routeName="Catalog"><ProductCatalog /></RouteErrorBoundary>} />
              <Route path="/user/:id" element={<RouteErrorBoundary routeName="User Profile"><UserProfile /></RouteErrorBoundary>} />
              <Route path="/advanced-search" element={<RouteErrorBoundary routeName="Advanced Search"><AdvancedSearch /></RouteErrorBoundary>} />
              <Route path="/bidding-history" element={<ProtectedRoute><BiddingHistory /></ProtectedRoute>} />
              <Route path="/seller-center" element={<ProtectedRoute><SellerCenter /></ProtectedRoute>} />
              <Route path="/invest" element={<RouteErrorBoundary routeName="Invest Landing"><InvestLanding /></RouteErrorBoundary>} />
              <Route path="/invest/apply" element={<RouteErrorBoundary routeName="Invest Apply"><InvestApply /></RouteErrorBoundary>} />
              <Route path="/invest/confirm" element={<RouteErrorBoundary routeName="Invest Confirm"><InvestConfirm /></RouteErrorBoundary>} />
              <Route path="/invest/dashboard" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
              <Route path="/monitoring" element={<ProtectedRoute><MonitoringDashboard /></ProtectedRoute>} />

              {/* Admin Routes - STRICT ADMIN ONLY ACCESS */}
              <Route path="/admin/product-verification/bulk" element={
                <ProtectedRoute adminRequired={true}>
                  <SuperAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/employees" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminEmployees />
                </ProtectedRoute>
              } />
              <Route path="/admin/deposit-policies" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminDepositPolicies />
                </ProtectedRoute>
              } />
              <Route path="/admin/winners" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminWinners />
                </ProtectedRoute>
              } />
              <Route path="/admin/seller-earnings" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminSellerEarnings />
                </ProtectedRoute>
              } />
              <Route path="/admin/win-payments" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminWinPayments />
                </ProtectedRoute>
              } />
              <Route path="/admin/seller-payouts" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminSellerPayouts />
                </ProtectedRoute>
              } />
              <Route path="/admin/payouts" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminPayouts />
                </ProtectedRoute>
              } />
              <Route path="/admin/delivery-slip" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminDeliverySlip />
                </ProtectedRoute>
              } />
              <Route path="/admin/departments" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminDepartments />
                </ProtectedRoute>
              } />
              <Route path="/admin/branches" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminBranches />
                </ProtectedRoute>
              } />
              <Route path="/admin/staff" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminStaff />
                </ProtectedRoute>
              } />
              <Route path="/admin/live-stream-control" element={
                <ProtectedRoute adminRequired={true}>
                  <LiveStreamControl />
                </ProtectedRoute>
              } />
              <Route path="/admin/moderation" element={
                <ProtectedRoute adminRequired={true}>
                  <AdminModerationDashboard />
                </ProtectedRoute>
              } />

              {/* Public Pages */}
              <Route path="/mobile-app" element={<MobileApp />} />
              <Route path="/api-docs" element={<APIDocumentation />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path="/investors" element={<InvestorRelations />} />
              <Route path="/investor-marketplace" element={<InvestorMarketplace />} />
              <Route path="/trust-safety" element={<TrustSafety />} />
              <Route path="/business-solutions" element={<BusinessSolutions />} />
              <Route path="/investor-pitch" element={<InvestorPitch />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </GlobalLayout>
      <CookieConsent />
      <PWAInstallPrompt />
    </UnifiedAuthProvider>
  );
};

export default App;
