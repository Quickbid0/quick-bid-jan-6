import React from 'react';
import { Navigate } from 'react-router-dom';

// Consolidated: redirect to the single buyer hub to avoid duplication
const MyOrders: React.FC = () => <Navigate to="/my/won-auctions" replace />;

export default MyOrders;
