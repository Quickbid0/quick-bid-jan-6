/**
 * APP ROUTER CONFIGURATION
 * 
 * CRITICAL: This shows the correct routing structure that FIXES the navigation missing issue
 * 
 * The problem was:
 * - Dashboard rendered without layout wrapper
 * - Routes not properly nested under layout provider
 * - Direct URL access bypassed layout
 * 
 * The solution:
 * - ProtectedRoute wraps all authenticated pages
 * - RoleGuard detects role and applies correct layout
 * - Layout component ALWAYS wraps page content
 * - Direct URL access still gets layout
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { UnauthorizedScreen } from '@/routes/ProtectedRoute';

// Pages
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import NotFound from '@/pages/NotFound';

// Buyer pages
import BrowseAuctions from '@/pages/buyer/BrowseAuctions';
import MyBids from '@/pages/buyer/MyBids';
import WatchList from '@/pages/buyer/WatchList';
import BuyerWallet from '@/pages/buyer/Wallet';
import BuyerActivity from '@/pages/buyer/Activity';
import BuyerSettings from '@/pages/buyer/Settings';

// Seller pages
import ListProduct from '@/pages/seller/ListProduct';
import MyAuctions from '@/pages/seller/MyAuctions';
import SellerRatings from '@/pages/seller/Ratings';
import Settlement from '@/pages/seller/Settlement';
import BrowseAuctions as BrowseForSeller from '@/pages/seller/BrowseAuctions';
import SellerAnalytics from '@/pages/seller/Analytics';
import SellerSettings from '@/pages/seller/Settings';

// Dealer pages
import DealerInventory from '@/pages/dealer/Inventory';
import BulkList from '@/pages/dealer/BulkList';
import DealerAuctions from '@/pages/dealer/Auctions';
import DealerInsights from '@/pages/dealer/Insights';
import DealerPerformance from '@/pages/dealer/Performance';

// Company pages
import TeamManagement from '@/pages/company/Team';
import CompanyInventory from '@/pages/company/Inventory';
import CompanyAuctions from '@/pages/company/Auctions';
import CompanyReports from '@/pages/company/Reports';
import Compliance from '@/pages/company/Compliance';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/Users';
import Moderation from '@/pages/admin/Moderation';
import PlatformAnalytics from '@/pages/admin/Analytics';
import Disputes from '@/pages/admin/Disputes';
import SystemSettings from '@/pages/admin/SystemSettings';
import AuditLog from '@/pages/admin/AuditLog';

// Shared pages
import HelpSupport from '@/pages/shared/HelpSupport';
import SharedSettings from '@/pages/shared/Settings';

/**
 * COMPLETE APP ROUTER
 * 
 * Structure:
 * 1. AuthProvider wraps entire app (provides auth context)
 * 2. Public routes: Login, Signup, NotFound
 * 3. Protected routes wrapped in ProtectedRoute
 * 4. RoleGuard applies correct layout based on user role
 * 5. Page content rendered inside layout
 * 
 * KEY FIX: Layout wraps content, ensuring sidebar/topbar always visible
 */
export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES - No auth required */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedScreen />} />

          {/* AUTHENTICATED ROUTES - Protected, role-based */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <DashboardRedirect />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* BUYER ROUTES */}
          <Route
            path="/dashboard/auctions"
            element={
              <ProtectedRoute requiredRole="buyer">
                <RoleGuard>
                  <BrowseAuctions />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-bids"
            element={
              <ProtectedRoute requiredRole="buyer">
                <RoleGuard>
                  <MyBids />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/watchlist"
            element={
              <ProtectedRoute requiredRole="buyer">
                <RoleGuard>
                  <WatchList />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/wallet"
            element={
              <ProtectedRoute requiredRole="buyer">
                <RoleGuard>
                  <BuyerWallet />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/activity"
            element={
              <ProtectedRoute requiredRole="buyer">
                <RoleGuard>
                  <BuyerActivity />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* SELLER ROUTES */}
          <Route
            path="/dashboard/list-product"
            element={
              <ProtectedRoute requiredRole="seller">
                <RoleGuard>
                  <ListProduct />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-auctions"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <MyAuctions />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ratings"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <SellerRatings />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settlement"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <Settlement />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/browse-auctions"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <BrowseForSeller />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <SellerAnalytics />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* SHARED ROUTES - Available to multiple roles */}
          <Route
            path="/dashboard/help"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <HelpSupport />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <RoleGuard>
                  <SharedSettings />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* DEALER ROUTES */}
          <Route
            path="/dashboard/inventory"
            element={
              <ProtectedRoute requiredRole="dealer">
                <RoleGuard>
                  <DealerInventory />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/bulk-list"
            element={
              <ProtectedRoute requiredRole="dealer">
                <RoleGuard>
                  <BulkList />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/insights"
            element={
              <ProtectedRoute requiredRole="dealer">
                <RoleGuard>
                  <DealerInsights />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/performance"
            element={
              <ProtectedRoute requiredRole="dealer">
                <RoleGuard>
                  <DealerPerformance />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* COMPANY ROUTES */}
          <Route
            path="/dashboard/team"
            element={
              <ProtectedRoute requiredRole="company">
                <RoleGuard>
                  <TeamManagement />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute requiredRole="company">
                <RoleGuard>
                  <CompanyReports />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/compliance"
            element={
              <ProtectedRoute requiredRole="company">
                <RoleGuard>
                  <Compliance />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleGuard>
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleGuard>
                  <UserManagement />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/moderation"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleGuard>
                  <Moderation />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/disputes"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleGuard>
                  <Disputes />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/system-settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleGuard>
                  <SystemSettings />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/audit-log"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleGuard>
                  <AuditLog />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/**
 * DASHBOARD REDIRECT
 * 
 * When user goes to /dashboard, redirect to their role-specific dashboard
 */
function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleRedirects: Record<string, string> = {
    buyer: '/dashboard/auctions',
    seller: '/dashboard/my-auctions',
    dealer: '/dashboard/inventory',
    company: '/dashboard/team',
    admin: '/dashboard/admin',
  };

  const redirectPath = roleRedirects[user.role] || '/dashboard/auctions';
  return <Navigate to={redirectPath} replace />;
}

// Add useAuth import at top
import { useAuth } from '@/context/AuthContext';

export default AppRouter;
