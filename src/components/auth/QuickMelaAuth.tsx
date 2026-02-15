// QuickMela Role-Based Routing Guards
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/UnifiedAuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireVerification?: boolean;
}

export const QuickMelaRoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireVerification = false
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check verification requirements
  if (requireVerification && !user.isVerified) {
    return <Navigate to="/verification-required" replace />;
  }

  return <>{children}</>;
};

// QuickMela Role-Based Layouts
export const SuperAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="flex">
      {/* Super Admin Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
          <p className="text-sm text-gray-600">Platform Control</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/super-admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Dashboard</a>
          <a href="/super-admin/users" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">User Management</a>
          <a href="/super-admin/branches" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Branch Control</a>
          <a href="/super-admin/analytics" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Analytics</a>
          <a href="/super-admin/security" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Security</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  </div>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Branch Admin</h2>
          <p className="text-sm text-gray-600">Local Operations</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Dashboard</a>
          <a href="/admin/sellers" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Seller Management</a>
          <a href="/admin/auctions" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Auction Oversight</a>
          <a href="/admin/deliveries" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Delivery Control</a>
          <a href="/admin/reports" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Reports</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  </div>
);

export const SellerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="flex">
      {/* Seller Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Seller Portal</h2>
          <p className="text-sm text-gray-600">Manage Your Auctions</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/seller/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Dashboard</a>
          <a href="/seller/products" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">My Products</a>
          <a href="/seller/auctions" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Active Auctions</a>
          <a href="/seller/add-product" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Add Product</a>
          <a href="/seller/analytics" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Analytics</a>
          <a href="/seller/wallet" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Wallet</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  </div>
);

export const BuyerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="flex">
      {/* Buyer Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Buyer Portal</h2>
          <p className="text-sm text-gray-600">Find & Bid on Auctions</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/buyer/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Dashboard</a>
          <a href="/buyer/browse" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Browse Auctions</a>
          <a href="/buyer/watchlist" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">My Watchlist</a>
          <a href="/buyer/bids" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">My Bids</a>
          <a href="/buyer/wins" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Won Auctions</a>
          <a href="/buyer/wallet" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Wallet</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  </div>
);

export const DeliveryAgentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="flex">
      {/* Delivery Agent Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Delivery Agent</h2>
          <p className="text-sm text-gray-600">Manage Deliveries</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/delivery/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Dashboard</a>
          <a href="/delivery/assignments" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">My Assignments</a>
          <a href="/delivery/pickups" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Pending Pickups</a>
          <a href="/delivery/deliveries" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">In Transit</a>
          <a href="/delivery/history" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Delivery History</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  </div>
);

export const TelecallerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="flex">
      {/* Telecaller Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Telecaller Portal</h2>
          <p className="text-sm text-gray-600">Lead Management</p>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/telecaller/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Dashboard</a>
          <a href="/telecaller/leads" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">My Leads</a>
          <a href="/telecaller/follow-ups" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Follow-ups</a>
          <a href="/telecaller/subscriptions" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Subscriptions</a>
          <a href="/telecaller/performance" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded">Performance</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  </div>
);
