import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import BuyerDashboard from '../pages/DashboardFixed';
import Products from '../pages/Products';
import WatchlistPage from '../pages/WatchlistPage';
import MyOrders from '../pages/MyOrders';
import SavedSearchesPage from '../pages/SavedSearchesPage';
import MyWins from '../pages/MyWins';

const BuyerRoutes: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['buyer']}>
      <Routes>
        <Route path="/dashboard" element={<BuyerDashboard />} />
        <Route path="/auctions" element={<Products />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/saved-searches" element={<SavedSearchesPage />} />
        <Route path="/wins" element={<MyWins />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default BuyerRoutes;
