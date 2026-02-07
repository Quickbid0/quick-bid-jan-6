import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Shell from './Shell';
import { useUnifiedAuth } from '../../context/UnifiedAuthContext';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useUnifiedAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBuyerRoute = location.pathname.startsWith('/buyer/');

  const isPublicRoute = (() => {
    const path = location.pathname;
    if (path.startsWith('/seller/dashboard')) return false;
    if (path.startsWith('/seller/membership')) return false;
    if (path.startsWith('/seller/analytics')) return false;
    if (path === '/') return true;
    if (path.startsWith('/login')) return true;
    if (path.startsWith('/register')) return true;
    if (path.startsWith('/demo')) return true;
    if (path.startsWith('/about')) return true;
    if (path.startsWith('/faq')) return true;
    if (path.startsWith('/contactus')) return true;
    if (path.startsWith('/terms')) return true;
    if (path.startsWith('/privacy')) return true;
    if (path.startsWith('/shipping')) return true;
    if (path.startsWith('/refunds')) return true;
    if (path.startsWith('/help')) return true;
    if (path.startsWith('/legal')) return true;
    if (path.startsWith('/campaign')) return true;
    if (path.startsWith('/links')) return true;
    if (path.startsWith('/mobile-app')) return true;
    if (path.startsWith('/api-docs')) return true;
    if (path.startsWith('/careers')) return true;
    if (path.startsWith('/partnerships')) return true;
    if (path.startsWith('/investors')) return true;
    if (path.startsWith('/investor-marketplace')) return true;
    if (path.startsWith('/trust-safety')) return true;
    if (path.startsWith('/business-solutions')) return true;
    if (path.startsWith('/investor-pitch')) return true;
    if (path.startsWith('/sales')) return true;
    if (path.startsWith('/marketing')) return true;
    if (path.startsWith('/campaigns')) return true;
    if (path.startsWith('/seller/')) return true;
    if (path.startsWith('/product/')) return true;
    if (path.startsWith('/vehicle/')) return true;
    if (path.startsWith('/seized-vehicles')) return true;
    return false;
  })();

  const getShellTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/buyer/dashboard')) return 'Buyer Dashboard';
    if (path.startsWith('/seller/dashboard')) return 'Seller Dashboard';
    if (path.startsWith('/company/dashboard')) return 'Company Dashboard';
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/catalog')) return 'Catalog';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/wallet')) return 'Wallet';
    if (path.startsWith('/watchlist')) return 'Watchlist';
    if (path.startsWith('/my/orders')) return 'My Orders';
    if (path.startsWith('/my/wins')) return 'My Wins';
    if (path.startsWith('/my/won-auctions')) return 'My Won Auctions';
    if (path.startsWith('/my-bids')) return 'My Bids';
    if (path.startsWith('/support')) return 'Support';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/add-product')) return 'Add Product';
    if (path.startsWith('/bulk-upload')) return 'Bulk Upload';
    if (path.startsWith('/live-auction')) return 'Live Auction';
    if (path.startsWith('/timed-auction')) return 'Timed Auction';
    if (path.startsWith('/tender-auction')) return 'Tender Auction';
    if (path.startsWith('/auction-calendar')) return 'Auction Calendar';
    if (path.startsWith('/live-bidding')) return 'Live Bidding';
    if (path.startsWith('/finance')) return 'Finance';
    if (path.startsWith('/invest')) return 'Invest';
    if (path.startsWith('/compliance')) return 'Compliance';
    return 'QuickMela';
  };

  // Admin routes use their own layout
  if (isAdminRoute) {
  }

  // Buyer routes use their own layout (BuyerLayout)
  if (isBuyerRoute) {
    return <>{children}</>;
  }

  // Dashboard routes use Shell layout
  if (location.pathname.startsWith('/dashboard') || 
      location.pathname.startsWith('/profile') ||
      location.pathname.startsWith('/wallet') ||
      location.pathname.startsWith('/watchlist') ||
      location.pathname.startsWith('/my/') ||
      location.pathname.startsWith('/add-product') ||
      location.pathname.startsWith('/bulk-upload') ||
      location.pathname.startsWith('/verify-seller') ||
      location.pathname.startsWith('/seller/') ||
      location.pathname.startsWith('/notifications') ||
      location.pathname.startsWith('/support') ||
      location.pathname.startsWith('/settings')) {
    return (
      <Shell title={getShellTitle()}>
        {children}
      </Shell>
    );
  }

  // Regular routes use the main layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GlobalLayout;